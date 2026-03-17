import { AMOY_CHAIN_ID, MUMBAI_CHAIN_ID } from "../config";

export function explorerBaseUrl(chainIdHex) {
  if (chainIdHex === AMOY_CHAIN_ID) return "https://amoy.polygonscan.com";
  if (chainIdHex === MUMBAI_CHAIN_ID) return "https://mumbai.polygonscan.com";
  return "https://polygonscan.com";
}

export function txExplorerUrl(chainIdHex, txHash) {
  if (!txHash) return "";
  return `${explorerBaseUrl(chainIdHex)}/tx/${txHash}`;
}

export function nftExplorerUrl(chainIdHex, contractAddress, tokenId) {
  if (!contractAddress || tokenId == null) return "";
  return `${explorerBaseUrl(chainIdHex)}/nft/${contractAddress}/${tokenId}`;
}

