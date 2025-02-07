import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { web3Service } from "@/utils/web3";

export async function GET(request) {
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

        // Get accountId from query params
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get("accountId");

        if (!accountId) {
            return NextResponse.json(
                { error: "Account ID is required" },
                { status: 400 }
            );
        }

        // Read database
        const dbPath = path.join(process.cwd(), "src", "db", "database.txt");
        const dbContent = await fs.readFile(dbPath, "utf-8");
        const db = JSON.parse(dbContent);

        // Get wallets for the account
        const wallets = db.wallets.filter(w => w.accountId === accountId);

        // Calculate total balance from local balances
        const totalBalance = wallets.reduce((sum, wallet) => {
            // Always use local balance as source of truth
            const balance = parseFloat(wallet.balance || '0');
            return sum + balance;
        }, 0);

        return NextResponse.json({
            wallets,
            totalBalance: totalBalance.toString(),
            activeWallets: wallets.length
        });
    } catch (error) {
        console.error("Error fetching wallets:", error);
        return NextResponse.json(
            { error: "Failed to fetch wallets" },
            { status: 500 }
        );
    }
}
