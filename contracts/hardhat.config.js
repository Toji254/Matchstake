require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const DEPLOYER_ACCOUNTS = /^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY) ? [PRIVATE_KEY] : [];
const XLAYER_TESTNET_RPC_URL =
  process.env.XLAYER_TESTNET_RPC_URL || "https://testrpc.xlayer.tech/terigon";
const XLAYER_MAINNET_RPC_URL =
  process.env.XLAYER_MAINNET_RPC_URL || "https://rpc.xlayer.tech";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: { enabled: true, runs: 200 },
          viaIR: true,
        },
      },
      {
        // Uniswap v4-core uses 0.8.26
        version: "0.8.26",
        settings: {
          optimizer: { enabled: true, runs: 200 },
          viaIR: true,
          evmVersion: "cancun",
        },
      },
    ],
  },
  networks: {
    xlayer_testnet: {
      url: XLAYER_TESTNET_RPC_URL,
      chainId: 1952,
      accounts: DEPLOYER_ACCOUNTS,
    },
    xlayer_mainnet: {
      url: XLAYER_MAINNET_RPC_URL,
      chainId: 196,
      accounts: DEPLOYER_ACCOUNTS,
    },
    hardhat: { chainId: 31337 },
  },
};
