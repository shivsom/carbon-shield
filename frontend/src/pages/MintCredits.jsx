import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useWallet } from "../context/WalletContext";
import { txExplorerUrl } from "../utils/explorer";
import { addTx, updateTx } from "../utils/txHistory";

export default function MintCredits() {
  const { account, provider, landIds, landNFT, refreshBalances, chainId } = useWallet();
  const [landTokenId, setLandTokenId] = useState("");
  const [amount, setAmount] = useState("");
  const [tx, setTx] = useState({ status: "idle", hash: null, error: null });

  const submit = async (e) => {
    e.preventDefault();
    if (!landNFT || !account || !provider) return;
    setTx({ status: "pending", hash: null, error: null });
    try {
      const signer = await provider.getSigner();
      const amt = ethers.parseEther(amount || "0");
      const res = await landNFT.connect(signer).requestMintCredits(Number(landTokenId), amt);
      addTx({ hash: res.hash, label: "Mint Credits (CSC)", chainId, status: "pending" });
      toast.loading(
        <span>
          Minting…{" "}
          <a className="underline" href={txExplorerUrl(chainId, res.hash)} target="_blank" rel="noreferrer">
            View
          </a>
        </span>,
        { id: res.hash }
      );
      await res.wait();
      setTx({ status: "success", hash: res.hash, error: null });
      updateTx(res.hash, { status: "success" });
      toast.success("Credits minted", { id: res.hash });
      setAmount("");
      refreshBalances();
    } catch (err) {
      setTx({
        status: "error",
        hash: null,
        error: err.reason || err.message || "Transaction failed",
      });
      toast.error(err.reason || err.message || "Transaction failed");
    }
  };

  if (!account) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-6 text-center text-amber-800">
        Connect your wallet to mint credits.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-forest-800">Mint Carbon Credits</h1>
      <p className="text-slate-600">
        Only the owner of a Land NFT can mint CarbonShield Credits (CSC) for that parcel.
        Enter the Land token ID and amount (in whole tokens).
      </p>

      <form onSubmit={submit} className="rounded-xl bg-white p-6 shadow border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Land NFT Token ID
          </label>
          <select
            value={landTokenId}
            onChange={(e) => setLandTokenId(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
            required
          >
            <option value="">Select a parcel</option>
            {landIds.map((id) => (
              <option key={id} value={id}>#{id}</option>
            ))}
          </select>
          {landIds.length === 0 && (
            <p className="text-sm text-amber-600 mt-1">Register land first to get token IDs.</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Amount (CSC)
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 100"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
          />
        </div>
        <button
          type="submit"
          disabled={tx.status === "pending" || landIds.length === 0}
          className="w-full bg-forest-600 text-white py-2 rounded-lg font-medium hover:bg-forest-700 disabled:opacity-50"
        >
          {tx.status === "pending" ? "Minting…" : "Mint Credits"}
        </button>

        {tx.status === "success" && tx.hash && (
          <p className="text-sm text-green-600">
            Success!{" "}
            <a
              href={txExplorerUrl(chainId, tx.hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View transaction
            </a>
          </p>
        )}
        {tx.status === "error" && (
          <p className="text-sm text-red-600">{tx.error}</p>
        )}
      </form>
    </div>
  );
}
