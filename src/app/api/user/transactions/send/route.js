import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";

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
    const { accountId, recipientAddress, amount } = await request.json();

    if (!accountId || !recipientAddress || !amount) {
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
      (w) => w.accountId === accountId
    );

    if (!senderWallet) {
      return NextResponse.json(
        { error: "Sender wallet not found" },
        { status: 404 }
      );
    }

    // Find recipient wallet
    const recipientWallet = db.wallets.find(
      (w) => w.address.toLowerCase() === recipientAddress.toLowerCase()
    );

    if (!recipientWallet) {
      return NextResponse.json(
        { error: "Recipient wallet not found" },
        { status: 404 }
      );
    }

    // Check balance
    const senderBalance = parseFloat(senderWallet.balance);
    const transferAmount = parseFloat(amount);

    if (senderBalance < transferAmount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Update balances
    senderWallet.balance = (senderBalance - transferAmount).toString();
    recipientWallet.balance = (
      parseFloat(recipientWallet.balance) + transferAmount
    ).toString();

    // Create transaction record
    const transaction = {
      id: crypto.randomUUID(),
      fromAddress: senderWallet.address,
      toAddress: recipientWallet.address,
      amount: amount.toString(),
      status: "completed",
      timestamp: new Date().toISOString(),
    };

    if (!db.transactions) {
      db.transactions = [];
    }
    db.transactions.push(transaction);

    // Save to database
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json({ 
      message: "Transaction completed successfully",
      transaction 
    });
  } catch (error) {
    console.error("Send transaction error:", error);
    return NextResponse.json(
      { error: "Failed to process transaction" },
      { status: 500 }
    );
  }
}
