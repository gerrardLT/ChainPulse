# ChainPulse Smart Contracts

> 实时链上事件通知与可视化系统 - 智能合约

## 📋 项目概述

ChainPulse 智能合约基于 ERC-4337 Account Abstraction 标准，实现智能账户功能，支持 Gas 费赞助、批量操作、自动化交易等高级特性。

## 🎯 核心功能

### ✅ 已完成合约

1. **智能账户合约（ERC-4337）** (90%)
   - ✅ SimpleAccount 合约实现（BaseAccount）
   - ✅ SimpleAccountFactory 工厂合约
   - ✅ EntryPoint 集成
   - ✅ 签名验证（ECDSA）
   - ✅ 交易执行（单笔和批量）
   - ✅ 所有权管理
   - ✅ UUPS 可升级
   - ✅ EntryPoint 存款管理
   - ⬜ Paymaster 支持（待集成 Stackup）
   - ⬜ Session Key 管理（可选）

2. **测试套件** (100%)
   - ✅ 完整的单元测试
   - ✅ 部署测试
   - ✅ 功能测试
   - ✅ 事件测试

3. **部署工具** (100%)
   - ✅ 部署脚本
   - ✅ 地址预测
   - ✅ 示例账户创建

### 待实现合约

1. **自动化执行合约**
   - ⬜ 条件触发器
   - ⬜ 自动交易执行
   - ⬜ 批量操作支持

2. **示例合约**
   - ⬜ MockERC20 (测试用)
   - ⬜ MockERC721 (测试用)
   - ⬜ EventEmitter (事件监听测试)

## 🛠 技术栈

| 技术 | 版本 | 用途 | 状态 |
|------|------|------|------|
| **开发框架** |
| Hardhat | 2.x | 开发和测试框架 | ✅ 已配置 |
| TypeScript | 5.x | 类型安全 | ✅ 已配置 |
| **智能合约** |
| Solidity | 0.8.20 | 合约语言 | ✅ 已配置 |
| OpenZeppelin | 5.x | 合约库 | ✅ 已集成 |
| **Account Abstraction** |
| @account-abstraction/contracts | 0.7.0 | ERC-4337 标准实现 | ✅ 已集成 |
| Stackup SDK | - | Bundler 集成 | ⬜ 待集成 |
| **测试** |
| Chai | 4.x | 测试断言库 | ✅ 已配置 |
| ethers.js | 6.x | 以太坊交互库 | ✅ 已配置 |
| **部署和验证** |
| hardhat-deploy | - | 部署插件 | ✅ 部署脚本已完成 |
| hardhat-etherscan | - | 合约验证 | ✅ 已配置 |

## 📁 项目结构

```
contracts/
├── contracts/                # 智能合约源码
│   ├── account/             # 智能账户合约
│   │   ├── ChainPulseAccount.sol        # 主账户合约
│   │   ├── ChainPulseAccountFactory.sol # 账户工厂
│   │   └── ChainPulsePaymaster.sol      # Paymaster (Gas 赞助)
│   │
│   ├── automation/          # 自动化合约
│   │   ├── AutomationExecutor.sol       # 自动化执行器
│   │   └── ConditionChecker.sol         # 条件检查器
│   │
│   ├── interfaces/          # 接口定义
│   │   ├── IChainPulseAccount.sol
│   │   └── IAutomationExecutor.sol
│   │
│   └── mocks/              # 测试用模拟合约
│       ├── MockERC20.sol
│       ├── MockERC721.sol
│       └── EventEmitter.sol
│
├── scripts/                 # 部署和工具脚本
│   ├── deploy-account.ts    # 部署账户合约
│   ├── deploy-factory.ts    # 部署工厂合约
│   └── verify.ts            # 验证合约
│
├── test/                    # 测试文件
│   ├── account/
│   │   ├── ChainPulseAccount.test.ts
│   │   └── ChainPulseAccountFactory.test.ts
│   ├── automation/
│   │   └── AutomationExecutor.test.ts
│   └── fixtures/            # 测试辅助函数
│
├── deployments/             # 部署记录
│   ├── mainnet/
│   ├── sepolia/
│   └── localhost/
│
├── hardhat.config.ts        # Hardhat 配置
├── package.json             # 依赖管理
├── tsconfig.json            # TypeScript 配置
└── README.md                # 本文档
```

## 🚀 快速开始

### 前置要求

- Node.js 20.x 或更高
- npm 或 yarn

### 安装依赖

```bash
cd contracts
npm install
```

### 环境配置

创建 `.env` 文件：

```env
# Network RPC URLs
MAINNET_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY
SEPOLIA_RPC_URL=https://eth-sepolia.alchemyapi.io/v2/YOUR_KEY

# Private Keys (DO NOT COMMIT)
DEPLOYER_PRIVATE_KEY=your-private-key-here

# Etherscan API Key (for verification)
ETHERSCAN_API_KEY=your-etherscan-api-key

# Stackup
STACKUP_API_KEY=your-stackup-api-key
STACKUP_BUNDLER_URL=https://api.stackup.sh/v1/node/YOUR_KEY

# Gas Settings
GAS_PRICE=auto
GAS_LIMIT=8000000
```

### 编译合约

```bash
npx hardhat compile
```

### 运行测试

```bash
# 运行所有测试
npx hardhat test

# 运行特定测试
npx hardhat test test/account/ChainPulseAccount.test.ts

# 测试覆盖率
npx hardhat coverage
```

### 部署合约

```bash
# 部署到本地网络
npx hardhat run scripts/deploy-account.ts --network localhost

# 部署到 Sepolia 测试网
npx hardhat run scripts/deploy-account.ts --network sepolia

# 部署到主网
npx hardhat run scripts/deploy-account.ts --network mainnet
```

