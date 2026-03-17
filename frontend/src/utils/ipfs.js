/**
 * IPFS upload via Pinata.
 * Set VITE_PINATA_JWT in .env (from Pinata API Keys -> JWT).
 * Metadata JSON is uploaded; returned URI is used in Land NFT mint.
 */
import axios from "axios";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || "";
const PINATA_UPLOAD = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

/**
 * Build Land NFT metadata object (matches spec).
 * @param tokenId - Will be set as name suffix
 * @param polygonHash - Hex string
 * @param coordinates - [[lng, lat], ...]
 * @param satelliteImage - Optional IPFS or URL
 */
export function buildLandMetadata(tokenId, polygonHash, coordinates, satelliteImage = "") {
  return {
    name: `CarbonShield Land Parcel #${tokenId}`,
    description: "Verified carbon offset land parcel",
    polygonHash,
    coordinates,
    satelliteImage,
    registeredAt: new Date().toISOString(),
  };
}

/**
 * Upload JSON to IPFS via Pinata. Returns ipfs://Qm... URI.
 */
export async function uploadToIPFS(json) {
  if (!PINATA_JWT) {
    throw new Error("VITE_PINATA_JWT not set. Add JWT from Pinata dashboard.");
  }
  const { data } = await axios.post(
    PINATA_UPLOAD,
    json,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    }
  );
  return `ipfs://${data.IpfsHash}`;
}

/**
 * Retrieve metadata from IPFS URI (ipfs://... or gateway URL).
 */
export function ipfsUrl(uri) {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return `https://gateway.pinata.cloud/ipfs/${uri.slice(7)}`;
  }
  return uri;
}
