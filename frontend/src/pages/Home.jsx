import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-forest-800 mb-4">
          CarbonShield
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          A blockchain-based micro carbon credit platform. Register land as NFTs,
          mint credits, and retire them to offset emissions — all on Polygon.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card
          to="/register"
          title="Register Land"
          description="Draw your land boundary on the map. We validate polygon overlap and mint a unique Land NFT with IPFS metadata."
        />
        <Card
          to="/mint"
          title="Mint Credits"
          description="As a land owner, mint carbon credits (ERC20) tied to your registered Land NFT."
        />
        <Card
          to="/offset"
          title="Offset / Burn"
          description="Retire (burn) carbon credits to offset your emissions. Optional reason stored on-chain."
        />
        <Card
          to="/dashboard"
          title="Dashboard"
          description="View your Land NFTs and carbon credit balance in one place."
        />
      </section>

      <section className="rounded-xl bg-white p-6 shadow border border-slate-200">
        <h2 className="text-xl font-semibold text-forest-800 mb-3">How it works</h2>
        <ol className="list-decimal list-inside space-y-2 text-slate-600">
          <li>Connect MetaMask to Polygon Mumbai.</li>
          <li>Register Land: draw a polygon on the map; we check &lt;5% overlap with existing parcels, then mint a Land NFT (ERC721) with IPFS metadata.</li>
          <li>Mint Credits: land owners can mint CarbonShield Credits (ERC20) per registered parcel.</li>
          <li>Retire credits when you offset emissions; the burn is recorded on-chain.</li>
        </ol>
      </section>
    </div>
  );
}

function Card({ to, title, description }) {
  return (
    <Link
      to={to}
      className="block rounded-xl bg-white p-6 shadow border border-slate-200 hover:border-forest-600 hover:shadow-md transition"
    >
      <h3 className="font-semibold text-forest-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </Link>
  );
}
