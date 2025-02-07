import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";

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

        // Get all wallets for this account
        const accountWallets = db.wallets.filter(w => w.accountId === accountId);
        const accountAddresses = accountWallets.map(w => w.address.toLowerCase());

        // Filter transactions where either fromAddress or toAddress matches any of the account's wallet addresses
        const transactions = (db.transactions || []).filter(tx => 
            accountAddresses.includes(tx.fromAddress.toLowerCase()) || 
            accountAddresses.includes(tx.toAddress.toLowerCase())
        );

        // Sort transactions by timestamp, newest first
        transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return NextResponse.json({
            transactions
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}
