import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { ethers } from "ethers";
import crypto from "crypto";

export async function POST(request) {
    try {
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

        const { name, network, accountId } = await request.json();

        if (!name || !network || !accountId) {
            return NextResponse.json(
                { error: "Wallet name, network, and account ID are required" },
                { status: 400 }
            );
        }

        // Read database file
        const dbPath = path.join(process.cwd(), "src", "db", "database.txt");
        const dbContent = fs.readFileSync(dbPath, "utf8");
        const database = JSON.parse(dbContent);

        // Find user and verify account ownership
        const user = database.users.find(u => u.id === decoded.userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Verify that the account belongs to the user
        const account = user.accounts.find(a => a.id === accountId);
        if (!account) {
            return NextResponse.json(
                { error: "Account not found or unauthorized" },
                { status: 404 }
            );
        }

        // Create a new wallet
        const wallet = ethers.Wallet.createRandom();

        // Create new wallet entry
        const newWallet = {
            id: crypto.randomUUID(),
            accountId: accountId,
            name: name,
            network: network,
            address: wallet.address,
            privateKey: wallet.privateKey,
            balance: "0",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Add wallet to database
        database.wallets.push(newWallet);

        // Save database
        fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));

        // Return wallet data without private key
        const { privateKey, ...walletData } = newWallet;
        return NextResponse.json({
            message: "Wallet created successfully",
            wallet: walletData,
        });
    } catch (error) {
        console.error("Error creating wallet:", error);
        return NextResponse.json(
            { error: "Failed to create wallet" },
            { status: 500 }
        );
    }
}
