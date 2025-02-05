import { ethers } from 'ethers';
import { NETWORKS } from '../config/networks';

class Web3Service {
    constructor() {
        this.providers = {};
    }

    // Initialize provider for a specific network
    getProvider(networkId) {
        if (!this.providers[networkId]) {
            const network = NETWORKS[networkId];
            if (!network) {
                throw new Error(`Network ${networkId} not supported`);
            }

            try {
                // For local nodes, add retry logic and connection status check
                if (network.isLocal) {
                    this.providers[networkId] = new ethers.JsonRpcProvider(network.rpcUrl, {
                        polling: true,
                        pollingInterval: 4000,
                        timeout: 5000,
                        retryCount: 3
                    });

                    // Test connection
                    this.providers[networkId].getBlockNumber().catch(error => {
                        console.error(`Failed to connect to local node: ${error.message}`);
                        delete this.providers[networkId];
                        throw new Error(`Local node not responding at ${network.rpcUrl}. Make sure your node is running.`);
                    });
                } else {
                    // For remote nodes, use standard configuration
                    this.providers[networkId] = new ethers.JsonRpcProvider(network.rpcUrl);
                }
            } catch (error) {
                console.error(`Failed to initialize provider for ${networkId}:`, error);
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
            const provider = this.getProvider(networkId);
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
    getWallet(privateKey, networkId) {
        const provider = this.getProvider(networkId);
        return new ethers.Wallet(privateKey, provider);
    }

    // Get balance for an address
    async getBalance(address, networkId) {
        const provider = this.getProvider(networkId);
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    }

    // Get transaction count (nonce) for an address
    async getTransactionCount(address, networkId) {
        const provider = this.getProvider(networkId);
        return await provider.getTransactionCount(address);
    }

    // Get gas price
    async getGasPrice(networkId) {
        const provider = this.getProvider(networkId);
        const gasPrice = await provider.getFeeData();
        return {
            gasPrice: ethers.formatUnits(gasPrice.gasPrice, 'gwei'),
            maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') : null,
            maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei') : null
        };
    }

    // Fetch transactions for an address
    async getTransactions(address, networkId, startBlock = 0) {
        const provider = this.getProvider(networkId);
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
        const wallet = this.getWallet(fromPrivateKey, networkId);
        const network = NETWORKS[networkId];
        
        const tx = {
            to: toAddress,
            value: ethers.parseEther(amount.toString())
        };

        // Get gas estimate
        const gasEstimate = await wallet.estimateGas(tx);
        const feeData = await this.getGasPrice(networkId);

        // Prepare transaction with gas settings
        const transaction = {
            ...tx,
            gasLimit: gasEstimate,
            maxFeePerGas: feeData.maxFeePerGas ? ethers.parseUnits(feeData.maxFeePerGas, 'gwei') : undefined,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.parseUnits(feeData.maxPriorityFeePerGas, 'gwei') : undefined,
        };

        // Send transaction
        const txResponse = await wallet.sendTransaction(transaction);
        return txResponse;
    }
}

export const web3Service = new Web3Service();
