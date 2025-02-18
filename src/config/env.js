// Network RPC URLs
export const RPC_URLS = {
	// Local Nodes
	local:
		process.env.NEXT_PUBLIC_local_RPC_URL ||
		"https://0417-129-222-206-107.ngrok-free.app/",

	// Remote Testnets
	sepolia:
		process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
		process.env.ALCHEMY_SEPOLIA_API_KEY
			? `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_SEPOLIA_API_KEY}`
			: "https://eth-sepolia.g.alchemy.com/v2/",
	holesky:
		process.env.NEXT_PUBLIC_HOLESKY_RPC_URL ||
		process.env.ALCHEMY_HOLESKY_API_KEY
			? `https://eth-holesky.g.alchemy.com/v2/${process.env.ALCHEMY_HOLESKY_API_KEY}`
			: "https://eth-holesky.g.alchemy.com/v2/",
	bsc_testnet:
		process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL ||
		process.env.ALCHEMY_BSC_TESTNET_API_KEY
			? `https://bnb-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_BSC_TESTNET_API_KEY}`
			: "https://bnb-testnet.g.alchemy.com/v2/",
	// Mainnets
	ethereum:
		process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL ||
		process.env.ALCHEMY_ETHEREUM_API_KEY
			? `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ETHEREUM_API_KEY}`
			: "https://eth-mainnet.g.alchemy.com/v2/",
	polygon:
		process.env.NEXT_PUBLIC_POLYGON_RPC_URL ||
		"https://polygon-mainnet.g.alchemy.com/v2/YOUR-API-KEY",
};

// API Keys
export const API_KEYS = {
	etherscan: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
	polygonscan: process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY,
	alchemy: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
};
