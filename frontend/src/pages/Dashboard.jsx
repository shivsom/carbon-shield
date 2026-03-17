import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { ipfsUrl } from "../utils/ipfs";
import { LAND_NFT_ADDRESS } from "../config";
import { nftExplorerUrl } from "../utils/explorer";
import ActivityPanel from "../components/ActivityPanel";
import { useDemoMode } from "../hooks/useDemoMode";

export default function Dashboard() {
  const { account, creditBalance, landIds, landNFT, refreshBalances, chainId } = useWallet();
  const { demoMode } = useDemoMode();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account || !landNFT) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const list = [];
      for (const id of landIds) {
        try {
          const info = await landNFT.getLandInfo(id);
          let meta = null;
          try {
            const res = await fetch(ipfsUrl(info.metadataURI));
            if (res.ok) meta = await res.json();
          } catch (_) {}
          list.push({
            tokenId: id,
            polygonHash: info.polygonHash,
            metadataURI: info.metadataURI,
            registeredAt: Number(info.registeredAt),
            metadata: meta,
          });
        } catch (e) {
          console.error(e);
        }
      }
      if (!cancelled) setLands(list);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [account, landNFT, landIds]);

  if (!account || demoMode) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-6 text-center text-amber-800">
          {demoMode
            ? "Demo Mode is enabled. Showing a sample dashboard so the UI is always populated."
            : "Connect your wallet to see your live dashboard. Below is a sample view with fake data to illustrate how CarbonShield works."}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow border border-slate-200">
            <h2 className="text-lg font-semibold text-forest-800 mb-2">Carbon credits (CSC)</h2>
            <p className="text-3xl font-mono text-forest-700">1,250</p>
            <p className="text-sm text-slate-500 mt-1">Sample balance for demo</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow border border-slate-200">
            <h2 className="text-lg font-semibold text-forest-800 mb-2">Retired credits</h2>
            <p className="text-3xl font-mono text-forest-700">420</p>
            <p className="text-sm text-slate-500 mt-1">Already offset on-chain (sample)</p>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-forest-800 mb-4">Sample Land NFTs</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((id) => (
              <div
                key={id}
                className="rounded-xl bg-white p-4 shadow border border-slate-200"
              >
                <div className="font-mono text-sm text-slate-500">Token ID #{id}</div>
                <h3 className="font-semibold text-forest-800 mt-1">
                  Sample Land Parcel #{id}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Demo parcel used to showcase verifiable carbon sequestration.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Registered 2024-01-01 (sample data)
                </p>
                <span className="inline-flex mt-2 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                  Proof stored on IPFS
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-forest-800">Dashboard</h1>
        <button
          onClick={refreshBalances}
          className="text-forest-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      <ActivityPanel />

      <div className="rounded-xl bg-white p-6 shadow border border-slate-200">
        <h2 className="text-lg font-semibold text-forest-800 mb-2">Carbon credits (CSC)</h2>
        <p className="text-3xl font-mono text-forest-700">{creditBalance}</p>
        <p className="text-sm text-slate-500 mt-1">ERC20 on Polygon (Amoy/Mumbai supported)</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-forest-800 mb-4">Your Land NFTs</h2>
        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : lands.length === 0 ? (
          <p className="text-slate-500">No land parcels registered yet. Register land first.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {lands.map((land) => (
              <div
                key={land.tokenId}
                className="rounded-xl bg-white p-4 shadow border border-slate-200"
              >
                <div className="font-mono text-sm text-slate-500">Token ID #{land.tokenId}</div>
                <h3 className="font-semibold text-forest-800 mt-1">
                  {land.metadata?.name || `Land Parcel #${land.tokenId}`}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {land.metadata?.description || "Verified carbon offset land parcel"}
                </p>
                <div className="mt-3 space-y-2">
                  <div className="text-xs text-slate-500">
                    <span className="font-mono">Polygon hash:</span>{" "}
                    <span className="font-mono break-all">{land.polygonHash}</span>
                  </div>
                  {land.metadataURI && (
                    <a
                      href={ipfsUrl(land.metadataURI)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest-600 text-sm hover:underline inline-block"
                    >
                      Proof on IPFS →
                    </a>
                  )}
                  {land.metadata?.satelliteImage && (
                    <img
                      src={ipfsUrl(land.metadata.satelliteImage)}
                      alt="Parcel proof"
                      className="rounded-lg border border-slate-200 w-full max-h-48 object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Registered {new Date(land.registeredAt * 1000).toLocaleDateString()}
                </p>
                <a
                  href={nftExplorerUrl(chainId, LAND_NFT_ADDRESS, land.tokenId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest-600 text-sm hover:underline mt-2 inline-block"
                >
                  View on PolygonScan →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
