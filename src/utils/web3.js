import { ethers } from 'ethers';
import { NETWORKS } from '../config/networks';

class Web3Service {
    constructor() {
        this.providers = {};
    }

    // Initialize provider for a specific network
    async getProvider(networkId) {
        if (!this.providers[networkId]) {
            const network = NETWORKS[networkId];
            if (!network) {
                throw new Error(`Network ${networkId} not supported`);
            }

            if (!network.rpcUrl) {
                throw new Error(`No RPC URL configured for network ${networkId}`);
            }

            try {
                console.log(`Initializing provider for ${networkId} with RPC URL:`, network.rpcUrl);
                
                // Network-specific configurations
                const providerConfig = {
                    chainId: network.chainId,
                    name: network.name,
                    ensAddress: null
                };

                // Network-specific timeouts and settings
                const providerSettings = {
                    staticNetwork: true,
                    polling: true,
                    pollingInterval: network.isTestnet ? 2000 : 4000, // Faster polling for testnets
                    timeout: network.isTestnet ? 20000 : 30000,       // Longer timeout for mainnets
                    retryCount: network.isTestnet ? 3 : 5,           // More retries for mainnets
                };

                const provider = new ethers.JsonRpcProvider(
                    network.rpcUrl,
                    providerConfig,
                    providerSettings
                );

                // Test provider connection with timeout
                try {
                    const networkTest = await Promise.race([
                        provider.getNetwork(),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Network detection timeout')), 
                                network.isTestnet ? 8000 : 12000)  // Shorter timeout for testnets
                        )
                    ]);
                    
                    console.log(`Provider initialized for ${networkId}`);
                    this.providers[networkId] = provider;
                } catch (error) {
                    console.error(`Failed to initialize provider for ${networkId}:`, error);
                    throw new Error(`Network ${networkId} is not responding`);
                }
            } catch (error) {
                console.error(`Error creating provider for ${networkId}:`, error);
                throw error;
            }
        }

        return this.providers[networkId];
    }

    // Check if local node is running and synced
    async checkLocalNodeStatus(networkId) {
        const network = NETWORKS[networkId];
        if (!network || !network.isLocal) {
            throw new Error('Not a local network');
        }

        try {
            const provider = await this.getProvider(networkId);
            const [blockNumber, syncing] = await Promise.all([
                provider.getBlockNumber(),
                provider.send('eth_syncing', [])
            ]);

            return {
                connected: true,
                blockNumber,
                syncing: !!syncing,
                networkId: networkId,
                chainId: network.chainId
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }

    // Get wallet instance for a private key on a specific network
    async getWallet(privateKey, networkId) {
        const provider = await this.getProvider(networkId);
        return new ethers.Wallet(privateKey, provider);
    }

    // Get balance for an address
    async getBalance(address, networkId) {
        const provider = await this.getProvider(networkId);
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    }

    // Get transaction count (nonce) for an address
    async getTransactionCount(address, networkId) {
        const provider = await this.getProvider(networkId);
        return await provider.getTransactionCount(address);
    }

    // Get gas price
    async getGasPrice(networkId) {
        const provider = await this.getProvider(networkId);
        const gasPrice = await provider.getFeeData();
        return {
            gasPrice: ethers.formatUnits(gasPrice.gasPrice, 'gwei'),
            maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') : null,
            maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei') : null
        };
    }

    // Fetch transactions for an address
    async getTransactions(address, networkId, startBlock = 0) {
        const provider = await this.getProvider(networkId);
        const network = NETWORKS[networkId];
        
        try {
            // Get current block number
            const currentBlock = await provider.getBlockNumber();
            
            // Fetch the last 1000 blocks or from startBlock, whichever is more recent
            const fromBlock = Math.max(currentBlock - 1000, startBlock);
            
            // Get all transactions sent to or from the address
            const sentTxs = await provider.getHistory(address, fromBlock, currentBlock);
            
            // Format transactions
            const transactions = await Promise.all(sentTxs.map(async (tx) => {
                const receipt = await tx.wait();
                return {
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: ethers.formatEther(tx.value),
                    timestamp: new Date((await provider.getBlock(tx.blockNumber)).timestamp * 1000).toISOString(),
                    status: receipt.status === 1 ? 'completed' : 'failed',
                    gasUsed: receipt.gasUsed.toString(),
                    blockNumber: tx.blockNumber,
                    networkId: networkId,
                    explorerUrl: `${network.blockExplorer}/tx/${tx.hash}`
                };
            }));

            return transactions;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    }

    // Send transaction
    async sendTransaction(fromPrivateKey, toAddress, amount, networkId) {
        console.log("Initializing transaction:", { networkId, toAddress, amount });
        
        try {
            const wallet = await this.getWallet(fromPrivateKey, networkId);
            const network = NETWORKS[networkId];
            
            if (!network?.rpcUrl) {
                throw new Error(`No RPC URL configured for network ${networkId}`);
            }
            
            console.log("Network configuration:", { 
                name: network.name,
                rpcUrl: network.rpcUrl
            });
            
            const tx = {
                to: toAddress,
                value: ethers.parseEther(amount.toString())
            };

            // Get gas estimate with retry
            console.log("Estimating gas...");
            let gasEstimate;
            try {
                gasEstimate = await wallet.estimateGas(tx);
            } catch (error) {
                console.error("Gas estimation failed, retrying with higher gas limit:", error);
                // If gas estimation fails, use a safe default
                gasEstimate = ethers.getBigInt('100000');
            }

            // Get gas price with fallback
            let feeData;
            try {
                feeData = await this.getGasPrice(networkId);
            } catch (error) {
                console.error("Failed to get fee data, using legacy gas price:", error);
                feeData = { gasPrice: '50' }; // Safe default in gwei
            }

            // Prepare transaction with gas settings
            const transaction = {
                ...tx,
                gasLimit: gasEstimate,
            };

            // Add EIP-1559 fields if available, otherwise use legacy gasPrice
            if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
                transaction.maxFeePerGas = ethers.parseUnits(feeData.maxFeePerGas, 'gwei');
                transaction.maxPriorityFeePerGas = ethers.parseUnits(feeData.maxPriorityFeePerGas, 'gwei');
            } else {
                transaction.gasPrice = ethers.parseUnits(feeData.gasPrice, 'gwei');
            }

            console.log("Sending transaction with params:", {
                gasLimit: gasEstimate.toString(),
                ...feeData
            });

            // Send transaction with timeout
            const txResponse = await Promise.race([
                wallet.sendTransaction(transaction),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Transaction sending timeout')), 30000)
                )
            ]);
            
            console.log("Transaction sent:", txResponse.hash);
            return txResponse;
        } catch (error) {
            console.error("Transaction failed:", error);
            throw error;
        }
    }
}

export const web3Service = new Web3Service();
