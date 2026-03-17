import { CARBON_TOKEN_ADDRESS, LAND_NFT_ADDRESS } from "../config";
import { useWallet } from "../context/WalletContext";
import { explorerBaseUrl } from "../utils/explorer";

export default function Footer() {
  const { chainId } = useWallet();
  const base = explorerBaseUrl(chainId);

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container mx-auto px-4 max-w-6xl py-6 text-sm text-slate-600 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="font-semibold text-forest-800">CarbonShield</span>{" "}
          <span className="text-slate-500">• OpenZeppelin-based contracts</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {LAND_NFT_ADDRESS && (
            <a
              className="hover:underline"
              href={`${base}/address/${LAND_NFT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
            >
              LandNFT: {LAND_NFT_ADDRESS.slice(0, 6)}…{LAND_NFT_ADDRESS.slice(-4)}
            </a>
          )}
          {CARBON_TOKEN_ADDRESS && (
            <a
              className="hover:underline"
              href={`${base}/address/${CARBON_TOKEN_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
            >
              CSC Token: {CARBON_TOKEN_ADDRESS.slice(0, 6)}…{CARBON_TOKEN_ADDRESS.slice(-4)}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

