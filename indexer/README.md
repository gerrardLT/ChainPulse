# ChainPulse Envio Indexer

> 实时索引智能账户事件的 Envio 索引器

## 📋 项目概述

ChainPulse Envio 索引器负责监听和索引智能账户相关的链上事件，将数据存储到 PostgreSQL 数据库，并通过 GraphQL API 提供查询服务。

## 🎯 监听的事件

### SimpleAccountFactory 事件
- `AccountCreated` - 账户创建事件

### SimpleAccount 事件
- `AccountInitialized` - 账户初始化事件
- `AccountExecuted` - 交易执行事件
- `OwnershipTransferred` - 所有权转移事件

## 📊 索引的实体

### 主要实体
1. **SmartAccount** - 智能账户
2. **Transaction** - 交易记录
3. **OwnershipTransfer** - 所有权转移记录

### 统计实体
1. **DailyAccountStats** - 每日账户统计
2. **DailyTransactionStats** - 每日交易统计
3. **GlobalStats** - 全局统计

## 🚀 快速开始

### 前置要求
- Node.js 18+
- Envio CLI (`npm install -g envio`)
- 区块链 RPC URL
- 已部署的智能合约地址

### 安装

```bash
cd indexer
npm install
```

### 配置

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 配置环境变量：
```env
# RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
MAINNET_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY

# 合约地址
FACTORY_ADDRESS_SEPOLIA=0x...
FACTORY_ADDRESS_MAINNET=0x...

# 数据库（Envio 会自动管理）
# DATABASE_URL=postgresql://user:password@localhost:5432/envio
```

### 生成 ABI

从已部署的合约导出 ABI：

```bash
# 在 contracts 目录下
npx hardhat compile

# 复制 ABI 到 indexer/abis
cp artifacts/contracts/SimpleAccountFactory.sol/SimpleAccountFactory.json ../indexer/abis/
cp artifacts/contracts/SimpleAccount.sol/SimpleAccount.json ../indexer/abis/
```

### 本地开发

```bash
# 启动本地索引器
envio dev
```

访问: http://localhost:8080

### 部署到 Envio Cloud

```bash
# 登录
envio login

# 部署
envio deploy
```

## 📡 GraphQL API

### 查询示例

#### 获取所有智能账户
```graphql
query GetSmartAccounts {
  smartAccounts(first: 10, orderBy: createdAt, orderDirection: desc) {
    id
    accountAddress
    owner
    currentOwner
    chainId
    isDeployed
    createdAt
    transactions {
      id
      target
      value
      transactionHash
    }
  }
}
```

#### 根据所有者查询账户
```graphql
query GetAccountsByOwner($owner: String!) {
  smartAccounts(where: { owner: $owner }) {
    id
    accountAddress
    chainId
    createdAt
  }
}
```

#### 获取账户交易历史
```graphql
query GetAccountTransactions($accountId: ID!) {
  smartAccount(id: $accountId) {
    id
    accountAddress
    transactions(orderBy: timestamp, orderDirection: desc) {
      id
      target
      value
      transactionHash
      timestamp
      success
    }
  }
}
```

#### 获取每日统计
```graphql
query GetDailyStats($chainId: Int!, $date: String!) {
  dailyAccountStats(where: { chainId: $chainId, date: $date }) {
    accountsCreated
    totalAccounts
  }
  dailyTransactionStats(where: { chainId: $chainId, date: $date }) {
    transactionCount
    totalValue
    successfulTransactions
  }
}
```

#### 获取全局统计
```graphql
query GetGlobalStats($chainId: Int!) {
  globalStats(where: { chainId: $chainId }) {
    totalAccounts
    totalTransactions
    totalValue
    lastUpdated
  }
}
```

### 订阅示例

```graphql
subscription OnNewAccount {
  smartAccount {
    id
    accountAddress
    owner
    chainId
  }
}

subscription OnNewTransaction {
  transaction {
    id
    smartAccount {
      accountAddress
    }
    target
    value
    transactionHash
  }
}
```

## 📁 项目结构

```
indexer/
├── config.yaml               # Envio 配置文件
├── schema.graphql            # GraphQL Schema 定义
├── src/
│   └── EventHandlers.ts      # 事件处理器
├── abis/                     # 智能合约 ABI
│   ├── SimpleAccountFactory.json
│   └── SimpleAccount.json
└── README.md                 # 本文档
```

## 🔧 事件处理器

### handleAccountCreated
当 `SimpleAccountFactory` 创建新账户时触发。

**功能**:
- 创建 `SmartAccount` 实体
- 更新每日账户统计
- 更新全局统计

### handleAccountInitialized
当账户初始化时触发。

**功能**:
- 初始化或更新 `SmartAccount` 实体
- 记录初始化信息

### handleAccountExecuted
当账户执行交易时触发。

**功能**:
- 创建 `Transaction` 实体
- 更新账户最后更新时间
- 更新每日交易统计
- 更新全局统计

### handleOwnershipTransferred
当账户所有权转移时触发。

**功能**:
- 创建 `OwnershipTransfer` 实体
- 更新账户的当前所有者
- 记录所有权变更历史

## 🧪 测试

### 本地测试

1. 启动本地节点（Hardhat）
2. 部署合约
3. 配置 `config.yaml` 指向本地节点
4. 运行 `envio dev`
5. 触发合约事件
6. 查询 GraphQL API 验证数据

### 测试网测试

1. 部署合约到 Sepolia
2. 配置测试网 RPC 和合约地址
3. 部署索引器
4. 监控日志和数据

## 📊 监控

### Envio Dashboard
访问 Envio Dashboard 查看：
- 索引进度
- 事件处理速度
- 错误日志
- 数据库状态

### 日志
```bash
# 查看索引器日志
envio logs

# 查看特定事件的日志
grep "AccountCreated" envio.log
```

## 🐛 故障排查

### 常见问题

1. **索引器无法启动**
   - 检查 RPC URL 是否正确
   - 检查合约地址是否正确
   - 检查 ABI 文件是否存在

2. **事件未被索引**
   - 检查 `start_block` 配置
   - 确认合约事件已触发
   - 查看错误日志

3. **GraphQL 查询失败**
   - 检查 Schema 定义
   - 确认实体已创建
   - 查看数据库表

### 重置索引器

```bash
# 清除所有数据并重新索引
envio reset
envio dev
```

## 📚 参考文档

- [Envio 官方文档](https://docs.envio.dev)
- [GraphQL 文档](https://graphql.org)
- [ERC-4337 标准](https://eips.ethereum.org/EIPS/eip-4337)

## 🔗 相关链接

- Envio Dashboard: https://envio.dev/app
- GraphQL Playground: http://localhost:8080/graphql (本地)

---

**状态**: ✅ 配置完成，待部署
**最后更新**: 2025-10-11

