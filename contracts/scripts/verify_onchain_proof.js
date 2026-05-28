const fs = require("fs");
const path = require("path");
const https = require("https");

const TESTNET_RPCS = [
  process.env.XLAYER_TESTNET_RPC_URL,
  "https://testrpc.xlayer.tech/terigon",
  "https://xlayertestrpc.okx.com/terigon",
].filter(Boolean);

function readFrontendAddresses() {
  const contractConfigPath = path.join(__dirname, "../../frontend/src/config/contract.js");
  const content = fs.readFileSync(contractConfigPath, "utf8");

  function pick(name) {
    const re = new RegExp(`export const ${name} = '(0x[a-fA-F0-9]{40})'`);
    const m = content.match(re);
    if (!m) throw new Error(`Missing ${name} in frontend/src/config/contract.js`);
    return m[1];
  }

  return {
    poolManager: pick("V4_POOLMANAGER_ADDRESS"),
    hook: pick("V4_HOOK_ADDRESS"),
    matchstake: pick("CONTRACT_ADDRESS"),
  };
}

function rpcCall(url, method, params) {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              return reject(new Error(`${url} :: ${JSON.stringify(parsed.error)}`));
            }
            resolve(parsed.result);
          } catch (e) {
            reject(new Error(`${url} :: invalid JSON response`));
          }
        });
      }
    );
    req.on("error", (e) => reject(new Error(`${url} :: ${e.message}`)));
    req.write(body);
    req.end();
  });
}

function low14Hex(address) {
  const low14 = BigInt(address) & ((1n << 14n) - 1n);
  return `0x${low14.toString(16).padStart(4, "0")}`;
}

async function firstWorkingRpc() {
  const errors = [];
  for (const url of TESTNET_RPCS) {
    try {
      const chainIdHex = await rpcCall(url, "eth_chainId", []);
      if (chainIdHex === "0x7a0") return { url, chainIdHex };
      errors.push(`${url} :: unexpected chain id ${chainIdHex}`);
    } catch (e) {
      errors.push(e.message);
    }
  }
  throw new Error(`No working testnet RPC. Tried:\n- ${errors.join("\n- ")}`);
}

async function main() {
  const addrs = readFrontendAddresses();
  const { url, chainIdHex } = await firstWorkingRpc();

  const entries = [
    ["V4_POOLMANAGER_ADDRESS", addrs.poolManager],
    ["V4_HOOK_ADDRESS", addrs.hook],
    ["CONTRACT_ADDRESS", addrs.matchstake],
  ];

  console.log("RPC:", url);
  console.log("CHAIN_ID:", chainIdHex, "(expected 0x7a0)\n");

  let allPass = true;
  for (const [label, addr] of entries) {
    const code = await rpcCall(url, "eth_getCode", [addr, "latest"]);
    const hasCode = code && code !== "0x";
    const status = hasCode ? "PASS" : "FAIL";
    if (!hasCode) allPass = false;
    console.log(`[${status}] ${label}: ${addr}`);
  }

  const hookBits = low14Hex(addrs.hook);
  const hookBitsPass = hookBits.toLowerCase() === "0x00c0";
  if (!hookBitsPass) allPass = false;
  console.log(`\n[${hookBitsPass ? "PASS" : "FAIL"}] HOOK_LOW14_BITS: ${hookBits} (expected 0x00c0)`);

  if (!allPass) {
    console.error("\nVERIFICATION_RESULT: FAIL");
    process.exit(1);
  }

  console.log("\nVERIFICATION_RESULT: PASS");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
