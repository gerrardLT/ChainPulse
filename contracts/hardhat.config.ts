import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@nomicfoundation/hardhat-verify"
import "hardhat-gas-reporter"
import "solidity-coverage"
import * as dotenv from "dotenv"

dotenv.config()

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.23", // 支持 OpenZeppelin 5.x 和 account-abstraction 0.7
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false, // 关闭以加快编译速度
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY !== undefined
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      chainId: 11155111,
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY !== undefined
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      chainId: 1,
    },
    // Monad 测试网配置
    "monad-testnet": {
      url: process.env.MONAD_TESTNET_RPC_URL || "https://testnet-rpc.monad.xyz",
      accounts: process.env.DEPLOYER_PRIVATE_KEY !== undefined
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      chainId: 10143,
      gasPrice: "auto",
      gas: "auto",
    },
    // BSC 测试网配置（如果需要）
    "bsc-testnet": {
      url: process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: process.env.DEPLOYER_PRIVATE_KEY !== undefined
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      chainId: 97,
      gasPrice: 10000000000, // 10 Gwei
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  mocha: {
    timeout: 100000,
  },
}

export default config

