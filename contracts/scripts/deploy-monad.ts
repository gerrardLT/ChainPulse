import { ethers, network } from "hardhat";

async function main() {
  console.log("🚀 Starting Monad Testnet deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MON\n");

  // Check if balance is sufficient (at least 0.1 MON recommended)
  if (balance < ethers.parseEther("0.1")) {
    console.warn("⚠️  WARNING: Low balance detected!");
    console.warn("⚠️  Please get MON from faucet: https://testnet-faucet.monad.xyz\n");
  }

  // EntryPoint address
  const ENTRY_POINT_ADDRESS = process.env.ENTRY_POINT_ADDRESS || "0x0000000071727De22E5E9d8BAf0edAc6f37da032";
  
  console.log("🎯 Using EntryPoint:", ENTRY_POINT_ADDRESS);
  console.log("🌐 Network:", network.name);
  console.log("🔗 Chain ID:", network.config.chainId, "\n");

  // Deploy SimpleAccountFactory
  console.log("📦 Deploying SimpleAccountFactory...");
  const AccountFactoryContract = await ethers.getContractFactory("SimpleAccountFactory");
  
  // Estimate gas first
  const deployTx = await AccountFactoryContract.getDeployTransaction(ENTRY_POINT_ADDRESS);
  let gasEstimate;
  try {
    gasEstimate = await ethers.provider.estimateGas(deployTx);
    console.log("⛽ Estimated gas:", gasEstimate.toString());
  } catch (error) {
    console.log("⚠️  Gas estimation failed, using default");
    gasEstimate = 2000000n;
  }
  
  const accountFactory = await AccountFactoryContract.deploy(ENTRY_POINT_ADDRESS, {
    gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
  });
  
  await accountFactory.waitForDeployment();
  const factoryAddress = await accountFactory.getAddress();
  
  console.log("✅ SimpleAccountFactory deployed to:", factoryAddress);

  // Get implementation address
  const implementationAddress = await accountFactory.accountImplementation();
  console.log("📄 SimpleAccount implementation:", implementationAddress);

  // Create a sample account for testing
  console.log("\n🧪 Creating sample account...");
  const salt = 0;
  const sampleOwner = deployer.address;
  
  const predictedAddress = await accountFactory["getAddress(address,uint256)"](sampleOwner, salt);
  console.log("🔮 Predicted account address:", predictedAddress);
  
  // Check if account already exists
  const existingCode = await ethers.provider.getCode(predictedAddress);
  if (existingCode !== "0x") {
    console.log("⚠️  Account already exists at this address");
  }

  const tx = await accountFactory.createAccount(sampleOwner, salt, {
    gasLimit: 500000,
  });
  const receipt = await tx.wait();
  
  // Get actual deployed address from event
  const event = receipt?.logs.find((log: any) => {
    try {
      const parsed = accountFactory.interface.parseLog(log);
      return parsed?.name === "AccountCreated";
    } catch {
      return false;
    }
  });
  
  let actualAddress = predictedAddress;
  if (event) {
    const parsed = accountFactory.interface.parseLog(event);
    actualAddress = parsed?.args.account;
    console.log("✅ Sample account created at:", actualAddress);
  } else {
    console.log("✅ Sample account transaction confirmed");
  }
  console.log("⛽ Gas used:", receipt?.gasUsed.toString());

  // Verify account (with error handling)
  let accountOwner = sampleOwner;
  let accountEntryPoint = ENTRY_POINT_ADDRESS;
  
  try {
    const account = await ethers.getContractAt("SimpleAccount", actualAddress);
    
    // Check if contract exists
    const code = await ethers.provider.getCode(actualAddress);
    if (code === "0x") {
      console.log("⚠️  Account not deployed yet (will be deployed on first transaction)");
    } else {
      accountOwner = await account.owner();
      accountEntryPoint = await account.entryPoint();
      console.log("\n👤 Account owner:", accountOwner);
      console.log("🎯 Account EntryPoint:", accountEntryPoint);
    }
  } catch (error) {
    console.log("⚠️  Could not verify account (this is normal for counterfactual accounts)");
    console.log("   Account will be deployed on first UserOperation");
  }

  // Display summary
  console.log("\n✨ Deployment Summary:");
  console.log("═".repeat(70));
  console.log("Network:          ", network.name);
  console.log("Chain ID:         ", network.config.chainId);
  console.log("Factory Address:  ", factoryAddress);
  console.log("Implementation:   ", implementationAddress);
  console.log("Sample Account:   ", actualAddress);
  console.log("Account Owner:    ", accountOwner);
  console.log("EntryPoint:       ", ENTRY_POINT_ADDRESS);
  console.log("═".repeat(70));

  // Save deployment info to file
  const fs = require('fs');
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    factoryAddress,
    implementationAddress,
    sampleAccountAddress: actualAddress,
    entryPoint: ENTRY_POINT_ADDRESS,
    transactionHash: tx.hash,
    gasUsed: receipt?.gasUsed.toString(),
  };

  const deploymentDir = `./deployments/${network.name}`;
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  fs.writeFileSync(
    `${deploymentDir}/deployment-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n💾 Deployment info saved to:", `${deploymentDir}/`);

  // Next steps
  console.log("\n📝 Next Steps:");
  console.log("═".repeat(70));
  
  console.log("\n1️⃣  Verify contracts on Monad Explorer (if supported):");
  console.log(`   Factory:        ${factoryAddress}`);
  console.log(`   Implementation: ${implementationAddress}`);
  
  console.log("\n2️⃣  Update backend .env with factory address:");
  console.log(`   ACCOUNT_FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`   ACCOUNT_FACTORY_CHAIN_ID=${network.config.chainId}`);
  
  console.log("\n3️⃣  Fund the sample account to test transactions:");
  console.log(`   Account Address: ${predictedAddress}`);
  console.log(`   Command: Send MON to this address\n`);
  
  console.log("\n4️⃣  Test the deployment with interact script:");
  console.log(`   npx hardhat run scripts/interact-monad.ts --network ${network.name}\n`);

  console.log("═".repeat(70));
  console.log("🎉 Deployment completed successfully!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

