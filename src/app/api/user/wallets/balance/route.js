import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { web3Service } from "@/utils/web3";
import { ethers } from "ethers";

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

        const { walletAddress, network } = await request.json();

        if (!walletAddress || !network) {
            return NextResponse.json(
                { error: "Wallet address and network are required" },
                { status: 400 }
            );
        }

        // Get latest balance from blockchain
        const provider = await web3Service.getProvider(network);
        const balance = await provider.getBalance(walletAddress);
        
        // Convert balance from Wei to ETH
        const balanceInEth = ethers.formatEther(balance);

        // Update balance in database
        const dbPath = path.join(process.cwd(), "src", "db", "database.txt");
        const dbContent = await fs.readFile(dbPath, "utf8");
        const database = JSON.parse(dbContent);

        const walletIndex = database.wallets.findIndex(w => w.address === walletAddress);
        if (walletIndex !== -1) {
            database.wallets[walletIndex].balance = balanceInEth;
            await fs.writeFile(dbPath, JSON.stringify(database, null, 2));
        }

        return NextResponse.json({
            balance: balanceInEth
        });
    } catch (error) {
        console.error("Error updating wallet balance:", error);
        return NextResponse.json(
            { error: "Failed to update wallet balance" },
            { status: 500 }
        );
    }
}
