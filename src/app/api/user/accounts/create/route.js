import { ethers } from "ethers";
import { cookies } from "next/headers";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const dbPath = path.join(process.cwd(), "src", "db", "database.txt");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request) {
	try {
		// Get auth cookie and verify JWT
		const cookieStore = await cookies();
		const token = cookieStore.get("auth_token")?.value;

		if (!token) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Verify JWT token
		const decoded = jwt.verify(token, JWT_SECRET);
		const userId = decoded.userId;

		// Get request body
		const { name } = await request.json();
		if (!name) {
			return Response.json(
				{ error: "Account name is required" },
				{ status: 400 }
			);
		}

		// Read database file
		const dbContent = fs.readFileSync(dbPath, "utf8");
		const database = JSON.parse(dbContent);

		// Find user
		const user = database.users.find((u) => u.id === userId);
		if (!user) {
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		// Generate new blockchain account
		const wallet = ethers.Wallet.createRandom();
		const newAccount = {
			id: crypto.randomUUID(),
			name,
			privateKey: wallet.privateKey,
			publicKey: wallet.publicKey,
			mnemonic: wallet.mnemonic.phrase,
		};

		// Add account to user's accounts
		user.accounts.push(newAccount);
		user.updatedAt = new Date().toISOString();

		// Save to database file
		fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));

		return Response.json({
			message: "Account created successfully",
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				accounts: user.accounts
			}
		});
	} catch (error) {
		console.error("Error creating account:", error);
		if (error.name === "JsonWebTokenError") {
			return Response.json({ error: "Invalid token" }, { status: 401 });
		}
		return Response.json(
			{ error: "Failed to create account" },
			{ status: 500 }
		);
	}
}
