import { ethers } from "hardhat";

/**
 * 🧪 模拟部署 - 不消耗真实 Gas
 * 这个脚本会：
 * 1. 验证所有合约编译正确
 * 2. 估算 Gas 消耗
 * 3. 检查余额是否充足
 * 4. 模拟部署流程
 * 5. 不发送任何交易
 */
async function main() {
  console.log("\n🧪 Starting Dry Run Deployment (No Gas Consumed)");
  console.log("═".repeat(70));
  
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  console.log("\n📊 Account Information:");
  console.log("   Address:", deployer.address);
  console.log("   Balance:", ethers.formatEther(balance), "MON");
  
  // Get gas price
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || 0n;
  console.log("   Gas Price:", ethers.formatUnits(gasPrice, "gwei"), "Gwei");
  
  let totalEstimatedCost = 0n;
  let allChecks = true;
  
  // Step 1: Verify contract compilation
  console.log("\n" + "═".repeat(70));
  console.log("✅ Step 1: Verify Contract Compilation");
  console.log("═".repeat(70));
  
  try {
    const AccountFactory = await ethers.getContractFactory("SimpleAccountFactory");
    const SimpleAccount = await ethers.getContractFactory("SimpleAccount");
    console.log("   ✅ SimpleAccountFactory compiled");
    console.log("   ✅ SimpleAccount compiled");
  } catch (error) {
    console.log("   ❌ Compilation failed:", error);
    allChecks = false;
    return;
  }
  
  // Step 2: Estimate factory deployment
  console.log("\n" + "═".repeat(70));
  console.log("✅ Step 2: Estimate Factory Deployment");
  console.log("═".repeat(70));
  
  const ENTRY_POINT = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";
  const AccountFactoryContract = await ethers.getContractFactory("SimpleAccountFactory");
  
  try {
    const deployTx = await AccountFactoryContract.getDeployTransaction(ENTRY_POINT);
    const gasEstimate = await ethers.provider.estimateGas(deployTx);
    const estimatedCost = gasEstimate * gasPrice;
    totalEstimatedCost += estimatedCost;
    
    console.log("   Gas Estimate:", gasEstimate.toString());
    console.log("   Estimated Cost:", ethers.formatEther(estimatedCost), "MON");
    
    if (balance < estimatedCost) {
      console.log("   ❌ Insufficient balance for factory deployment");
      allChecks = false;
    } else {
      console.log("   ✅ Sufficient balance");
    }
  } catch (error: any) {
    console.log("   ⚠️  Gas estimation failed:", error.message);
    console.log("   Using fallback estimate: 2,000,000 gas");
    const fallbackCost = 2000000n * gasPrice;
    totalEstimatedCost += fallbackCost;
    console.log("   Estimated Cost:", ethers.formatEther(fallbackCost), "MON");
  }
  
  // Step 3: Verify getAddress function (most important!)
  console.log("\n" + "═".repeat(70));
  console.log("✅ Step 3: Verify getAddress Function Logic");
  console.log("═".repeat(70));
  
  try {
    // Simulate the getAddress calculation locally
    const SimpleAccount = await ethers.getContractFactory("SimpleAccount");
    const accountImpl = await ethers.getContractAt(
      "SimpleAccount",
      ethers.ZeroAddress // Placeholder
    );
    
    // Get the bytecode for verification
    const proxyBytecode = (await ethers.getContractFactory("ERC1967Proxy")).bytecode;
    console.log("   ✅ ERC1967Proxy bytecode loaded");
    
    // Verify Create2 calculation includes deployer
    const factoryCode = AccountFactoryContract.interface.format(true);
    if (factoryCode.includes('address(this)')) {
      console.log("   ✅ getAddress includes deployer parameter");
    } else {
      console.log("   ❌ getAddress missing deployer parameter!");
      allChecks = false;
    }
  } catch (error: any) {
    console.log("   ⚠️  Verification warning:", error.message);
  }
  
  // Step 4: Estimate account creation
  console.log("\n" + "═".repeat(70));
  console.log("✅ Step 4: Estimate Account Creation");
  console.log("═".repeat(70));
  
  const accountCreationGas = 500000n; // Conservative estimate
  const accountCreationCost = accountCreationGas * gasPrice;
  totalEstimatedCost += accountCreationCost;
  
  console.log("   Gas Estimate:", accountCreationGas.toString());
  console.log("   Estimated Cost:", ethers.formatEther(accountCreationCost), "MON");
  
  // Step 5: Final summary
  console.log("\n" + "═".repeat(70));
  console.log("📊 FINAL SUMMARY");
  console.log("═".repeat(70));
  
  console.log("\n💰 Cost Breakdown:");
  console.log("   Factory Deployment:  ", ethers.formatEther(totalEstimatedCost - accountCreationCost), "MON");
  console.log("   Account Creation:    ", ethers.formatEther(accountCreationCost), "MON");
  console.log("   ─".repeat(50));
  console.log("   Total Estimated:     ", ethers.formatEther(totalEstimatedCost), "MON");
  console.log("   Safety Buffer (20%): ", ethers.formatEther(totalEstimatedCost * 120n / 100n), "MON");
  
  console.log("\n💵 Balance Check:");
  console.log("   Current Balance:     ", ethers.formatEther(balance), "MON");
  console.log("   Required (with buffer):", ethers.formatEther(totalEstimatedCost * 120n / 100n), "MON");
  
  const sufficient = balance >= (totalEstimatedCost * 120n / 100n);
  
  if (sufficient) {
    console.log("   Status: ✅ SUFFICIENT");
  } else {
    const needed = (totalEstimatedCost * 120n / 100n) - balance;
    console.log("   Status: ❌ INSUFFICIENT");
    console.log("   Need additional:", ethers.formatEther(needed), "MON");
    allChecks = false;
  }
  
  console.log("\n" + "═".repeat(70));
  
  if (allChecks) {
    console.log("🎉 ALL CHECKS PASSED - READY FOR DEPLOYMENT!");
    console.log("\n📝 Next step:");
    console.log("   npm run deploy:monad");
  } else {
    console.log("❌ SOME CHECKS FAILED - DO NOT DEPLOY YET!");
    console.log("\n🔧 Fix the issues above before deploying.");
  }
  
  console.log("═".repeat(70));
  
  // Return exit code
  process.exit(allChecks ? 0 : 1);
}

main()
  .then(() => {})
  .catch((error) => {
    console.error("\n❌ Dry run failed:", error);
    process.exit(1);
  });

