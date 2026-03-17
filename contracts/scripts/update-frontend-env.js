/**
 * After deploy, run: node scripts/update-frontend-env.js
 * Reads deployed-addresses.json and updates frontend/.env with contract addresses.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const addressesPath = path.join(root, "deployed-addresses.json");
const envPath = path.join(root, "frontend", ".env");

if (!fs.existsSync(addressesPath)) {
  console.error("Run deploy first: npx hardhat run scripts/deploy.js --network amoy");
  process.exit(1);
}

const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
let env = "";
if (fs.existsSync(envPath)) {
  env = fs.readFileSync(envPath, "utf8");
  env = env.replace(/VITE_CARBON_TOKEN_ADDRESS=.*/m, "VITE_CARBON_TOKEN_ADDRESS=" + (addresses.VITE_CARBON_TOKEN_ADDRESS || ""));
  env = env.replace(/VITE_LAND_NFT_ADDRESS=.*/m, "VITE_LAND_NFT_ADDRESS=" + (addresses.VITE_LAND_NFT_ADDRESS || ""));
} else {
  env = `VITE_CARBON_TOKEN_ADDRESS=${addresses.VITE_CARBON_TOKEN_ADDRESS || ""}
VITE_LAND_NFT_ADDRESS=${addresses.VITE_LAND_NFT_ADDRESS || ""}
VITE_PINATA_JWT=
`;
}
fs.writeFileSync(envPath, env);
console.log("Updated frontend/.env with contract addresses. Restart the frontend (npm run dev).");
console.log("VITE_CARBON_TOKEN_ADDRESS=" + addresses.VITE_CARBON_TOKEN_ADDRESS);
console.log("VITE_LAND_NFT_ADDRESS=" + addresses.VITE_LAND_NFT_ADDRESS);
console.log("VITE_PINATA_JWT is unchanged.");
process.exit(0);
