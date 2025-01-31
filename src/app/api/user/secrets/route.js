import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

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

		// Find user and their wallet
		const user = database.users.find((u) => u.id === decoded.userId);
		const wallet = database.wallets.find((w) => w.userId === decoded.userId);

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Return sensitive information
		return NextResponse.json({
			mnemonic: user.mnemonic,
			accounts: user.accounts.map((account) => ({
				privateKey: account.privateKey,
				publicKey: account.publicKey,
			})),
			wallet: {
				address: wallet?.address,
				privateKey: wallet?.privateKey,
			},
		});
	} catch (error) {
		console.error("Secrets fetch error:", error);
		return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
	}
}
