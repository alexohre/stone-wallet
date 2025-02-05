import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { deriveKey, encryptData, decryptData } from "@/utils/encryption";

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

		// Derive encryption key from user's password
		const [salt] = user.password.split(':');
		const key = deriveKey(decoded.password, salt);

		// Decrypt sensitive data
		const decryptedData = {
			...account,
			privateKey: account.encryptedPrivateKey ? 
				decryptData(
					account.encryptedPrivateKey.data,
					key,
					account.encryptedPrivateKey.iv,
					account.encryptedPrivateKey.authTag
				) : account.privateKey,
			mnemonic: account.encryptedMnemonic ? 
				decryptData(
					account.encryptedMnemonic.data,
					key,
					account.encryptedMnemonic.iv,
					account.encryptedMnemonic.authTag
				) : account.mnemonic
		};

		// Get all wallets for this account
		const accountWallets = database.wallets.filter((w) => w.accountId === accountId);

		// Return sensitive information
		return NextResponse.json({
			wallets: accountWallets.map((wallet) => ({
				id: wallet.id,
				name: wallet.name,
				network: wallet.network,
				address: wallet.address,
				privateKey: wallet.encryptedPrivateKey ? 
					decryptData(
						wallet.encryptedPrivateKey.data,
						key,
						wallet.encryptedPrivateKey.iv,
						wallet.encryptedPrivateKey.authTag
					) : wallet.privateKey,
			})),
			account: decryptedData
		});
	} catch (error) {
		console.error("Error fetching secrets:", error);
		return NextResponse.json(
			{ error: "Failed to fetch account secrets" },
			{ status: 500 }
		);
	}
}
