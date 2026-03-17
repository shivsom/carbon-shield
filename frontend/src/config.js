// Contract addresses (set after deployment; override via .env)
export const CARBON_TOKEN_ADDRESS =
  import.meta.env.VITE_CARBON_TOKEN_ADDRESS || "";
export const LAND_NFT_ADDRESS =
  import.meta.env.VITE_LAND_NFT_ADDRESS || "";

export const MUMBAI_CHAIN_ID = "0x13881"; // 80001
export const AMOY_CHAIN_ID = "0x13882"; // 80002 - Polygon Amoy testnet (use if Mumbai is down)
export const SUPPORTED_CHAIN_IDS = [MUMBAI_CHAIN_ID, AMOY_CHAIN_ID];
export const MUMBAI_RPC = "https://rpc-mumbai.maticvigil.com";
export const AMOY_RPC = "https://rpc-amoy.polygon.technology";

export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
