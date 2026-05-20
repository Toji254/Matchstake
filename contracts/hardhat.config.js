require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    xlayer_testnet: {
      url: "https://testrpc.xlayer.tech",
      chainId: 195,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    xlayer_mainnet: {
      url: "https://rpc.xlayer.tech",
      chainId: 196,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    hardhat: { chainId: 31337 },
  },
};
