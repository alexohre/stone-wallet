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

        // Get latest balance from blockchain with timeout
        try {
            const provider = await web3Service.getProvider(network);
            
            // Use Promise.race to implement a timeout
            const balance = await Promise.race([
                provider.getBalance(walletAddress),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Balance fetch timeout')), 15000)
                )
            ]);

            // Convert balance from Wei to ETH
            const balanceInEth = ethers.formatEther(balance);

            // Update balance in database
            const dbPath = path.join(process.cwd(), "src", "db", "database.txt");
            const dbContent = await fs.readFile(dbPath, "utf8");
            const database = JSON.parse(dbContent);

            const walletIndex = database.wallets.findIndex(w => w.address === walletAddress);
            if (walletIndex !== -1) {
                database.wallets[walletIndex].balance = balanceInEth;
                database.wallets[walletIndex].updatedAt = new Date().toISOString();
                await fs.writeFile(dbPath, JSON.stringify(database, null, 2));
            }

            return NextResponse.json({
                address: walletAddress,
                balance: balanceInEth,
                network,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error(`Error fetching balance for ${network}:${walletAddress}:`, error);
            
            // Return the last known balance from database if available
            const dbPath = path.join(process.cwd(), "src", "db", "database.txt");
            const dbContent = await fs.readFile(dbPath, "utf8");
            const database = JSON.parse(dbContent);
            
            const wallet = database.wallets.find(w => w.address === walletAddress);
            if (wallet) {
                return NextResponse.json({
                    address: walletAddress,
                    balance: wallet.balance,
                    network,
                    updatedAt: wallet.updatedAt,
                    error: "Failed to fetch latest balance, showing last known balance"
                }, { status: 200 });
            }
            
            throw error;  // Re-throw if we couldn't even get the last known balance
        }
    } catch (error) {
        console.error("Error updating wallet balance:", error);
        return NextResponse.json(
            { error: "Failed to update wallet balance" },
            { status: 500 }
        );
    }
}
