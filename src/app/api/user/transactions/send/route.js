import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { web3Service } from "@/utils/web3";
import crypto from "crypto";
import { NETWORKS } from "@/config/networks";

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
    const network = NETWORKS[senderWallet.networkId];
    if (!network) {
      return NextResponse.json(
        { error: "Invalid network configuration" },
        { status: 400 }
      );
    }

    let txResponse;
    let txReceipt;

    // Check if RPC URL is available and network is not local
    if (network.rpcUrl && !network.isLocal) {
      try {
        // Send transaction on the blockchain
        txResponse = await web3Service.sendTransaction(
          senderWallet.privateKey,
          recipientAddress,
          amount,
          senderWallet.networkId
        );

        // Wait for transaction confirmation
        txReceipt = await txResponse.wait();
      } catch (error) {
        console.error("Blockchain transaction failed:", error);
        return NextResponse.json(
          { error: error.message || "Failed to send blockchain transaction" },
          { status: 500 }
        );
      }
    }

    // Create transaction record
    const transaction = {
      id: crypto.randomUUID(),
      fromAddress: senderWallet.address,
      toAddress: recipientAddress,
      amount: amount.toString(),
      status: txReceipt ? (txReceipt.status === 1 ? "completed" : "failed") : "local",
      timestamp: new Date().toISOString(),
      hash: txResponse?.hash || null,
      networkId: senderWallet.networkId,
      gasUsed: txReceipt?.gasUsed?.toString() || "0",
      blockNumber: txReceipt?.blockNumber || null
    };

    // Update balances for local transactions
    if (!txReceipt) {
      // Convert amount to number for calculation
      const amountNum = parseFloat(amount);
      
      // Update sender's balance
      senderWallet.balance = (parseFloat(senderWallet.balance) - amountNum).toString();

      // Find or create recipient wallet in database
      const recipientWallet = db.wallets.find(w => w.address.toLowerCase() === recipientAddress.toLowerCase());
      if (recipientWallet) {
        recipientWallet.balance = (parseFloat(recipientWallet.balance) + amountNum).toString();
      }
    }

    // Add transaction to database
    if (!db.transactions) {
      db.transactions = [];
    }
    db.transactions.push(transaction);

    // Save to database
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json({ 
      message: txReceipt ? "Transaction completed on blockchain" : "Transaction saved locally",
      transaction 
    });

  } catch (error) {
    console.error("Error processing transaction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process transaction" },
      { status: 500 }
    );
  }
}
