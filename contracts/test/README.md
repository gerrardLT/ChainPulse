# Test 测试文件

## 📋 功能说明

存放所有智能合约测试文件，使用 Hardhat + Chai + ethers.js 进行单元测试和集成测试。

## 🎯 测试结构

```
test/
├── account/                 # 账户合约测试
│   ├── ChainPulseAccount.test.ts
│   ├── ChainPulseAccountFactory.test.ts
│   └── ChainPulsePaymaster.test.ts
│
├── automation/             # 自动化合约测试
│   ├── AutomationExecutor.test.ts
│   └── ConditionChecker.test.ts
│
└── fixtures/               # 测试辅助函数
    └── deploy.ts
```

## 📁 测试列表

| 测试文件 | 测试内容 | 状态 |
|----------|----------|------|
| `ChainPulseAccount.test.ts` | 账户基本功能测试 | ⬜ 待实现 |
| `ChainPulseAccountFactory.test.ts` | 工厂合约测试 | ⬜ 待实现 |
| `ChainPulsePaymaster.test.ts` | Paymaster 测试 | ⬜ 待实现 |
| `AutomationExecutor.test.ts` | 自动化执行器测试 | ⬜ 待实现 |

## 💡 测试示例

### 账户合约测试

```typescript
// test/account/ChainPulseAccount.test.ts
import { expect } from "chai"
import { ethers } from "hardhat"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { ChainPulseAccount, ChainPulseAccountFactory } from "../../typechain-types"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"

describe("ChainPulseAccount", function () {
  // Fixture for deployment
  async function deployAccountFixture() {
    const [owner, user1, user2] = await ethers.getSigners()
    
    // Deploy EntryPoint
    const EntryPoint = await ethers.getContractFactory("EntryPoint")
    const entryPoint = await EntryPoint.deploy()
    
    // Deploy Factory
    const Factory = await ethers.getContractFactory("ChainPulseAccountFactory")
    const factory = await Factory.deploy(await entryPoint.getAddress())
    
    // Create Account
    const salt = 0
    const accountAddress = await factory.getAddress(owner.address, salt)
    await factory.createAccount(owner.address, salt)
    const account = await ethers.getContractAt("ChainPulseAccount", accountAddress)
    
    // Deploy Mock ERC20 for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20")
    const token = await MockERC20.deploy("Test Token", "TEST")
    
    return { account, factory, entryPoint, token, owner, user1, user2 }
  }
  
  describe("Initialization", function () {
    it("Should set the correct owner", async function () {
      const { account, owner } = await loadFixture(deployAccountFixture)
      expect(await account.owner()).to.equal(owner.address)
    })
    
    it("Should set the correct entry point", async function () {
      const { account, entryPoint } = await loadFixture(deployAccountFixture)
      expect(await account.entryPoint()).to.equal(await entryPoint.getAddress())
    })
  })
  
  describe("Execution", function () {
    it("Should execute single transaction", async function () {
      const { account, token, owner, user1 } = await loadFixture(deployAccountFixture)
      
      // Mint tokens to account
      await token.mint(await account.getAddress(), ethers.parseEther("100"))
      
      // Prepare transfer call
      const transferData = token.interface.encodeFunctionData("transfer", [
        user1.address,
        ethers.parseEther("10")
      ])
      
      // Execute from owner
      await account.connect(owner).execute(
        await token.getAddress(),
        0,
        transferData
      )
      
      // Check balances
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("10"))
    })
    
    it("Should execute batch transactions", async function () {
      const { account, token, owner, user1, user2 } = await loadFixture(deployAccountFixture)
      
      // Mint tokens to account
      await token.mint(await account.getAddress(), ethers.parseEther("100"))
      
      // Prepare batch transfers
      const destinations = [await token.getAddress(), await token.getAddress()]
      const values = [0, 0]
      const datas = [
        token.interface.encodeFunctionData("transfer", [user1.address, ethers.parseEther("10")]),
        token.interface.encodeFunctionData("transfer", [user2.address, ethers.parseEther("20")])
      ]
      
      // Execute batch
      await account.connect(owner).executeBatch(destinations, values, datas)
      
      // Check balances
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("10"))
      expect(await token.balanceOf(user2.address)).to.equal(ethers.parseEther("20"))
    })
    
    it("Should revert when non-owner tries to execute", async function () {
      const { account, token, user1 } = await loadFixture(deployAccountFixture)
      
      const transferData = token.interface.encodeFunctionData("transfer", [
        user1.address,
        ethers.parseEther("10")
      ])
      
      await expect(
        account.connect(user1).execute(await token.getAddress(), 0, transferData)
      ).to.be.revertedWith("account: not Owner or EntryPoint")
    })
  })
  
  describe("Signature Validation", function () {
    it("Should validate correct signature", async function () {
      // Test signature validation
    })
    
    it("Should reject invalid signature", async function () {
      // Test invalid signature
    })
  })
  
  describe("Gas Estimation", function () {
    it("Should estimate gas correctly", async function () {
      // Test gas estimation
    })
  })
})
```

### 测试辅助函数

```typescript
// test/fixtures/deploy.ts
import { ethers } from "hardhat"

export async function deployEntryPoint() {
  const EntryPoint = await ethers.getContractFactory("EntryPoint")
  const entryPoint = await EntryPoint.deploy()
  return entryPoint
}

export async function deployAccountFactory(entryPointAddress: string) {
  const Factory = await ethers.getContractFactory("ChainPulseAccountFactory")
  const factory = await Factory.deploy(entryPointAddress)
  return factory
}

export async function createAccount(
  factory: any,
  owner: string,
  salt: number = 0
) {
  const accountAddress = await factory.getAddress(owner, salt)
  const code = await ethers.provider.getCode(accountAddress)
  
  if (code === "0x") {
    await factory.createAccount(owner, salt)
  }
  
  const account = await ethers.getContractAt("ChainPulseAccount", accountAddress)
  return account
}
```

## 🧪 运行测试

```bash
# 运行所有测试
npx hardhat test

# 运行特定测试文件
npx hardhat test test/account/ChainPulseAccount.test.ts

# 运行特定测试用例
npx hardhat test --grep "Should execute single transaction"

# 生成测试覆盖率报告
npx hardhat coverage

# 显示 Gas 使用情况
REPORT_GAS=true npx hardhat test
```

## 📊 测试覆盖率

### 目标

- 语句覆盖率: > 90%
- 分支覆盖率: > 85%
- 函数覆盖率: > 90%
- 行覆盖率: > 90%

### 关键测试场景

- ✅ 正常流程测试
- ✅ 边界条件测试
- ✅ 错误处理测试
- ✅ 权限控制测试
- ✅ Gas 优化测试
- ✅ 重入攻击防护测试

## 🔗 相关文档

- [Contracts 合约源码](../contracts/README.md)
- [Scripts 部署脚本](../scripts/README.md)

