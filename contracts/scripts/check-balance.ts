import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  console.log("\n📊 Account Information");
  console.log("═".repeat(50));
  console.log("Address:", deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "MON");
  console.log("═".repeat(50));
  
  if (balance < ethers.parseEther("0.1")) {
    console.log("\n⚠️  WARNING: Balance is low!");
    console.log("Please get more MON from faucet:");
    console.log("https://testnet-faucet.monad.xyz\n");
  } else {
    console.log("\n✅ Balance is sufficient for deployment\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

