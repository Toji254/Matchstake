import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { hardhat } from 'viem/chains';

// X Layer Mainnet
export const xlayer = defineChain({
  id: 196,
  name: 'X Layer',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.xlayer.tech'] },
  },
  blockExplorers: {
    default: { name: 'OKLink', url: 'https://www.oklink.com/xlayer' },
  },
});

// X Layer Testnet
export const xlayerTestnet = defineChain({
  id: 195,
  name: 'X Layer Testnet',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testrpc.xlayer.tech'] },
  },
  blockExplorers: {
    default: { name: 'OKLink', url: 'https://www.oklink.com/xlayer-test' },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [xlayer, xlayerTestnet, hardhat],
  transports: {
    [xlayer.id]: http(),
    [xlayerTestnet.id]: http(),
    [hardhat.id]: http(),
  },
});

