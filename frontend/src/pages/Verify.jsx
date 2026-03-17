import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { ipfsUrl } from "../utils/ipfs";
import { nftExplorerUrl } from "../utils/explorer";
import { LAND_NFT_ADDRESS } from "../config";

export default function Verify() {
  const { landNFT, chainId } = useWallet();
  const [tokenId, setTokenId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!landNFT || !tokenId) {
      setError("Connect a wallet with contract access and enter a token ID.");
      return;
    }
    setLoading(true);
    try {
      const info = await landNFT.getLandInfo(Number(tokenId));
      let metadata = null;
      try {
        const res = await fetch(ipfsUrl(info.metadataURI));
        if (res.ok) metadata = await res.json();
      } catch {
        // ignore
      }
      setResult({
        tokenId: Number(tokenId),
        polygonHash: info.polygonHash,
        metadataURI: info.metadataURI,
        registeredAt: Number(info.registeredAt),
        owner: info.owner,
        metadata,
      });
    } catch (err) {
      setError(err.reason || err.message || "Failed to fetch on-chain data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-forest-800">Public Verification</h1>
        <p className="text-slate-600 mt-1">
          Anyone can verify a Land NFT by its token ID. We resolve on-chain metadata and IPFS proof.
        </p>
      </div>

      <form onSubmit={submit} className="rounded-xl bg-white p-6 shadow border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Land token ID</label>
          <input
            type="number"
            min="1"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
            placeholder="e.g. 1"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-forest-600 text-white py-2 rounded-lg font-medium hover:bg-forest-700 disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Verify parcel"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {result && (
        <div className="rounded-xl bg-white p-6 shadow border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-mono">Token ID #{result.tokenId}</div>
              <h2 className="font-semibold text-forest-800 mt-1">
                {result.metadata?.name || `Land Parcel #${result.tokenId}`}
              </h2>
            </div>
            <a
              href={nftExplorerUrl(chainId, LAND_NFT_ADDRESS, result.tokenId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-600 text-xs hover:underline"
            >
              View on PolygonScan →
            </a>
          </div>
          <p className="text-sm text-slate-600">
            {result.metadata?.description || "Verified carbon offset land parcel"}
          </p>
          <div className="text-xs text-slate-500 space-y-1">
            <div>
              <span className="font-semibold">Owner:</span>{" "}
              <span className="font-mono break-all">{result.owner}</span>
            </div>
            <div>
              <span className="font-semibold">Polygon hash:</span>{" "}
              <span className="font-mono break-all">{result.polygonHash}</span>
            </div>
            <div>
              <span className="font-semibold">Registered at:</span>{" "}
              {new Date(result.registeredAt * 1000).toLocaleString()}
            </div>
          </div>
          {result.metadataURI && (
            <a
              href={ipfsUrl(result.metadataURI)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-600 text-sm hover:underline inline-block mt-2"
            >
              View IPFS metadata →
            </a>
          )}
          {result.metadata?.satelliteImage && (
            <img
              src={ipfsUrl(result.metadata.satelliteImage)}
              alt="Satellite proof"
              className="mt-3 rounded-lg border border-slate-200 w-full max-h-56 object-cover"
            />
          )}
        </div>
      )}
    </div>
  );
}

