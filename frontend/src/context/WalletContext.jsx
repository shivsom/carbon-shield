import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  CARBON_TOKEN_ADDRESS,
  LAND_NFT_ADDRESS,
  SUPPORTED_CHAIN_IDS,
  AMOY_CHAIN_ID,
  AMOY_RPC,
} from "../config";

const WalletContext = createContext(null);

const CARBON_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function mint(address to, uint256 amount, uint256 landTokenId)",
  "function retire(uint256 amount, string reason)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function totalSupply() view returns (uint256)",
  "event CarbonMinted(address indexed to, uint256 amount, uint256 landTokenId)",
  "event CreditRetired(address indexed from, uint256 amount, string reason)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const LAND_ABI = [
  "function registerLand(bytes32 polygonHash, string metadataURI)",
  "function requestMintCredits(uint256 landTokenId, uint256 amount)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address) view returns (uint256)",
  "function getTokenIdsOf(address) view returns (uint256[])",
  "function getLandInfo(uint256) view returns (tuple(bytes32 polygonHash, string metadataURI, address owner, uint256 registeredAt))",
  "function polygonHashToTokenId(bytes32) view returns (uint256)",
  "event LandRegistered(address indexed owner, uint256 indexed tokenId, bytes32 polygonHash, string metadataURI)",
];

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null); // hex string, e.g. 0x13882
  const [carbonToken, setCarbonToken] = useState(null);
  const [landNFT, setLandNFT] = useState(null);
  const [creditBalance, setCreditBalance] = useState("0");
  const [landIds, setLandIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const ensureAmoy = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AMOY_CHAIN_ID }],
      });
    } catch (e) {
      // 4902 = chain not added in MetaMask
      if (e && e.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: AMOY_CHAIN_ID,
              chainName: "Polygon Amoy",
              rpcUrls: [AMOY_RPC],
              nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
              blockExplorerUrls: ["https://amoy.polygonscan.com"],
            },
          ],
        });
      } else {
        throw e;
      }
    }
  };

  const connect = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }
    setLoading(true);
    try {
      const prov = new ethers.BrowserProvider(window.ethereum);
      const accounts = await prov.send("eth_requestAccounts", []);
      const currentChainId = await prov.send("eth_chainId", []);
      setChainId(currentChainId);
      if (!SUPPORTED_CHAIN_IDS.includes(currentChainId)) {
        await ensureAmoy();
      }
      setProvider(prov);
      setAccount(accounts[0]);
      if (CARBON_TOKEN_ADDRESS && LAND_NFT_ADDRESS) {
        setCarbonToken(new ethers.Contract(CARBON_TOKEN_ADDRESS, CARBON_ABI, prov));
        setLandNFT(new ethers.Contract(LAND_NFT_ADDRESS, LAND_ABI, prov));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const refreshBalances = async () => {
    if (!account || !carbonToken || !landNFT) return;
    try {
      const bal = await carbonToken.balanceOf(account);
      setCreditBalance(ethers.formatEther(bal));
      const ids = await landNFT.getTokenIdsOf(account);
      setLandIds(ids.map((id) => Number(id)));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (account && carbonToken && landNFT) refreshBalances();
  }, [account, carbonToken, landNFT]);

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.on("accountsChanged", (accounts) => {
      setAccount(accounts[0] || null);
    });
    window.ethereum.on("chainChanged", (newChainId) => {
      setChainId(newChainId);
      window.location.reload();
    });
  }, []);

  const value = {
    account,
    provider,
    chainId,
    carbonToken,
    landNFT,
    creditBalance,
    landIds,
    loading,
    connect,
    ensureAmoy,
    refreshBalances,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
