import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = await cookieStore.get("auth_token");

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Verify token
        const decoded = jwt.verify(
            token.value,
            process.env.JWT_SECRET || "your-secret-key"
        );

        // Read database file
        const dbPath = path.join(process.cwd(), "src", "db", "database.txt");
        const dbContent = fs.readFileSync(dbPath, "utf8");
        const database = JSON.parse(dbContent);

        // Find user's wallets
        const wallets = database.wallets.filter(w => w.userId === decoded.userId);
        
        // Calculate total balance
        const totalBalance = wallets.reduce((sum, wallet) => {
            return sum + parseFloat(wallet.balance || 0);
        }, 0);

        return NextResponse.json({
            wallets,
            totalBalance,
            activeWallets: wallets.length
        });

    } catch (error) {
        console.error('Error fetching wallets:', error);
        return NextResponse.json(
            { error: "Failed to fetch wallets" },
            { status: 500 }
        );
    }
}
