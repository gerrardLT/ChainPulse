import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // EntryPoint address (use official ERC-4337 EntryPoint)
  // Mainnet: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
  // Sepolia: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
  const ENTRY_POINT_ADDRESS = process.env.ENTRY_POINT_ADDRESS || "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  
  console.log("🎯 Using EntryPoint:", ENTRY_POINT_ADDRESS);

  // Deploy SimpleAccountFactory
  console.log("\n📦 Deploying SimpleAccountFactory...");
  const AccountFactoryContract = await ethers.getContractFactory("SimpleAccountFactory");
  const accountFactory = await AccountFactoryContract.deploy(ENTRY_POINT_ADDRESS);
  await accountFactory.waitForDeployment();
  const factoryAddress = await accountFactory.getAddress();
  
  console.log("✅ SimpleAccountFactory deployed to:", factoryAddress);

  // Get implementation address
  const implementationAddress = await accountFactory.accountImplementation();
  console.log("📄 SimpleAccount implementation:", implementationAddress);

  // Create a sample account for testing
  console.log("\n🧪 Creating sample account...");
  const salt = 0;
  const sampleOwner = deployer.address; // Use deployer as owner for testing
  
  const predictedAddress = await accountFactory.getAddress(sampleOwner, salt);
  console.log("🔮 Predicted account address:", predictedAddress);

  const tx = await accountFactory.createAccount(sampleOwner, salt);
  await tx.wait();
  console.log("✅ Sample account created at:", predictedAddress);

  // Verify account
  const account = await ethers.getContractAt("SimpleAccount", predictedAddress);
  const accountOwner = await account.owner();
  console.log("👤 Account owner:", accountOwner);
  console.log("🎯 EntryPoint:", await account.entryPoint());

  console.log("\n✨ Deployment Summary:");
  console.log("═".repeat(60));
  console.log("Factory Address:", factoryAddress);
  console.log("Implementation:", implementationAddress);
  console.log("Sample Account:", predictedAddress);
  console.log("Account Owner:", accountOwner);
  console.log("═".repeat(60));

  console.log("\n📝 Next Steps:");
  console.log("1. Verify contracts on Etherscan:");
  console.log(`   npx hardhat verify --network ${network.name} ${factoryAddress} ${ENTRY_POINT_ADDRESS}`);
  console.log(`   npx hardhat verify --network ${network.name} ${implementationAddress} ${ENTRY_POINT_ADDRESS}`);
  console.log("\n2. Update backend .env with factory address:");
  console.log(`   ACCOUNT_FACTORY_ADDRESS=${factoryAddress}`);
  console.log("\n3. Fund the sample account to test transactions:");
  console.log(`   Account Address: ${predictedAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

