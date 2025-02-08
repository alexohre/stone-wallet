import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
// import { web3Service } from "@/utils/web3";
import { ethers } from "ethers";
import crypto from "crypto";

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

		const { name, network, accountId } = await request.json();

		if (!name || !network || !accountId) {
			return NextResponse.json(
				{ error: "Wallet name, network, and account ID are required" },
				{ status: 400 }
			);
		}

		// Create new wallet
		const wallet = ethers.Wallet.createRandom();
		const address = wallet.address;
		const privateKey = wallet.privateKey;

		// Save to database with initial balance of 0
		const dbPath = path.join(process.cwd(), "src", "db", "database.txt");
		const dbContent = await fs.readFile(dbPath, "utf8");
		const database = JSON.parse(dbContent);

		const newWallet = {
			id: crypto.randomUUID(),
			accountId: accountId,
			name,
			address,
			privateKey,
			network,
			balance: "0",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		database.wallets.push(newWallet);
		await fs.writeFile(dbPath, JSON.stringify(database, null, 2));

		// Remove private key from response
		const { privateKey: _, ...walletWithoutPrivateKey } = newWallet;

		return NextResponse.json(walletWithoutPrivateKey);
	} catch (error) {
		console.error("Error creating wallet:", error);
		return NextResponse.json(
			{ error: "Failed to create wallet" },
			{ status: 500 }
		);
	}
}
