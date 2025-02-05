import { ethers } from "ethers";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Match the secret from signup route

export async function POST(request) {
	try {
		// Verify JWT token
		const cookieStore = await cookies();
		const token = await cookieStore.get("auth_token");

		if (!token) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		const decoded = jwt.verify(token.value, JWT_SECRET);
		const userId = decoded.userId;

		const { mnemonic } = await request.json();

		if (!mnemonic) {
			return new Response(
				JSON.stringify({
					error: "Mnemonic phrase is required",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Validate mnemonic
		try {
			// In ethers v6, we use HDNodeWallet.fromPhrase
			const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
			const accountName = `Account ${wallet.address.slice(
				0,
				6
			)}...${wallet.address.slice(-4)}`;

			// Read database
			const dbPath = path.join(process.cwd(), "src", "db", "database.txt");
			const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

			// Find user
			const user = data.users.find((u) => u.id === userId);
			if (!user) {
				return new Response(JSON.stringify({ error: "User not found" }), {
					status: 404,
					headers: { "Content-Type": "application/json" },
				});
			}

			// Create new account
			const newAccount = {
				id: crypto.randomUUID(),
				name: accountName,
				privateKey: wallet.privateKey,
				publicKey: wallet.publicKey,
				mnemonic: mnemonic,
			};

			// Add account to user's accounts
			if (!user.accounts) {
				user.accounts = [];
			}
			user.accounts.push(newAccount);

			// Save to database
			fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

			return new Response(JSON.stringify(newAccount), {
				status: 201,
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			return new Response(
				JSON.stringify({
					error: "Invalid mnemonic phrase",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}
	} catch (error) {
		console.error("Error importing account:", error);
		return new Response(
			JSON.stringify({
				error: "Failed to import account",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
