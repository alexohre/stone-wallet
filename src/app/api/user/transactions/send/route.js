import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { web3Service } from "@/utils/web3";
import crypto from "crypto";
import { NETWORKS } from "@/config/networks";
import { ethers } from "ethers";

export async function POST(request) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(
      token.value,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Get request body
    const { accountId, fromWalletId, recipientAddress, amount } = await request.json();

    if (!accountId || !fromWalletId || !recipientAddress || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Read database
    const dbPath = path.join(process.cwd(), "src", "db", "database.txt");
    const dbContent = await fs.readFile(dbPath, "utf-8");
    const db = JSON.parse(dbContent);

    // Find sender's wallet
    const senderWallet = db.wallets.find(
      (w) => w.id === fromWalletId && w.accountId === accountId
    );

    if (!senderWallet) {
      return NextResponse.json(
        { error: "Sender wallet not found" },
        { status: 404 }
      );
    }

    // Get network configuration
    const networkId = senderWallet.network || senderWallet.networkId;
    console.log("Wallet network:", networkId);
    
    const network = NETWORKS[networkId];
    if (!network) {
      console.error("Network not found:", networkId);
      return NextResponse.json(
        { error: `Invalid network configuration for ${networkId}` },
        { status: 400 }
      );
    }

    if (!network.rpcUrl) {
      console.error("No RPC URL for network:", networkId);
      return NextResponse.json(
        { error: `No RPC URL configured for network ${networkId}` },
        { status: 400 }
      );
    }

    let txResponse;
    let txReceipt;

    try {
      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return NextResponse.json(
          { error: "Invalid amount" },
          { status: 400 }
        );
      }

      // Check if sender has enough balance
      const balance = parseFloat(senderWallet.balance);
      if (balance < amountNum) {
        return NextResponse.json(
          { error: "Insufficient balance" },
          { status: 400 }
        );
      }

      console.log("Sending blockchain transaction with:", {
        network: network.name,
        from: senderWallet.address,
        to: recipientAddress,
        amount,
        rpcUrl: network.rpcUrl
      });

      // Initialize provider first to ensure connection
      const provider = await web3Service.getProvider(networkId);
      console.log("Provider initialized successfully");

      // Validate network connection
      const networkInfo = await provider.getNetwork();
      console.log("Connected to network:", {
        name: network.name,
        chainId: networkInfo.chainId.toString()
      });

      // Send transaction on the blockchain
      txResponse = await web3Service.sendTransaction(
        senderWallet.privateKey,
        recipientAddress,
        amount,
        networkId
      );

      console.log("Transaction sent:", txResponse.hash);

      // Wait for transaction confirmation with timeout
      const confirmationTimeout = 60000; // 60 seconds
      txReceipt = await Promise.race([
        txResponse.wait(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction confirmation timeout')), confirmationTimeout)
        )
      ]);
      
      console.log("Transaction confirmed:", {
        hash: txReceipt.hash,
        blockNumber: txReceipt.blockNumber,
        gasUsed: txReceipt.gasUsed.toString()
      });
    } catch (error) {
      console.error("Blockchain transaction failed:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to send transaction: ";
      if (error.code === "ETIMEDOUT") {
        errorMessage += "Network connection timeout. Please try again.";
      } else if (error.message.includes("timeout")) {
        errorMessage += "Operation timed out. Please try again.";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage += "Insufficient funds for gas * price + value.";
      } else if (error.code === "INVALID_ARGUMENT") {
        errorMessage += "Invalid transaction parameters. Please check amount and recipient address.";
      } else {
        errorMessage += error.message || "Unknown error occurred";
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Create transaction record
    const transaction = {
      id: crypto.randomUUID(),
      fromAddress: senderWallet.address,
      toAddress: recipientAddress,
      amount: amount.toString(),
      status: txReceipt ? (txReceipt.status === 1 ? "completed" : "failed") : "pending",
      timestamp: new Date().toISOString(),
      hash: txResponse?.hash || null,
      networkId: senderWallet.network || senderWallet.networkId,
      gasUsed: txReceipt ? ethers.formatEther(txReceipt.gasUsed * txReceipt.gasPrice) : "0", // Convert gas to ETH
      blockNumber: txReceipt?.blockNumber || null,
      gasPrice: txReceipt ? ethers.formatUnits(txReceipt.gasPrice, 'gwei') : "0", // Store gas price in gwei
      totalCost: txReceipt ? 
        ethers.formatEther(
          (txReceipt.gasUsed * txReceipt.gasPrice) + // Gas cost in wei
          ethers.parseEther(amount.toString()) // Transaction amount in wei
        ) : 
        amount.toString() // For local transactions, just use amount
    };

    // Find sender wallet index for updating
    const senderWalletIndex = db.wallets.findIndex(w => w.id === fromWalletId);
    if (senderWalletIndex === -1) {
      throw new Error("Sender wallet not found in database");
    }

    // Update balances based on transaction status
    if (txReceipt) {
      // For blockchain transactions
      if (txReceipt.status === 1) { // Success
        // Calculate total cost in ETH (amount + gas)
        const totalCost = parseFloat(transaction.totalCost);
        
        // Update sender's balance
        const currentBalance = parseFloat(db.wallets[senderWalletIndex].balance || "0");
        db.wallets[senderWalletIndex].balance = (currentBalance - totalCost).toFixed(18);
        
        console.log("Updated sender balance:", {
          walletId: fromWalletId,
          previousBalance: currentBalance.toString(),
          newBalance: db.wallets[senderWalletIndex].balance,
          deducted: totalCost.toString()
        });

        // Find recipient wallet if it exists in our database
        const recipientWalletIndex = db.wallets.findIndex(
          w => w.address.toLowerCase() === recipientAddress.toLowerCase()
        );

        // If recipient wallet exists in our database, update its balance
        if (recipientWalletIndex !== -1) {
          const recipientCurrentBalance = parseFloat(db.wallets[recipientWalletIndex].balance || "0");
          const amountNum = parseFloat(amount);
          db.wallets[recipientWalletIndex].balance = (recipientCurrentBalance + amountNum).toFixed(18);
          
          console.log("Updated recipient balance:", {
            address: recipientAddress,
            previousBalance: recipientCurrentBalance.toString(),
            newBalance: db.wallets[recipientWalletIndex].balance,
            added: amountNum.toString()
          });
        }
      } else { // Failed transaction
        // Only deduct gas cost for failed transactions
        const gasCost = parseFloat(transaction.gasUsed);
        const currentBalance = parseFloat(db.wallets[senderWalletIndex].balance || "0");
        db.wallets[senderWalletIndex].balance = (currentBalance - gasCost).toFixed(18);
        
        console.log("Updated sender balance (failed tx):", {
          walletId: fromWalletId,
          previousBalance: currentBalance.toString(),
          newBalance: db.wallets[senderWalletIndex].balance,
          deductedGas: gasCost.toString()
        });
      }
    } else {
      // For pending transactions, reserve the full amount including estimated gas
      const estimatedGas = "0.01"; // Reserve 0.01 ETH for gas
      const totalReserved = parseFloat(amount) + parseFloat(estimatedGas);
      const currentBalance = parseFloat(db.wallets[senderWalletIndex].balance || "0");
      db.wallets[senderWalletIndex].balance = (currentBalance - totalReserved).toFixed(18);
      
      console.log("Reserved balance for pending tx:", {
        walletId: fromWalletId,
        previousBalance: currentBalance.toString(),
        newBalance: db.wallets[senderWalletIndex].balance,
        reserved: totalReserved.toString()
      });
    }

    // Add transaction to database
    if (!db.transactions) {
      db.transactions = [];
    }
    db.transactions.push(transaction);

    // Save to database
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json({ 
      message: txReceipt ? 
        txReceipt.status === 1 ? "Transaction completed successfully" : "Transaction failed" 
        : "Transaction pending",
      transaction,
      newBalance: db.wallets[senderWalletIndex].balance
    });

  } catch (error) {
    console.error("Error processing transaction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process transaction" },
      { status: 500 }
    );
  }
}
