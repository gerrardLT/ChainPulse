# Scripts 部署和工具脚本

## 📋 功能说明

存放合约部署脚本、工具脚本和验证脚本。

## 🎯 脚本列表

| 脚本 | 功能 | 状态 |
|------|------|------|
| `deploy-account.ts` | 部署 ChainPulseAccount 合约 | ⬜ 待实现 |
| `deploy-factory.ts` | 部署 AccountFactory 合约 | ⬜ 待实现 |
| `deploy-paymaster.ts` | 部署 Paymaster 合约 | ⬜ 待实现 |
| `deploy-automation.ts` | 部署自动化合约 | ⬜ 待实现 |
| `verify.ts` | 在 Etherscan 验证合约 | ⬜ 待实现 |
| `create-account.ts` | 创建智能账户实例 | ⬜ 待实现 |

## 💡 脚本示例

### 部署账户工厂

```typescript
// deploy-factory.ts
import { ethers } from "hardhat"
import fs from "fs"

async function main() {
  console.log("Deploying ChainPulseAccountFactory...")
  
  const [deployer] = await ethers.getSigners()
  console.log("Deployer address:", deployer.address)
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)))
  
  // EntryPoint address (use existing one or deploy)
  const ENTRY_POINT_ADDRESS = process.env.ENTRY_POINT_ADDRESS || "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
  
  // Deploy Factory
  const ChainPulseAccountFactory = await ethers.getContractFactory("ChainPulseAccountFactory")
  const factory = await ChainPulseAccountFactory.deploy(ENTRY_POINT_ADDRESS)
  await factory.waitForDeployment()
  
  const factoryAddress = await factory.getAddress()
  console.log("ChainPulseAccountFactory deployed to:", factoryAddress)
  
  // Save deployment info
  const network = await ethers.provider.getNetwork()
  const deployment = {
    network: network.name,
    chainId: network.chainId.toString(),
    factory: factoryAddress,
    entryPoint: ENTRY_POINT_ADDRESS,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  }
  
  const deploymentPath = `./deployments/${network.name}/factory.json`
  fs.mkdirSync(`./deployments/${network.name}`, { recursive: true })
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2))
  
  console.log("Deployment info saved to:", deploymentPath)
  
  // Wait for verification
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("Waiting for block confirmations...")
    await factory.deploymentTransaction()?.wait(5)
    console.log("Run this command to verify:")
    console.log(`npx hardhat verify --network ${network.name} ${factoryAddress} ${ENTRY_POINT_ADDRESS}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
```

### 创建智能账户

```typescript
// create-account.ts
import { ethers } from "hardhat"
import fs from "fs"

async function main() {
  const [signer] = await ethers.getSigners()
  const network = await ethers.provider.getNetwork()
  
  // Load factory deployment
  const deploymentPath = `./deployments/${network.name}/factory.json`
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Factory deployment not found at ${deploymentPath}`)
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf-8'))
  const factoryAddress = deployment.factory
  
  console.log("Creating account for owner:", signer.address)
  console.log("Using factory at:", factoryAddress)
  
  // Get factory contract
  const factory = await ethers.getContractAt("ChainPulseAccountFactory", factoryAddress)
  
  // Create account with salt = 0
  const salt = 0
  const accountAddress = await factory.getAddress(signer.address, salt)
  
  console.log("Predicted account address:", accountAddress)
  
  // Check if already deployed
  const code = await ethers.provider.getCode(accountAddress)
  if (code !== "0x") {
    console.log("Account already deployed")
  } else {
    console.log("Deploying account...")
    const tx = await factory.createAccount(signer.address, salt)
    await tx.wait()
    console.log("Account deployed in tx:", tx.hash)
  }
  
  // Save account info
  const accountInfo = {
    address: accountAddress,
    owner: signer.address,
    factory: factoryAddress,
    salt,
    timestamp: new Date().toISOString()
  }
  
  const accountPath = `./deployments/${network.name}/accounts.json`
  let accounts = []
  if (fs.existsSync(accountPath)) {
    accounts = JSON.parse(fs.readFileSync(accountPath, 'utf-8'))
  }
  accounts.push(accountInfo)
  fs.writeFileSync(accountPath, JSON.stringify(accounts, null, 2))
  
  console.log("Account info saved to:", accountPath)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
```

### 合约验证

```typescript
// verify.ts
import { run } from "hardhat"
import fs from "fs"

async function main() {
  const network = process.env.HARDHAT_NETWORK || "sepolia"
  
  // Load deployment
  const deploymentPath = `./deployments/${network}/factory.json`
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Deployment not found at ${deploymentPath}`)
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf-8'))
  
  console.log("Verifying ChainPulseAccountFactory...")
  console.log("Address:", deployment.factory)
  console.log("Constructor args:", deployment.entryPoint)
  
  try {
    await run("verify:verify", {
      address: deployment.factory,
      constructorArguments: [deployment.entryPoint]
    })
    console.log("Contract verified successfully!")
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("Contract is already verified!")
    } else {
      throw error
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
```

## 🚀 使用方法

```bash
# 部署到本地网络
npx hardhat run scripts/deploy-factory.ts --network localhost

# 部署到 Sepolia 测试网
npx hardhat run scripts/deploy-factory.ts --network sepolia

# 创建智能账户
npx hardhat run scripts/create-account.ts --network sepolia

# 验证合约
npx hardhat run scripts/verify.ts --network sepolia
```

## 🔗 相关文档

- [Contracts 合约源码](../contracts/README.md)
- [Deployments 部署记录](../deployments/README.md)

