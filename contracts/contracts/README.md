# Contracts 智能合约源码

## 📋 功能说明

存放所有 Solidity 智能合约源码，包括账户合约、自动化合约、接口定义和测试用模拟合约。

## 📁 目录结构

```
contracts/
├── account/                 # 智能账户合约
│   ├── ChainPulseAccount.sol
│   ├── ChainPulseAccountFactory.sol
│   └── ChainPulsePaymaster.sol
│
├── automation/             # 自动化执行合约
│   ├── AutomationExecutor.sol
│   └── ConditionChecker.sol
│
├── interfaces/             # 接口定义
│   ├── IChainPulseAccount.sol
│   └── IAutomationExecutor.sol
│
└── mocks/                  # 测试用模拟合约
    ├── MockERC20.sol
    ├── MockERC721.sol
    └── EventEmitter.sol
```

## 🎯 合约列表

### 账户合约 (account/)

| 合约 | 功能 | 状态 |
|------|------|------|
| `ChainPulseAccount.sol` | ERC-4337 智能账户主合约 | ⬜ 待实现 |
| `ChainPulseAccountFactory.sol` | 账户工厂合约（Create2） | ⬜ 待实现 |
| `ChainPulsePaymaster.sol` | Paymaster (Gas 赞助) | ⬜ 待实现 |

### 自动化合约 (automation/)

| 合约 | 功能 | 状态 |
|------|------|------|
| `AutomationExecutor.sol` | 自动化规则执行器 | ⬜ 待实现 |
| `ConditionChecker.sol` | 条件检查器 | ⬜ 待实现 |

### 接口定义 (interfaces/)

| 接口 | 功能 | 状态 |
|------|------|------|
| `IChainPulseAccount.sol` | 账户合约接口 | ⬜ 待实现 |
| `IAutomationExecutor.sol` | 自动化执行器接口 | ⬜ 待实现 |

### 模拟合约 (mocks/)

| 合约 | 功能 | 状态 |
|------|------|------|
| `MockERC20.sol` | 测试用 ERC20 代币 | ⬜ 待实现 |
| `MockERC721.sol` | 测试用 ERC721 NFT | ⬜ 待实现 |
| `EventEmitter.sol` | 事件监听测试合约 | ⬜ 待实现 |

## 💡 合约规范

### 文件头注释

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ChainPulseAccount
 * @author ChainPulse Team
 * @notice ERC-4337 compliant smart account implementation
 * @dev Implements BaseAccount from @account-abstraction/contracts
 */
```

### 导入顺序

1. 外部库（OpenZeppelin, Account Abstraction）
2. 内部接口
3. 内部合约

### 函数顺序

1. Constructor
2. External functions
3. Public functions
4. Internal functions
5. Private functions
6. View/Pure functions

## 🔗 相关文档

- [Scripts 部署脚本](../scripts/README.md)
- [Test 测试文件](../test/README.md)
- [系统技术架构](../../docs/系统技术架构.md)

