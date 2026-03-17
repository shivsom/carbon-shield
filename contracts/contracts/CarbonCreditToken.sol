// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CarbonCreditToken
 * @dev ERC20 token representing carbon credits. Only Land NFT owners can mint.
 * Credits can be burned (retired) by any holder to offset emissions.
 */
contract CarbonCreditToken is ERC20, Ownable {
    /// Land NFT contract - only its owners can mint credits
    address public landNFT;

    event CarbonMinted(address indexed to, uint256 amount, uint256 landTokenId);
    event CreditRetired(address indexed from, uint256 amount, string reason);

    error OnlyLandNFT();
    error ZeroAmount();
    error LandNFTNotSet();

    constructor() ERC20("CarbonShield Credit", "CSC") Ownable(msg.sender) {}

    /**
     * @dev Set the LandNFT contract address (call once after deployment).
     */
    function setLandNFT(address _landNFT) external onlyOwner {
        landNFT = _landNFT;
    }

    /**
     * @dev Mint carbon credits. Only callable by LandNFT contract on behalf of land owner.
     * @param to Recipient (land owner)
     * @param amount Amount of credits to mint
     * @param landTokenId The Land NFT token ID used to authorize minting
     */
    function mint(address to, uint256 amount, uint256 landTokenId) external {
        if (landNFT == address(0)) revert LandNFTNotSet();
        if (msg.sender != landNFT) revert OnlyLandNFT();
        if (amount == 0) revert ZeroAmount();

        _mint(to, amount);
        emit CarbonMinted(to, amount, landTokenId);
    }

    /**
     * @dev Burn (retire) carbon credits. Any token holder can retire.
     * @param amount Amount to retire
     * @param reason Optional reason for retirement (e.g. "Offset flight")
     */
    function retire(uint256 amount, string calldata reason) external {
        if (amount == 0) revert ZeroAmount();
        _burn(msg.sender, amount);
        emit CreditRetired(msg.sender, amount, reason);
    }

    /**
     * @dev Returns total supply (inherited from ERC20; tracked automatically).
     */
    function totalSupply() public view override returns (uint256) {
        return super.totalSupply();
    }
}
