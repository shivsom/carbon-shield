import { AMOY_CHAIN_ID, SUPPORTED_CHAIN_IDS } from "../config";
import { useWallet } from "../context/WalletContext";

export default function NetworkBanner() {
  const { account, chainId, ensureAmoy } = useWallet();

  if (!account) return null;
  if (!chainId) return null;
  if (SUPPORTED_CHAIN_IDS.includes(chainId)) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="container mx-auto px-4 max-w-6xl py-3 flex items-center justify-between gap-3">
        <div className="text-amber-900 text-sm">
          <strong>Wrong network.</strong>{" "}
          Switch to <span className="font-semibold">Polygon Amoy</span> (chainId {AMOY_CHAIN_ID}).
        </div>
        <button
          onClick={ensureAmoy}
          className="bg-amber-200 hover:bg-amber-300 text-amber-950 px-3 py-1.5 rounded-lg text-sm font-medium"
        >
          Switch to Amoy
        </button>
      </div>
    </div>
  );
}

