import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET(request) {
	try {
		// Get accountId from query params
		const { searchParams } = new URL(request.url);
		const accountId = searchParams.get("accountId");

		if (!accountId) {
			return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
		}

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

		// Find user and verify they own the account
		const user = database.users.find((u) => u.id === decoded.userId);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Find the account and verify ownership
		const account = user.accounts.find((a) => a.id === accountId);
		if (!account) {
			return NextResponse.json(
				{ error: "Account not found or unauthorized" },
				{ status: 404 }
			);
		}

		// Get all wallets for this account
		const accountWallets = database.wallets.filter((w) => w.accountId === accountId);

		// Return sensitive information
		return NextResponse.json({
			wallets: accountWallets.map((wallet) => ({
				id: wallet.id,
				name: wallet.name,
				network: wallet.network,
				address: wallet.address,
				privateKey: wallet.privateKey,
			})),
		});
	} catch (error) {
		console.error("Secrets fetch error:", error);
		return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
	}
}
