// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LandNFT
 * @dev ERC721 representing unique land parcels. Stores polygon hash and IPFS URI.
 * Prevents duplicate polygon registration. CarbonCreditToken can only be minted by land owners.
 */
contract LandNFT is ERC721, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId;

    /// Carbon credit token - used to request mint from this contract
    address public carbonToken;

    /// polygonHash => tokenId (0 = not registered). Prevents duplicate land.
    mapping(bytes32 => uint256) public polygonHashToTokenId;

    /// tokenId => polygon hash (for lookup)
    mapping(uint256 => bytes32) public tokenIdToPolygonHash;

    /// owner => list of token IDs (for frontend enumeration)
    mapping(address => uint256[]) private _ownerTokenIds;

    struct LandInfo {
        bytes32 polygonHash;
        string metadataURI;
        address owner;
        uint256 registeredAt;
    }
    mapping(uint256 => LandInfo) public landInfo;

    event LandRegistered(
        address indexed owner,
        uint256 indexed tokenId,
        bytes32 polygonHash,
        string metadataURI
    );

    error DuplicatePolygon();
    error CarbonTokenNotSet();
    error InvalidURI();
    error OnlyLandOwner();

    constructor() ERC721("CarbonShield Land", "CSLAND") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    /**
     * @dev Set the CarbonCreditToken address (call once after deployment).
     */
    function setCarbonToken(address _carbonToken) external onlyOwner {
        carbonToken = _carbonToken;
    }

    /**
     * @dev Register a new land parcel as NFT. Reverts if polygon hash already registered.
     * @param polygonHash keccak256 of normalized polygon coordinates (from frontend)
     * @param metadataURI IPFS URI (e.g. ipfs://Qm...)
     */
    function registerLand(bytes32 polygonHash, string calldata metadataURI)
        external
        nonReentrant
    {
        if (bytes(metadataURI).length == 0) revert InvalidURI();
        if (polygonHashToTokenId[polygonHash] != 0) revert DuplicatePolygon();

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        polygonHashToTokenId[polygonHash] = tokenId;
        tokenIdToPolygonHash[tokenId] = polygonHash;
        landInfo[tokenId] = LandInfo({
            polygonHash: polygonHash,
            metadataURI: metadataURI,
            owner: msg.sender,
            registeredAt: block.timestamp
        });
        _ownerTokenIds[msg.sender].push(tokenId);

        emit LandRegistered(msg.sender, tokenId, polygonHash, metadataURI);
    }

    function getTokenIdsOf(address owner) external view returns (uint256[] memory) {
        return _ownerTokenIds[owner];
    }

    /**
     * @dev Request minting of carbon credits for a land parcel. Only land owner can call.
     * Calls CarbonCreditToken.mint(to, amount, landTokenId).
     */
    function requestMintCredits(uint256 landTokenId, uint256 amount) external nonReentrant {
        if (carbonToken == address(0)) revert CarbonTokenNotSet();
        if (ownerOf(landTokenId) != msg.sender) revert OnlyLandOwner();
        require(amount > 0, "Zero amount");

        (bool ok, ) = carbonToken.call(
            abi.encodeWithSignature("mint(address,uint256,uint256)", msg.sender, amount, landTokenId)
        );
        require(ok, "Mint failed");
    }

    /**
     * @dev Get land metadata for a token.
     */
    function getLandInfo(uint256 tokenId) external view returns (LandInfo memory) {
        return landInfo[tokenId];
    }
}
