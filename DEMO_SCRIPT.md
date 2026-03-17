# CarbonShield – Hackathon Demo Script

## 60-second pitch

> “CarbonShield is a micro carbon credit platform on Polygon. Landowners register a parcel by drawing it on a map; we mint a Land NFT with the polygon hash and IPFS metadata. Only that land’s owner can mint CarbonShield Credits — our ERC20 token. Anyone can retire credits to offset emissions; every mint and retirement is on-chain. We use Turf.js to keep overlap under 5% and Pinata for IPFS. It’s a working MVP on Polygon Mumbai: register land, mint credits, retire them — no overengineering, ready to extend.”

---

## Live demo flow (2–3 minutes)

1. **Connect**  
   “MetaMask on Polygon Mumbai. One click connect.”

2. **Register Land**  
   - Go to “Register Land”.  
   - “I draw my parcel with the polygon tool.”  
   - “Overlap is checked; under 5% is allowed.”  
   - “Metadata goes to IPFS; we mint the Land NFT.”  
   - Show tx on PolygonScan.

3. **Mint Credits**  
   - “As the land owner, I mint 100 CarbonShield Credits for this parcel.”  
   - Submit; show balance in navbar or Dashboard.

4. **Offset / Burn**  
   - “I retire 50 credits with a reason, e.g. ‘Flight offset’.”  
   - Submit; show balance drop and CreditRetired on PolygonScan.

5. **Dashboard**  
   - “Dashboard shows my Land NFTs and credit balance; metadata is loaded from IPFS.”

---

## Likely judge questions and answers

**Q: How do you prevent double-registration of the same land?**  
A: We store a keccak256 hash of the normalized polygon on-chain. `LandNFT.registerLand` reverts if that hash is already registered. So the same geometry can’t be minted twice.

**Q: Who can mint carbon credits?**  
A: Only the owner of a Land NFT. Minting is done via `LandNFT.requestMintCredits`, which checks `ownerOf(landTokenId) == msg.sender` and then calls `CarbonCreditToken.mint`. The token contract only accepts mint calls from the LandNFT contract.

**Q: How does overlap detection work?**  
A: In the frontend we use Turf.js: the drawn polygon is converted to GeoJSON; we compute intersection area with existing polygons (in a full product these would come from an index/API). If overlap area / new polygon area &gt; 5%, we block registration. On-chain we also enforce uniqueness via the polygon hash.

**Q: Where is metadata stored?**  
A: Land NFT metadata is JSON on IPFS (Pinata). It includes name, description, polygonHash, coordinates, optional satelliteImage, and registeredAt. The NFT stores only the IPFS URI on-chain.

**Q: Why Polygon?**  
A: Low fees and fast finality for a hackathon MVP; we deploy on Mumbai testnet. Same design can target mainnet or other chains.

**Q: How do you handle land transfer?**  
A: The Land NFT is a standard ERC721, so it can be transferred. The new owner becomes the only one who can call `requestMintCredits` for that token. (Note: our MVP keeps a simple owner→tokenIds list that’s updated only on mint; a production version could update it on transfer.)

**Q: Is there a cap on credits per parcel?**  
A: In this MVP there’s no per-parcel cap; the land owner can mint any amount. A production version could add caps or rules based on area/land type.
