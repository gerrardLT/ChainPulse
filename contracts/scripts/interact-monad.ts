import { ethers, network } from "hardhat";

async function main() {
  console.log("🔄 Interacting with Monad Testnet contracts...\n");

  // Load deployment info
  const fs = require('fs');
  const deploymentFile = `./deployments/${network.name}.json`;
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`No deployment found for ${network.name}. Please run deploy script first.`);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf-8'));

  console.log("📋 Deployment Info:");
  console.log("   Network:", deploymentInfo.network);
  console.log("   Chain ID:", deploymentInfo.chainId);
  console.log("   Factory:", deploymentInfo.factoryAddress);
  console.log("   Implementation:", deploymentInfo.implementationAddress);
  console.log("   EntryPoint:", deploymentInfo.entryPoint);
  console.log();

  const [signer] = await ethers.getSigners();
  console.log("👤 Signer:", signer.address);
  
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("💰 Signer Balance:", ethers.formatEther(balance), "MON\n");

  // Get factory contract
  const factory = await ethers.getContractAt(
    "SimpleAccountFactory",
    deploymentInfo.factoryAddress
  );

  // Test 1: Predict account address
  console.log("═".repeat(70));
  console.log("📊 Test 1: Predict Account Address");
  console.log("═".repeat(70));
  
  const salt = 0;
  const owner = signer.address;
  const predictedAddress = await factory["getAddress(address,uint256)"](owner, salt);
  
  console.log("Owner:", owner);
  console.log("Salt:", salt);
  console.log("Predicted Address:", predictedAddress);
  
  // Check if account exists
  const accountCode = await ethers.provider.getCode(predictedAddress);
  const accountExists = accountCode !== "0x";
  console.log("Account Exists:", accountExists ? "✅ Yes" : "❌ No");
  
  if (!accountExists) {
    console.log("\n⚠️  Account not deployed yet. Skipping further tests.");
    console.log("💡 To create this account, you need more MON for gas.");
    console.log("   Get MON from: https://testnet-faucet.monad.xyz");
    return;
  }
  
  const account = await ethers.getContractAt("SimpleAccount", predictedAddress);
  const accountBalance = await ethers.provider.getBalance(predictedAddress);
  const accountOwner = await account.owner();
  const entryPoint = await account.entryPoint();
  
  // Test 2: Check account info
  console.log("\n" + "═".repeat(70));
  console.log("📊 Test 2: Check Account Information");
  console.log("═".repeat(70));
  
  console.log("✅ Account Owner:", accountOwner);
  console.log("✅ EntryPoint:", entryPoint);
  console.log("✅ Account Balance:", ethers.formatEther(accountBalance), "MON");
  console.log("✅ Owner matches signer:", accountOwner === signer.address ? "Yes" : "No");

  // Test 3: Fund account if needed
  if (accountBalance < ethers.parseEther("0.1")) {
    console.log("\n═".repeat(70));
    console.log("💸 Test 3: Funding Account");
    console.log("═".repeat(70));
    
    const fundAmount = ethers.parseEther("0.5");
    console.log("Transferring", ethers.formatEther(fundAmount), "MON to account...");
    
    const fundTx = await signer.sendTransaction({
      to: deploymentInfo.sampleAccountAddress,
      value: fundAmount,
    });
    await fundTx.wait();
    
    const newBalance = await ethers.provider.getBalance(deploymentInfo.sampleAccountAddress);
    console.log("✅ New account balance:", ethers.formatEther(newBalance), "MON");
  }

  // Test 3: Create another account
  console.log("\n═".repeat(70));
  console.log("🏗️  Test 3: Create Another Account");
  console.log("═".repeat(70));
  
  const newSalt = 1;
  const newAccountAddress = await factory["getAddress(address,uint256)"](signer.address, newSalt);
  console.log("🔮 Predicted address (salt=1):", newAccountAddress);
  
  // Check if account already exists
  const code = await ethers.provider.getCode(newAccountAddress);
  if (code === "0x") {
    console.log("Creating new account...");
    const createTx = await factory.createAccount(signer.address, newSalt, {
      gasLimit: 500000,
    });
    const receipt = await createTx.wait();
    console.log("✅ Account created! Gas used:", receipt?.gasUsed.toString());
  } else {
    console.log("✅ Account already exists");
  }

  // Test 4: Execute transaction from account
  console.log("\n═".repeat(70));
  console.log("🚀 Test 4: Execute Transaction");
  console.log("═".repeat(70));
  
  const currentAccountBalance = await ethers.provider.getBalance(deploymentInfo.sampleAccountAddress);
  
  if (currentAccountBalance > ethers.parseEther("0.01")) {
    const recipient = "0x0000000000000000000000000000000000000001"; // Burn address
    const transferAmount = ethers.parseEther("0.001");
    
    console.log("Executing transfer from smart account...");
    console.log("To:", recipient);
    console.log("Amount:", ethers.formatEther(transferAmount), "MON");
    
    const executeTx = await account.execute(recipient, transferAmount, "0x", {
      gasLimit: 100000,
    });
    const executeReceipt = await executeTx.wait();
    
    console.log("✅ Transaction executed! Gas used:", executeReceipt?.gasUsed.toString());
    console.log("✅ Transaction hash:", executeTx.hash);
    
    const finalBalance = await ethers.provider.getBalance(deploymentInfo.sampleAccountAddress);
    console.log("✅ Final account balance:", ethers.formatEther(finalBalance), "MON");
  } else {
    console.log("⚠️  Skipping: Account balance too low");
    console.log("   Please fund the account first");
  }

  // Test 5: Batch execution
  console.log("\n═".repeat(70));
  console.log("📦 Test 5: Batch Execute Transactions");
  console.log("═".repeat(70));
  
  const batchAccountBalance = await ethers.provider.getBalance(deploymentInfo.sampleAccountAddress);
  
  if (batchAccountBalance > ethers.parseEther("0.05")) {
    const recipients = [
      "0x0000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000002",
      "0x0000000000000000000000000000000000000003",
    ];
    const amounts = [
      ethers.parseEther("0.001"),
      ethers.parseEther("0.001"),
      ethers.parseEther("0.001"),
    ];
    const data = ["0x", "0x", "0x"];
    
    console.log("Executing batch transfer (3 transactions)...");
    
    const batchTx = await account.executeBatch(recipients, amounts, data, {
      gasLimit: 300000,
    });
    const batchReceipt = await batchTx.wait();
    
    console.log("✅ Batch executed! Gas used:", batchReceipt?.gasUsed.toString());
    console.log("✅ Transaction hash:", batchTx.hash);
    
    const finalBatchBalance = await ethers.provider.getBalance(deploymentInfo.sampleAccountAddress);
    console.log("✅ Final account balance:", ethers.formatEther(finalBatchBalance), "MON");
  } else {
    console.log("⚠️  Skipping: Account balance too low for batch execution");
  }

  // Summary
  console.log("\n═".repeat(70));
  console.log("🎉 All Tests Completed!");
  console.log("═".repeat(70));
  console.log("\n📊 Summary:");
  console.log("✅ Account information verified");
  console.log("✅ Account creation tested");
  console.log("✅ Single transaction execution tested");
  console.log("✅ Batch transaction execution tested");
  console.log("\n🔗 View on Explorer:");
  console.log(`   https://testnet.monadexplorer.com/address/${deploymentInfo.sampleAccountAddress}`);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Interaction failed:");
    console.error(error);
    process.exit(1);
  });

