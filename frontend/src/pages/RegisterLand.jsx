import { useState, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import toast from "react-hot-toast";
import * as turf from "@turf/turf";
import MapDraw from "../components/MapDraw";
import { useWallet } from "../context/WalletContext";
import { buildLandMetadata, uploadToIPFS } from "../utils/ipfs";
import { polygonToHash } from "../utils/polygonHash";
import { latlngsToGeoJSON, checkOverlap } from "../utils/overlap";
import { txExplorerUrl } from "../utils/explorer";
import { addTx, updateTx } from "../utils/txHistory";

// For MVP: existing polygons for overlap check. In production, load from index/API/subgraph.
const EXISTING_POLYGONS = [];

export default function RegisterLand() {
  const { account, provider, landNFT, refreshBalances, chainId } = useWallet();
  const [drawnCoords, setDrawnCoords] = useState(null);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [overlapResult, setOverlapResult] = useState(null);
  const [areaEstimate, setAreaEstimate] = useState(null); // { ha, creditsPerYear }

  const onPolygon = useCallback((latlngs) => {
    const coords = latlngs.map((ll) => [ll.lng, ll.lat]);
    setDrawnCoords(coords);
    const geojson = latlngsToGeoJSON(latlngs);
    if (geojson) {
      const result = checkOverlap(geojson, EXISTING_POLYGONS);
      setOverlapResult(result);
      // Rough sequestration estimator: 2 tCO2/ha/year
      try {
        const m2 = turf.area(geojson);
        const ha = m2 / 10000;
        const creditsPerYear = Math.max(0, Math.round(ha * 2));
        setAreaEstimate({ ha, creditsPerYear });
      } catch {
        setAreaEstimate(null);
      }
    } else {
      setOverlapResult({ allowed: false, message: "Invalid polygon." });
      setAreaEstimate(null);
    }
  }, []);

  const register = async () => {
    if (!account || !landNFT || !drawnCoords || (overlapResult && !overlapResult.allowed)) return;
    setStatus({ type: "pending", message: "Uploading metadata to IPFS…" });
    try {
      const polygonHash = polygonToHash(drawnCoords);
      const metadata = buildLandMetadata("pending", polygonHash, drawnCoords, "");
      const uri = await uploadToIPFS(metadata);
      setStatus({ type: "pending", message: "Minting Land NFT…" });
      const signer = await provider.getSigner();
      const landNFTWithSigner = landNFT.connect(signer);
      const tx = await landNFTWithSigner.registerLand(polygonHash, uri);
      addTx({ hash: tx.hash, label: "Register Land (mint NFT)", chainId, status: "pending" });
      toast.loading(
        <span>
          Registering land…{" "}
          <a className="underline" href={txExplorerUrl(chainId, tx.hash)} target="_blank" rel="noreferrer">
            View
          </a>
        </span>,
        { id: tx.hash }
      );
      await tx.wait();
      setStatus({ type: "success", message: `Land registered! Tx: ${tx.hash}` });
      updateTx(tx.hash, { status: "success" });
      toast.success("Land NFT minted", { id: tx.hash });
      setDrawnCoords(null);
      setOverlapResult(null);
      refreshBalances();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.reason || err.message || "Registration failed",
      });
      toast.error(err.reason || err.message || "Registration failed");
    }
  };

  if (!account) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-6 text-center text-amber-800">
        Connect your wallet to register land.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-forest-800">Register Land</h1>
        <p className="text-slate-600 mt-1">
          Draw your land boundary on the map. We check overlap with existing parcels (&lt;5% allowed).
          Then we upload metadata to IPFS and mint a Land NFT.
        </p>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200 shadow h-[400px] bg-slate-100">
        <MapContainer
          center={[20.0, 77.0]}
          zoom={4}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapDraw onPolygon={onPolygon} />
        </MapContainer>
      </div>

      {overlapResult && (
        <p
          className={
            overlapResult.allowed
              ? "text-green-600 text-sm"
              : "text-red-600 text-sm"
          }
        >
          {overlapResult.message}
        </p>
      )}
      {areaEstimate && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
          <div className="font-semibold mb-1">Estimated sequestration</div>
          <p>
            Area ≈{" "}
            <span className="font-mono">
              {areaEstimate.ha.toFixed(2)} ha
            </span>
            . Using{" "}
            <span className="font-mono">2 tCO₂/ha/year</span>, you could earn
            approximately{" "}
            <span className="font-mono">
              {areaEstimate.creditsPerYear} CSC/year
            </span>
            .
          </p>
          <p className="mt-1 text-xs text-emerald-800">
            Rough educational estimate for demo purposes.
          </p>
        </div>
      )}

      {!landNFT && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
          <strong>Contract addresses not set.</strong> Add VITE_CARBON_TOKEN_ADDRESS and VITE_LAND_NFT_ADDRESS to{" "}
          <code className="bg-amber-100 px-1">frontend/.env</code>, then restart the dev server. Deploy first:{" "}
          <code className="bg-amber-100 px-1">cd contracts && npx hardhat run scripts/deploy.js --network amoy</code> (set PRIVATE_KEY in contracts/.env).
        </div>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={register}
          disabled={
            !landNFT ||
            !drawnCoords ||
            (overlapResult && !overlapResult.allowed) ||
            status.type === "pending"
          }
          className="bg-forest-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-forest-700 disabled:opacity-50"
        >
          {status.type === "pending" ? "Registering…" : "Register Land (mint NFT)"}
        </button>
      </div>

      {status.type === "success" && (
        <p className="text-green-600 text-sm">{status.message}</p>
      )}
      {status.type === "error" && (
        <p className="text-red-600 text-sm">{status.message}</p>
      )}
    </div>
  );
}
