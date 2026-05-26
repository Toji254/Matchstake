require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const DEPLOYER_ACCOUNTS = /^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY) ? [PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    xlayer_testnet: {
      url: "https://testrpc.xlayer.tech",
      chainId: 195,
      accounts: DEPLOYER_ACCOUNTS,
    },
    xlayer_mainnet: {
      url: "https://rpc.xlayer.tech",
      chainId: 196,
      accounts: DEPLOYER_ACCOUNTS,
    },
    hardhat: { chainId: 31337 },
  },
};
