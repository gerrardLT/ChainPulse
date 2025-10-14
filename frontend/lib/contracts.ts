/**
 * 合约地址配置
 * ChainPulse - 跨链智能账户合约地址
 */

export interface ChainConfig {
  chainId: number
  name: string
  accountFactory: string
  implementation: string
  entryPoint: string
  rpcUrl: string
  explorerUrl: string
}

/**
 * Monad 测试网配置
 */
export const MONAD_TESTNET: ChainConfig = {
  chainId: 10143,
  name: 'Monad Testnet',
  accountFactory: '0xa600bDf90bc02bff280e15ebf050812222ff1eF3',
  implementation: '0x8d446CC8E67a41715a5a4Efb784A7Cad42BbA68b',
  entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  rpcUrl: 'https://testnet-rpc.monad.xyz',
  explorerUrl: 'https://testnet.monadexplorer.com'
}

/**
 * Sepolia 测试网配置（示例）
 */
export const SEPOLIA_TESTNET: ChainConfig = {
  chainId: 11155111,
  name: 'Sepolia',
  accountFactory: '', // 待部署
  implementation: '',
  entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/',
  explorerUrl: 'https://sepolia.etherscan.io'
}

/**
 * BSC 测试网配置（示例）
 */
export const BSC_TESTNET: ChainConfig = {
  chainId: 97,
  name: 'BSC Testnet',
  accountFactory: '', // 待部署
  implementation: '',
  entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  explorerUrl: 'https://testnet.bscscan.com'
}

/**
 * 所有支持的链配置
 */
export const CONTRACTS: Record<number, ChainConfig> = {
  10143: MONAD_TESTNET,      // Monad Testnet
  11155111: SEPOLIA_TESTNET, // Sepolia
  97: BSC_TESTNET            // BSC Testnet
}

/**
 * 默认链 (Monad Testnet)
 */
export const DEFAULT_CHAIN_ID = 10143
export const DEFAULT_CHAIN = MONAD_TESTNET

/**
 * 根据 Chain ID 获取配置
 */
export function getChainConfig(chainId: number): ChainConfig | undefined {
  return CONTRACTS[chainId]
}

/**
 * 获取所有支持的链
 */
export function getSupportedChains(): ChainConfig[] {
  return Object.values(CONTRACTS)
}

/**
 * 检查链是否支持
 */
export function isChainSupported(chainId: number): boolean {
  return chainId in CONTRACTS
}

/**
 * 获取浏览器地址链接
 */
export function getExplorerAddressUrl(chainId: number, address: string): string {
  const config = getChainConfig(chainId)
  if (!config) return ''
  return `${config.explorerUrl}/address/${address}`
}

/**
 * 获取浏览器交易链接
 */
export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const config = getChainConfig(chainId)
  if (!config) return ''
  return `${config.explorerUrl}/tx/${txHash}`
}

