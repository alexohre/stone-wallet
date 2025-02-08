import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { web3Service } from "@/utils/web3";
import { ethers } from "ethers";

export async function POST(request) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get("auth_token");

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Verify token
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET || "your-secret-key");

        const { name, privateKey, network } = await request.json();

        if (!name || !privateKey || !network) {
            return NextResponse.json(
                { error: "Wallet name, private key, and network are required" },
                { status: 400 }
            );
        }

        try {
            // Validate private key and get address
            const wallet = new ethers.Wallet(privateKey);
            const address = wallet.address;

            // Get initial balance
            const provider = await web3Service.getProvider(network);
            const balance = await provider.getBalance(address);
            const balanceInEth = ethers.formatEther(balance);

            // Save to database
            const dbPath = path.join(process.cwd(), "src", "db", "database.txt");
            const dbContent = await fs.readFile(dbPath, "utf8");
            const database = JSON.parse(dbContent);

            // Check if wallet already exists
            const existingWallet = database.wallets.find(
                (w) => w.address.toLowerCase() === address.toLowerCase()
            );

            if (existingWallet) {
                return NextResponse.json(
                    { error: "Wallet already exists" },
                    { status: 400 }
                );
            }

            const newWallet = {
                id: database.wallets.length + 1,
                name,
                address,
                privateKey,
                network,
                balance: balanceInEth,
                userId: decoded.userId,
                createdAt: new Date().toISOString(),
            };

            database.wallets.push(newWallet);
            await fs.writeFile(dbPath, JSON.stringify(database, null, 2));

            // Remove private key from response
            const { privateKey: _, ...walletWithoutPrivateKey } = newWallet;

            return NextResponse.json(walletWithoutPrivateKey);
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid private key" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error importing wallet:", error);
        return NextResponse.json(
            { error: "Failed to import wallet" },
            { status: 500 }
        );
    }
}
