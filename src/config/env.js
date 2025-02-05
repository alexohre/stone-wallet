// Network RPC URLs
export const RPC_URLS = {
    // Local Nodes
    local_sepolia: process.env.NEXT_PUBLIC_LOCAL_SEPOLIA_RPC_URL || "http://localhost:8545",
    
    // Remote Testnets
    sepolia: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY",
    holesky: process.env.NEXT_PUBLIC_HOLESKY_RPC_URL || "https://ethereum-holesky.publicnode.com",
    mumbai: process.env.NEXT_PUBLIC_MUMBAI_RPC_URL || "https://polygon-mumbai.g.alchemy.com/v2/YOUR-API-KEY",
    
    // Mainnets
    ethereum: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY",
    polygon: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon-mainnet.g.alchemy.com/v2/YOUR-API-KEY"
};

// API Keys
export const API_KEYS = {
    etherscan: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
    polygonscan: process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY,
    alchemy: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
};