### 验证合约

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "Constructor Arg 1" "Constructor Arg 2"
```

## 📝 合约设计

### ChainPulseAccount (智能账户)

基于 ERC-4337 标准的智能账户合约。

**核心功能**:
- ✅ 兼容 ERC-4337 EntryPoint
- ✅ 多重签名支持
- ✅ Session Key 管理
- ✅ 批量操作
- ✅ Gas 赞助（Paymaster）

**合约示例**:
```solidity
// contracts/account/ChainPulseAccount.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@account-abstraction/contracts/core/BaseAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract ChainPulseAccount is BaseAccount {
    using ECDSA for bytes32;
    
    address public owner;
    IEntryPoint private immutable _entryPoint;
    
    event ChainPulseAccountInitialized(IEntryPoint indexed entryPoint, address indexed owner);
    
    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
        _disableInitializers();
    }
    
    function initialize(address anOwner) public virtual initializer {
        _initialize(anOwner);
    }
    
    function _initialize(address anOwner) internal virtual {
        owner = anOwner;
        emit ChainPulseAccountInitialized(_entryPoint, owner);
    }
    
    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }
    
    function _validateSignature(UserOperation calldata userOp, bytes32 userOpHash)
        internal override virtual returns (uint256 validationData)
    {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        if (owner != hash.recover(userOp.signature)) {
            return SIG_VALIDATION_FAILED;
        }
        return 0;
    }
    
    // 批量执行
    function executeBatch(address[] calldata dest, uint256[] calldata value, bytes[] calldata func)
        external
    {
        _requireFromEntryPointOrOwner();
        require(dest.length == func.length && dest.length == value.length, "wrong array lengths");
        
        for (uint256 i = 0; i < dest.length; i++) {
            _call(dest[i], value[i], func[i]);
        }
    }
}
```

### ChainPulseAccountFactory (账户工厂)

用于创建和管理智能账户。

**核心功能**:
- ✅ Create2 确定性部署
- ✅ 地址预计算
- ✅ 账户初始化

**合约示例**:
```solidity
// contracts/account/ChainPulseAccountFactory.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Create2.sol";
import "./ChainPulseAccount.sol";

contract ChainPulseAccountFactory {
    ChainPulseAccount public immutable accountImplementation;
    
    constructor(IEntryPoint _entryPoint) {
        accountImplementation = new ChainPulseAccount(_entryPoint);
    }
    
    function createAccount(address owner, uint256 salt) public returns (ChainPulseAccount ret) {
        address addr = getAddress(owner, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return ChainPulseAccount(payable(addr));
        }
        ret = ChainPulseAccount(payable(new ERC1967Proxy{salt: bytes32(salt)}(
            address(accountImplementation),
            abi.encodeCall(ChainPulseAccount.initialize, (owner))
        )));
    }
    
    function getAddress(address owner, uint256 salt) public view returns (address) {
        return Create2.computeAddress(bytes32(salt), keccak256(abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(
                address(accountImplementation),
                abi.encodeCall(ChainPulseAccount.initialize, (owner))
            )
        )));
    }
}
```

## 🧪 测试指南

### 测试结构

```typescript
// test/account/ChainPulseAccount.test.ts
import { expect } from "chai"
import { ethers } from "hardhat"
import { ChainPulseAccount, ChainPulseAccountFactory } from "../typechain-types"

describe("ChainPulseAccount", function () {
  let account: ChainPulseAccount
  let factory: ChainPulseAccountFactory
  let owner: any
  
  beforeEach(async function () {
    [owner] = await ethers.getSigners()
    
    // Deploy EntryPoint
    const EntryPoint = await ethers.getContractFactory("EntryPoint")
    const entryPoint = await EntryPoint.deploy()
    
    // Deploy Factory
    const Factory = await ethers.getContractFactory("ChainPulseAccountFactory")
    factory = await Factory.deploy(entryPoint.target)
    
    // Create Account
    const tx = await factory.createAccount(owner.address, 0)
    await tx.wait()
    const accountAddress = await factory.getAddress(owner.address, 0)
    account = await ethers.getContractAt("ChainPulseAccount", accountAddress)
  })
  
  it("Should initialize with correct owner", async function () {
    expect(await account.owner()).to.equal(owner.address)
  })
  
  it("Should execute transaction", async function () {
    // Test implementation
  })
})
```

### 测试覆盖率目标

- 单元测试覆盖率: > 90%
- 集成测试覆盖率: > 80%
- 关键路径测试: 100%

## 🔒 安全考虑

### 审计清单

- [ ] 重入攻击防护
- [ ] 整数溢出检查
- [ ] 访问控制验证
- [ ] Gas 限制检查
- [ ] 签名验证
- [ ] 前端运行保护

### 最佳实践

1. **使用 OpenZeppelin 合约**
2. **启用 Solidity 优化器**
3. **编写完整的测试**
4. **进行安全审计**
5. **渐进式部署**

## 📊 Gas 优化

### 优化技巧

- 使用 `immutable` 和 `constant`
- 减少存储操作
- 批量操作
- 事件日志优化
- 合理使用 `view` 和 `pure`

## 📚 参考文档

- [ERC-4337 标准](https://eips.ethereum.org/EIPS/eip-4337)
- [Stackup 文档](https://docs.stackup.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [系统技术架构](../docs/系统技术架构.md)
- [开发任务清单](../docs/开发任务清单.md)

## 🤝 开发团队

- **智能合约负责人**: _待分配_
- **技术栈**: Solidity 0.8.24, Hardhat 2.x, ERC-4337

## 📄 许可证

MIT

---

**最后更新**: 2025-10-11  
**版本**: v1.0.0  
**状态**: ⬜ 待开发

