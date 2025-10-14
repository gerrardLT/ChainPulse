import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia, bscTestnet } from 'wagmi/chains'
import { defineChain } from 'viem'
import { createStorage } from 'wagmi'

/**
 * 自定义 Monad Testnet 链配置
 */
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { 
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: { 
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Monad Explorer', 
      url: 'https://testnet.monadexplorer.com',
    },
  },
  testnet: true,
})

export const config = getDefaultConfig({
  appName: 'ChainPulse',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [
    monadTestnet,    // 🔥 主要链 - Monad Testnet (默认)
    sepolia,         // Sepolia Testnet
    bscTestnet,      // BSC Testnet
    mainnet,         // Ethereum Mainnet (生产用)
  ],
  ssr: true,
  // 🔥 关键修复：配置持久化存储，保存钱包连接状态
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }),
})

