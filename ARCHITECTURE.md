# CarbonShield – Architecture

## High-level flow

```
User
  → Frontend (React + Ethers.js + Leaflet + Turf)
  → Smart contracts (Polygon Mumbai)
  → IPFS (Pinata) for Land NFT metadata
```

- **Satellite image**: Stored off-chain (IPFS or URL in metadata). Optional field `satelliteImage` in Land NFT metadata.
- **Polygon hash**: Stored on-chain in `LandNFT` (polygonHash → tokenId) to prevent duplicate land registration.

---

## Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                           │
│  MetaMask → Polygon Mumbai (Chain ID 80001)                     │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vite + React)                        │
│  • WalletContext: provider, CarbonToken, LandNFT, balances       │
│  • Register Land: Leaflet Draw → GeoJSON → Turf overlap check    │
│  • Build metadata → Pinata (IPFS) → ipfs:// URI                 │
│  • Mint Credits / Retire: ethers.js → contract methods           │
└──────────┬──────────────────────────────────┬───────────────────┘
           │                                  │
           │ (tx: registerLand,               │ (pin JSON)
           │  requestMintCredits, retire)      │
           ▼                                  ▼
┌──────────────────────────────┐    ┌─────────────────────────────┐
│  POLYGON MUMBAI (Chain)      │    │  IPFS (Pinata)              │
│  • LandNFT (ERC721)          │    │  • Land metadata JSON       │
│    - polygonHash, metadataURI│    │  • name, description,       │
│  • CarbonCreditToken (ERC20) │    │    polygonHash, coordinates,│
│    - mint / burn             │    │    satelliteImage,         │
│  Polygon hash on-chain       │    │    registeredAt             │
└──────────────────────────────┘    └─────────────────────────────┘
```

---

## Data flow

1. **Register Land**  
   User draws polygon → coordinates normalized & hashed (keccak256) → overlap checked (Turf, &lt;5%) → metadata JSON built → uploaded to IPFS (Pinata) → `registerLand(polygonHash, ipfsUri)` → Land NFT minted.

2. **Mint Credits**  
   User selects Land token ID and amount → `LandNFT.requestMintCredits(landTokenId, amount)` → LandNFT calls `CarbonCreditToken.mint(owner, amount, landTokenId)` → ERC20 credits minted.

3. **Offset / Burn**  
   User enters amount and optional reason → `CarbonCreditToken.retire(amount, reason)` → tokens burned, event emitted.

---

## Security (minimal for MVP)

- **Access control**: CarbonCreditToken.mint only from LandNFT; LandNFT.requestMintCredits only by land owner (ownerOf).
- **Reentrancy**: ReentrancyGuard on LandNFT register and requestMintCredits.
- **Duplicate land**: polygonHashToTokenId ensures one NFT per polygon hash.

---

## What’s off-chain vs on-chain

| Item              | Where              | Notes                          |
|-------------------|--------------------|---------------------------------|
| Polygon hash      | On-chain (LandNFT) | Duplicate check                |
| Metadata URI      | On-chain (LandNFT) | Points to IPFS                 |
| Full coordinates  | IPFS (metadata)    | GeoJSON in Land metadata       |
| Satellite image   | IPFS or URL        | Optional in metadata           |
| Credit balance    | On-chain (ERC20)   | CarbonCreditToken              |
