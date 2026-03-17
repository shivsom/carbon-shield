# Smart contract explanations

## CarbonCreditToken (ERC20)

- **Purpose**: Represents carbon credits (CSC). Only Land NFT owners can mint; anyone can hold and retire (burn).
- **Inheritance**: OpenZeppelin `ERC20` (supply, balanceOf, transfer) and `Ownable` (setLandNFT).
- **Key state**: `landNFT` – address of the LandNFT contract; only this address may call `mint`.
- **mint(to, amount, landTokenId)**  
  Callable only by `landNFT`. Mints `amount` of CSC to `to` and emits `CarbonMinted(to, amount, landTokenId)`. Used when a land owner requests credits via LandNFT.
- **retire(amount, reason)**  
  Any holder can burn `amount` and optionally pass a `reason` string. Emits `CreditRetired(from, amount, reason)`. No access control beyond having balance.
- **totalSupply**  
  Tracked by ERC20; increases on mint, decreases on retire.
- **Access control**: `setLandNFT` is `onlyOwner`; `mint` is only from `landNFT`; `retire` is permissionless for holders.
- **Reentrancy**: No external calls that could reenter; no guard needed for this contract.

---

## LandNFT (ERC721)

- **Purpose**: Unique land parcels as NFTs. Stores polygon hash (for duplicate check) and IPFS metadata URI. Lets land owners request carbon credit mints.
- **Inheritance**: OpenZeppelin `ERC721`, `Ownable`, `ReentrancyGuard`.
- **Key state**:
  - `carbonToken` – CarbonCreditToken address; used when requesting mints.
  - `polygonHashToTokenId[bytes32]` – maps polygon hash → token ID (0 if not registered). Prevents duplicate land.
  - `tokenIdToPolygonHash`, `landInfo[tokenId]` – per-token polygon hash and metadata.
  - `_ownerTokenIds[owner]` – list of token IDs per owner (for frontend enumeration).
- **registerLand(polygonHash, metadataURI)**  
  Mints a new Land NFT to `msg.sender`. Reverts if `polygonHash` is already registered or URI is empty. Stores polygon hash, URI, owner, and timestamp; pushes token ID to `_ownerTokenIds[msg.sender]`. Emits `LandRegistered(owner, tokenId, polygonHash, metadataURI)`. Protected by `nonReentrant`.
- **requestMintCredits(landTokenId, amount)**  
  Callable only by the owner of `landTokenId`. Calls `CarbonCreditToken.mint(owner, amount, landTokenId)`. Protected by `nonReentrant`.
- **getLandInfo(tokenId)**  
  View that returns polygonHash, metadataURI, owner, registeredAt.
- **getTokenIdsOf(owner)**  
  View that returns the array of token IDs owned by `owner` (for dashboard/list).
- **Access control**: `setCarbonToken` is `onlyOwner`; `registerLand` is permissionless (anyone can register a new, non-duplicate parcel); `requestMintCredits` is only the land owner.
- **Reentrancy**: `registerLand` and `requestMintCredits` use `nonReentrant` because they do external calls (mint) or state changes after external interactions.
- **Events**: `LandRegistered` – for indexing and UI updates.

---

## Deployment and linking

1. Deploy CarbonCreditToken (no constructor args).
2. Deploy LandNFT (no constructor args).
3. Call `CarbonCreditToken.setLandNFT(landNFTAddress)` (owner only).
4. Call `LandNFT.setCarbonToken(carbonTokenAddress)` (owner only).

After this, land owners can register land and request mints; CarbonCreditToken will only accept mints from LandNFT.
