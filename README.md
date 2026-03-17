# CarbonShield – Blockchain-Based Micro Carbon Credit Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A hackathon-ready MVP for micro carbon credits on Polygon. Landowners register parcels as ERC721 NFTs (with polygon hash for uniqueness and IPFS metadata), mint ERC20 CarbonShield Credits (CSC), and retire them for offsets. Features client-side overlap detection (<5%), on-chain duplicate prevention, and full audit-ready contracts.

**Live Demo Flow**: Draw polygon → Mint Land NFT → Mint Credits → Retire (burn).

**Tech Stack**:
| Layer | Tech |
|-------|------|
| Contracts | Solidity 0.8, OpenZeppelin, Hardhat |
| Chain | Polygon Amoy (80002) / Mumbai (80001) |
| Frontend | React 18, Vite, Tailwind, Ethers.js v6 |
| Map/Geo | Leaflet, Leaflet-Draw, Turf.js |
| Storage | IPFS (Pinata) |

## 🚀 Quick Start

```bash
# Clone & Install
git clone <repo> carbon-shield
cd carbon-shield
npm run install:all

# 1. Deploy Contracts (Polygon Amoy/Mumbai)
cd contracts
cp .env.example .env  # Add PRIVATE_KEY (with test MATIC)
npx hardhat compile
npx hardhat run scripts/deploy.js --network amoy  # Copy addresses

# 2. Update Frontend Env
node scripts/update-frontend-env.js  # Or manual .env
cd ../frontend
cp .env.example .env  # Add VITE_PINATA_JWT (app.pinata.cloud)

# 3. Run
npm run dev  # http://localhost:3000
```

**Requirements**:
- Node.js 18+
- MetaMask (Polygon Amoy: Chain ID 80002)
- Test MATIC: [faucet.polygon.technology](https://faucet.polygon.technology/)
- Pinata JWT: [app.pinata.cloud](https://app.pinata.cloud/)

## 🏗️ Architecture

### High-Level Flow
```
User (Browser/MetaMask)
  ↓
Frontend (React + Ethers + Leaflet + Turf)
  ↓ Pinata IPFS (metadata JSON: coords, hash, image)
  ↓ Polygon Mumbai/Amoy
Smart Contracts
  - LandNFT (ERC721): polygonHash → tokenId, metadataURI
  - CarbonCreditToken (ERC20): mint/burn credits
```

**ASCII Diagram**:
```
┌─── USER ───┐
│ MetaMask   │
└───┬───────┘
    │
┌───v───────┐  ┌─── Pinata ───┐
│ Frontend  │──│ IPFS Metadata │
│• Draw poly│  │• GeoJSON, img │
│• Overlap <5%│  └────────────┘
│• Mint NFT │
└───┬───────┘
    │ tx: registerLand()
    ▼
┌──────────────┐
│ LandNFT ERC721│── requestMintCredits ──→ CarbonCreditToken ERC20
│• Unique hash │     • Mint to owner
│• Owner mints │     • Retire (burn)
└──────────────┘
```

### Data Flow
1. **Register Land**: Draw → Turf overlap → IPFS metadata → `registerLand(hash, ipfsUri)` → NFT minted.
2. **Mint Credits**: `requestMintCredits(tokenId, amount)` → ERC20.mint(owner, amount, tokenId).
3. **Retire**: `retire(amount, 'Flight offset')` → Burn + event.

**On-Chain vs Off-Chain**:
| Data | Storage | Purpose |
|------|---------|---------|
| Polygon Hash | LandNFT | Duplicate prevention |
| Metadata URI | LandNFT | Links to IPFS |
| Coordinates | IPFS JSON | Full GeoJSON |
| Credits | ERC20 | Transferable offsets |
| Satellite Img | IPFS (opt) | Visual proof |

## 📋 Smart Contracts

### CarbonCreditToken (ERC20)
- **mint(to, amount, landTokenId)**: Only from LandNFT. Emits `CarbonMinted`.
- **retire(amount, reason)**: Permissionless burn. Emits `CreditRetired`.
- Access: `setLandNFT` (owner-only).

### LandNFT (ERC721 + ReentrancyGuard)
- **registerLand(polygonHash, metadataURI)**: Mint if hash unique. nonReentrant.
- **requestMintCredits(landTokenId, amount)**: Owner-only, calls ERC20.mint. nonReentrant.
- **Views**: `getLandInfo(tokenId)`, `getTokenIdsOf(owner)`.
- Mappings: `polygonHashToTokenId`, per-token info.

**Deployment**:
1. Deploy CarbonCreditToken.
2. Deploy LandNFT.
3. `CarbonCreditToken.setLandNFT(landNFT)`.
4. `LandNFT.setCarbonToken(carbonToken)`.

**Security**: Owner checks, hash uniqueness, reentrancy guards, no external calls in critical paths.

## 🎯 Demo Script (60s Pitch + Live)

> **Pitch**: \"CarbonShield: Micro carbon credits on Polygon. Register land → NFT → Mint credits → Retire for offsets. Turf overlap check, IPFS metadata, on-chain hashes. Working MVP!\"

**Live (2-3min)**:
1. Connect MetaMask (Amoy).
2. **Register Land**: Draw polygon → Submit → PolygonScan tx.
3. **Mint Credits**: Select land → 100 CSC → Balance updates.
4. **Offset**: Retire 50 + reason → Burn confirmed.
5. **Dashboard**: View lands/credits/metadata.

**FAQs**:
- **Duplicates?** keccak256(polygon) on-chain.
- **Overlap?** Turf.js client-side (<5%).
- **Transfers?** ERC721 standard; new owner mints.

## 📁 Folder Structure
```
carbon-shield/
├── contracts/          # Hardhat, Solidity (LandNFT.sol, CarbonCreditToken.sol)
│   ├── scripts/deploy.js
│   └── hardhat.config.js
├── frontend/           # React/Vite
│   ├── src/
│   │   ├── components/ (Navbar, MapDraw)
│   │   ├── pages/      (RegisterLand, Dashboard)
│   │   ├── utils/      (ipfs.ts, turf-overlap.ts)
│   │   └── context/    (WalletContext.jsx)
├── ARCHITECTURE.md     # Detailed diagram/flow
├── CONTRACTS.md        # Contract deep-dive
├── DEMO_SCRIPT.md      # Pitch + Q&A
├── package.json        # npm scripts
└── README.md           # This file
```

## 🔧 Development

```bash
# Contracts
cd contracts
npm run compile  # or npx hardhat compile
npm run deploy:mumbai

# Frontend
cd frontend
npm run dev  # Vite dev server

# All
npm run install:all
```

**Env Vars**:
- contracts/.env: `PRIVATE_KEY`
- frontend/.env: `VITE_CARBON_TOKEN_ADDRESS`, `VITE_LAND_NFT_ADDRESS`, `VITE_PINATA_JWT`

## 🚀 Production / Extensions
- **Mainnet**: Swap to Polygon mainnet RPC, audited contracts.
- **Caps**: Add per-land/area mint limits.
- **Oracle**: Real satellite imagery, land verification.
- **Index**: Off-chain polygon index for overlap.
- **UI**: Mobile-responsive, multi-language.

## 🛡️ Security Notes (MVP)
- ReentrancyGuard on mutative functions.
- Mint-only-from-LandNFT.
- Events for indexing (TheGraph?).

## 📄 License
MIT License. See [LICENSE](LICENSE) for details.

**Built for hackathons 🚀. Deploy in <5min.**

