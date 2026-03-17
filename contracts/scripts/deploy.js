const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    console.error("\nMissing PRIVATE_KEY in contracts/.env");
    console.error("1. Add your deployer wallet private key to contracts/.env:");
    console.error("   PRIVATE_KEY=your_hex_private_key");
    console.error("2. Get test MATIC: https://faucet.polygon.technology/ (choose Amoy)");
    console.error("3. Run: npx hardhat run scripts/deploy.js --network amoy");
    process.exit(1);
  }
  console.log("Deploying with account:", deployer.address);

  // 1. Deploy CarbonCreditToken
  const CarbonCreditToken = await hre.ethers.getContractFactory("CarbonCreditToken");
  const carbonToken = await CarbonCreditToken.deploy();
  await carbonToken.waitForDeployment();
  const carbonTokenAddress = await carbonToken.getAddress();
  console.log("CarbonCreditToken deployed to:", carbonTokenAddress);

  // 2. Deploy LandNFT
  const LandNFT = await hre.ethers.getContractFactory("LandNFT");
  const landNFT = await LandNFT.deploy();
  await landNFT.waitForDeployment();
  const landNFTAddress = await landNFT.getAddress();
  console.log("LandNFT deployed to:", landNFTAddress);

  // 3. Link contracts
  await carbonToken.setLandNFT(landNFTAddress);
  await landNFT.setCarbonToken(carbonTokenAddress);
  console.log("Contracts linked.");

  console.log("\n--- Copy these to frontend .env ---");
  console.log("VITE_CARBON_TOKEN_ADDRESS=" + carbonTokenAddress);
  console.log("VITE_LAND_NFT_ADDRESS=" + landNFTAddress);

  const fs = require("fs");
  const path = require("path");
  const outPath = path.join(__dirname, "..", "..", "deployed-addresses.json");
  fs.writeFileSync(outPath, JSON.stringify({
    VITE_CARBON_TOKEN_ADDRESS: carbonTokenAddress,
    VITE_LAND_NFT_ADDRESS: landNFTAddress,
  }, null, 2));
  console.log("\nWrote " + outPath + " — run: node scripts/update-frontend-env.js");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
