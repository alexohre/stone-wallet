import { RPC_URLS } from "./env";

export const NETWORKS = {
	// Local Nodes
	local: {
		name: "Local Sepolia Node",
		chainId: 11155111,
		rpcUrl: RPC_URLS.local,
		currencySymbol: "ETH",
		blockExplorer: "https://sepolia.etherscan.io",
		isTestnet: false,
		isLocal: true,
	},

	// Testnets
	sepolia: {
		name: "Sepolia",
		chainId: 11155111,
		rpcUrl: RPC_URLS.sepolia || RPC_URLS.local, // Fallback to local if sepolia not configured
		currencySymbol: "ETH",
		blockExplorer: "https://sepolia.etherscan.io",
		isTestnet: true,
		isLocal: false,
	},
	holesky: {
		name: "Holesky",
		chainId: 17000,
		rpcUrl: RPC_URLS.holesky,
		currencySymbol: "ETH",
		blockExplorer: "https://holesky.etherscan.io",
		isTestnet: true,
		isLocal: false,
	},
	mumbai: {
		name: "Mumbai (Polygon Testnet)",
		chainId: 80001,
		rpcUrl: RPC_URLS.mumbai,
		currencySymbol: "MATIC",
		blockExplorer: "https://mumbai.polygonscan.com",
		isTestnet: true,
		isLocal: false,
	},
	// Mainnets
	ethereum: {
		name: "Ethereum",
		chainId: 1,
		rpcUrl: RPC_URLS.ethereum,
		currencySymbol: "ETH",
		blockExplorer: "https://etherscan.io",
		isTestnet: false,
		isLocal: false,
	},
	polygon: {
		name: "Polygon",
		chainId: 137,
		rpcUrl: RPC_URLS.polygon,
		currencySymbol: "MATIC",
		blockExplorer: "https://polygonscan.com",
		isTestnet: false,
		isLocal: false,
	},
};
