import { ethers } from "hardhat";

/**
 * 🧪 本地测试 - 使用 Hardhat 本地网络
 * 完全模拟部署流程，不消耗任何真实 token
 */
async function main() {
  console.log("\n🧪 Testing on Local Hardhat Network");
  console.log("═".repeat(70));
  
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("❌ This script must run on hardhat/localhost network!");
    console.log("   Current network:", network.name);
    console.log("\n   Run with: npx hardhat run scripts/test-local.ts");
    process.exit(1);
  }
  
  const [deployer, user1, user2] = await ethers.getSigners();
  const ENTRY_POINT = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";
  
  console.log("\n📊 Test Accounts:");
  console.log("   Deployer:", deployer.address);
  console.log("   User 1:  ", user1.address);
  console.log("   User 2:  ", user2.address);
  
  // Test 1: Deploy Factory
  console.log("\n" + "═".repeat(70));
  console.log("✅ Test 1: Deploy SimpleAccountFactory");
  console.log("═".repeat(70));
  
  const AccountFactory = await ethers.getContractFactory("SimpleAccountFactory");
  const factory = await AccountFactory.deploy(ENTRY_POINT);
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("   ✅ Factory deployed to:", factoryAddress);
  
  const implementation = await factory.accountImplementation();
  console.log("   ✅ Implementation:", implementation);
  
  // Test 2: Verify getAddress function
  console.log("\n" + "═".repeat(70));
  console.log("✅ Test 2: Test getAddress Function");
  console.log("═".repeat(70));
  
  const salt = 0;
  const owner = user1.address;
  const predictedAddress = await factory["getAddress(address,uint256)"](owner, salt);
  
  console.log("   Owner:", owner);
  console.log("   Salt:", salt);
  console.log("   Predicted Address:", predictedAddress);
  console.log("   Factory Address:", factoryAddress);
  
  // Verify predicted address is different from factory
  if (predictedAddress.toLowerCase() === factoryAddress.toLowerCase()) {
    console.log("   ❌ BUG DETECTED: Predicted address same as factory!");
    console.log("   This means getAddress() function has a bug!");
    process.exit(1);
  } else {
    console.log("   ✅ Predicted address is unique");
  }
  
  // Test different salts produce different addresses
  const addresses = new Set();
  for (let i = 0; i < 5; i++) {
    const addr = await factory["getAddress(address,uint256)"](owner, i);
    if (addresses.has(addr)) {
      console.log(`   ❌ Duplicate address for salt ${i}`);
      process.exit(1);
    }
    addresses.add(addr);
  }
  console.log("   ✅ Different salts produce unique addresses");
  
  // Test 3: Create Account
  console.log("\n" + "═".repeat(70));
  console.log("✅ Test 3: Create Smart Account");
  console.log("═".repeat(70));
  
  const tx = await factory.createAccount(user1.address, salt);
  const receipt = await tx.wait();
  
  console.log("   ✅ Account creation tx:", receipt?.hash);
  console.log("   ⛽ Gas used:", receipt?.gasUsed.toString());
  
  // Verify account was deployed
  const code = await ethers.provider.getCode(predictedAddress);
  if (code === "0x") {
    console.log("   ❌ Account not deployed!");
    process.exit(1);
  } else {
    console.log("   ✅ Account deployed successfully");
    console.log("   📦 Bytecode size:", code.length / 2 - 1, "bytes");
  }
  
  // Test 4: Verify Account Properties
  console.log("\n" + "═".repeat(70));
  console.log("✅ Test 4: Verify Account Properties");
  console.log("═".repeat(70));
  
  const account = await ethers.getContractAt("SimpleAccount", predictedAddress);
  
  try {
    const owner = await account.owner();
    const entryPoint = await account.entryPoint();
    
    console.log("   Account Owner:", owner);
    console.log("   Entry Point:", entryPoint);
    
    if (owner !== user1.address) {
      console.log("   ❌ Owner mismatch!");
      process.exit(1);
    } else {
      console.log("   ✅ Owner correct");
    }
    
    if (entryPoint !== ENTRY_POINT) {
      console.log("   ❌ EntryPoint mismatch!");
      process.exit(1);
    } else {
      console.log("   ✅ EntryPoint correct");
    }
  } catch (error: any) {
    console.log("   ❌ Failed to read account properties:", error.message);
    process.exit(1);
  }
  
  // Test 5: Test Account Creation Idempotency
  console.log("\n" + "═".repeat(70));
  console.log("✅ Test 5: Test Idempotent Account Creation");
  console.log("═".repeat(70));
  
  const tx2 = await factory.createAccount(user1.address, salt);
  const receipt2 = await tx2.wait();
  
  console.log("   ✅ Second creation succeeded");
  console.log("   ⛽ Gas used:", receipt2?.gasUsed.toString());
  console.log("   💡 Gas should be much lower (account already exists)");
  
  if (receipt2!.gasUsed > receipt!.gasUsed / 2n) {
    console.log("   ⚠️  Warning: Gas usage unexpectedly high");
  }
  
  // Test 6: Multiple Accounts
  console.log("\n" + "═".repeat(70));
  console.log("✅ Test 6: Create Multiple Accounts");
  console.log("═".repeat(70));
  
  const accounts: string[] = [];
  
  for (let i = 1; i <= 3; i++) {
    const predicted = await factory["getAddress(address,uint256)"](owner, i);
    await factory.createAccount(owner, i);
    accounts.push(predicted);
    console.log(`   ✅ Account ${i}:`, predicted);
  }
  
  // Verify all accounts are unique
  const uniqueAccounts = new Set(accounts);
  if (uniqueAccounts.size !== accounts.length) {
    console.log("   ❌ Duplicate accounts detected!");
    process.exit(1);
  } else {
    console.log("   ✅ All accounts are unique");
  }
  
  // Final Summary
  console.log("\n" + "═".repeat(70));
  console.log("🎉 ALL TESTS PASSED!");
  console.log("═".repeat(70));
  
  console.log("\n📊 Test Results:");
  console.log("   ✅ Factory deployment");
  console.log("   ✅ getAddress function correctness");
  console.log("   ✅ Account creation");
  console.log("   ✅ Account property verification");
  console.log("   ✅ Idempotent creation");
  console.log("   ✅ Multiple unique accounts");
  
  console.log("\n💡 Deployment Recommendations:");
  console.log("   1. The contracts are working correctly");
  console.log("   2. Run dry-run script to check gas costs:");
  console.log("      npx hardhat run scripts/dry-run-deployment.ts --network monad-testnet");
  console.log("   3. If dry-run passes, deploy with:");
  console.log("      npm run deploy:monad");
  
  console.log("\n" + "═".repeat(70));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });

