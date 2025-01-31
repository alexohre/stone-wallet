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

        const { name, network } = await request.json();

        if (!name || !network) {
            return NextResponse.json(
                { error: "Wallet name and network are required" },
                { status: 400 }
            );
        }

        // Create a new wallet
        const wallet = ethers.Wallet.createRandom();

        // Read database file
        const dbPath = path.join(process.cwd(), "src", "db", "database.txt");
        const dbContent = fs.readFileSync(dbPath, "utf8");
        const database = JSON.parse(dbContent);

        // Create new wallet entry
        const newWallet = {
            id: crypto.randomUUID(),
            userId: decoded.userId,
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

        // Save to database file
        fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));

        // Return success without sensitive data
        return NextResponse.json({
            success: true,
            wallet: {
                id: newWallet.id,
                name: newWallet.name,
                network: newWallet.network,
                address: newWallet.address,
            },
        });

    } catch (error) {
        console.error('Error creating wallet:', error);
        return NextResponse.json(
            { error: "Failed to create wallet" },
            { status: 500 }
        );
    }
}
