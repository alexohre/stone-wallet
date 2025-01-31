import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import fs from "fs";
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

        // Get wallets for this account
        const wallets = database.wallets.filter(w => w.accountId === accountId);

        // Calculate total balance
        const totalBalance = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance || 0), 0);

        return NextResponse.json({
            totalBalance,
            activeWallets: wallets.length,
            wallets: wallets, // Return all wallet data including private key
        });
    } catch (error) {
        console.error("Error fetching wallets:", error);
        return NextResponse.json(
            { error: "Failed to fetch wallets" },
            { status: 500 }
        );
    }
}
