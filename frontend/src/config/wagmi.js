import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { mainnet } from 'viem/chains';
import { injected } from 'wagmi/connectors';

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
  id: 1952,
  name: 'X Layer Testnet',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testrpc.xlayer.tech/terigon'] },
    public: { http: ['https://xlayertestrpc.okx.com/terigon'] },
  },
  blockExplorers: {
    default: { name: 'OKLink', url: 'https://www.oklink.com/xlayer-test' },
  },
  testnet: true,
});

// Target chain for the app
export const TARGET_CHAIN = xlayerTestnet;
export const TARGET_CHAIN_ID = xlayerTestnet.id; // 1952

export const wagmiConfig = createConfig({
  chains: [xlayerTestnet, mainnet],
  connectors: [injected()],
  transports: {
    [xlayerTestnet.id]: http('https://testrpc.xlayer.tech/terigon'),
    [mainnet.id]: http(),
  },
});
