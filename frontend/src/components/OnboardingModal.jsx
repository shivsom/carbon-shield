import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "carbonshield_onboarding_seen";

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) setOpen(true);
    } catch {
      // ignore storage issues
    }
  }, []);

  const close = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-forest-800">Welcome to CarbonShield</h2>
            <p className="text-sm text-slate-600 mt-1">
              In 3 quick steps we&apos;ll go from land parcel to retired on-chain carbon credits.
            </p>
          </div>
          <button
            onClick={close}
            className="text-slate-400 hover:text-slate-600 text-sm"
          >
            Skip
          </button>
        </div>
        <ol className="space-y-2 text-sm text-slate-700">
          <li>
            <span className="font-semibold">1. Connect wallet &amp; switch to Polygon Amoy</span>{" "}
            (you&apos;ll see a banner if you&apos;re on the wrong network).
          </li>
          <li>
            <span className="font-semibold">2. Register land</span> by drawing a parcel and minting a Land NFT
            with proof stored on IPFS.
          </li>
          <li>
            <span className="font-semibold">3. Mint, transfer and retire credits</span> to show the full lifecycle.
          </li>
        </ol>
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => {
              navigate("/register");
              close();
            }}
            className="px-3 py-1.5 rounded-lg text-sm bg-forest-50 text-forest-800 hover:bg-forest-100"
          >
            Go to Register Land
          </button>
          <button
            onClick={() => {
              navigate("/mint");
              close();
            }}
            className="px-3 py-1.5 rounded-lg text-sm bg-forest-600 text-white hover:bg-forest-700"
          >
            Start demo flow
          </button>
        </div>
      </div>
    </div>
  );
}

