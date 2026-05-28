const { ethers, network } = require("hardhat");

// Hook permission bits live in the low 14 bits of the hook address.
// We want BEFORE_SWAP (1<<7) and AFTER_SWAP (1<<6) enabled, and nothing else.
const HOOK_MASK_14_BITS = (1n << 14n) - 1n;
const REQUIRED_FLAGS = (1n << 7n) | (1n << 6n); // 0x00C0

function toBigIntHex32(bn) {
  let hex = bn.toString(16);
  if (hex.length > 64) throw new Error("salt too large");
  hex = hex.padStart(64, "0");
  return "0x" + hex;
}

function getCreate2Address(deployer, saltHex, initCodeHash) {
  // keccak256(0xff ++ deployer ++ salt ++ keccak256(init_code))[12:]
  return ethers.getCreate2Address(deployer, saltHex, initCodeHash);
}

async function mineSaltForAddress(deployerAddress, initCodeHash) {
  // brute force salts until low 14 bits match REQUIRED_FLAGS
  // This is deterministic and fast enough in JS for a 14-bit constraint (~16k expected).
  for (let i = 0n; i < 5_000_000n; i++) {
    const saltHex = toBigIntHex32(i);
    const addr = getCreate2Address(deployerAddress, saltHex, initCodeHash);
    const low14 = BigInt(addr) & HOOK_MASK_14_BITS;
    if (low14 === REQUIRED_FLAGS) {
      return { saltHex, addr, tries: i };
    }
  }
  throw new Error("Failed to mine salt in range");
}

async function main() {
  console.log("Deploying Uniswap v4 hook + pool to", network.name, "...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // 1) Deploy v4 PoolManager
  const V4PoolManager = await ethers.getContractFactory("V4PoolManager");
  const poolManager = await V4PoolManager.deploy(deployer.address);
  await poolManager.waitForDeployment();
  const poolManagerAddress = await poolManager.getAddress();
  console.log("PoolManager deployed to:", poolManagerAddress);

  // 2) Deploy a CREATE2 deployer (factory)
  const Create2Deployer = await ethers.getContractFactory("Create2Deployer");
  const create2 = await Create2Deployer.deploy();
  await create2.waitForDeployment();
  const create2Address = await create2.getAddress();
  console.log("Create2Deployer deployed to:", create2Address);

  // 3) Deploy a mock ERC20 (we'll pair it with native OKB, i.e. Currency(address(0)))
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const token = await MockERC20.deploy("MatchStake Demo Token", "MSD", 18);
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("Mock token:", tokenAddr);

  // Ensure currency0 < currency1. Native currency is address(0), which will always sort first.
  const currency0 = ethers.ZeroAddress;
  const currency1 = tokenAddr;

  // 4) Mine a salt so the hook's deployed address has correct low bits (beforeSwap + afterSwap)
  const Hook = await ethers.getContractFactory("FanLiquidityHookV4");
  const hookInitCode =
    Hook.bytecode +
    Hook.interface
      .encodeDeploy([poolManagerAddress, deployer.address, deployer.address, ethers.ZeroAddress])
      .slice(2);
  const hookInitCodeHash = ethers.keccak256(hookInitCode);

  console.log("\nMining CREATE2 salt for hook permission bits...");
  const mined = await mineSaltForAddress(create2Address, hookInitCodeHash);
  console.log("Mined salt:", mined.saltHex, "hook:", mined.addr, "tries:", mined.tries.toString());

  // 5) Deploy the hook at the mined address
  const txDeployHook = await create2.deploy(mined.saltHex, hookInitCode);
  const receiptHook = await txDeployHook.wait();
  console.log("Hook deployed tx:", receiptHook.hash);
  const hookAddress = mined.addr;
  console.log("FanLiquidityHookV4 deployed to:", hookAddress);

  // 6) Initialize a real v4 pool that references the hook address.
  // Use dynamic-fee sentinel (0x800000).
  const DYNAMIC_FEE_FLAG = 0x800000;
  const tickSpacing = 60;
  const poolKey = {
    currency0,
    currency1,
    fee: DYNAMIC_FEE_FLAG,
    tickSpacing,
    hooks: hookAddress,
  };

  // 1:1 price => sqrtPriceX96 = 2^96
  const sqrtPriceX96 = 2n ** 96n;

  console.log("\nInitializing pool...");
  const txInit = await poolManager.initialize(poolKey, sqrtPriceX96);
  const rcInit = await txInit.wait();
  console.log("Pool initialized tx:", rcInit.hash);

  // 7) Configure the hook for this pool (match/room IDs) so it’s demonstrably “connected”
  const hook = await ethers.getContractAt("FanLiquidityHookV4", hookAddress);
  const txCfg = await hook.configurePool(poolKey, 1, 1, 12500);
  await txCfg.wait();
  console.log("Hook configured for pool (matchId=1 roomId=1 multiplier=1.25x)");

  // 8) Print submission-ready addresses
  console.log("\n==========================================");
  console.log("V4 PoolManager:", poolManagerAddress);
  console.log("V4 Hook:", hookAddress);
  console.log("Pool currencies:", { currency0, currency1 });
  console.log("Pool fee:", "DYNAMIC (0x800000)");
  console.log("==========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

