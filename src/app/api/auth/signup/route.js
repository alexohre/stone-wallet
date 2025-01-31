import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";

export const runtime = "nodejs";

// Generate a random wallet using ethers.js
function generateWallet() {
	// Create a new random wallet
	const wallet = ethers.Wallet.createRandom();

	return {
		mnemonic: wallet.mnemonic.phrase,
		account: {
			address: wallet.address,
			privateKey: wallet.privateKey,
			publicKey: wallet.publicKey,
		},
	};
}

// Generate password hash
function hashPassword(password) {
	const salt = crypto.randomBytes(16).toString("hex");
	const hash = crypto
		.pbkdf2Sync(password, salt, 1000, 64, "sha512")
		.toString("hex");
	return `${salt}:${hash}`;
}

export async function POST(request) {
	try {
		const { name, email, password } = await request.json();

		// Validate input
		if (!name || !email || !password) {
			return NextResponse.json(
				{ error: "Name, email and password are required" },
				{ status: 400 }
			);
		}

		// Read database file
		const dbPath = path.join(process.cwd(), "src", "db", "database.txt");
		const dbContent = fs.readFileSync(dbPath, "utf8");
		const database = JSON.parse(dbContent);

		// Check if user already exists
		if (database.users.some((u) => u.email === email)) {
			return NextResponse.json(
				{ error: "Email already registered" },
				{ status: 400 }
			);
		}

		// Generate wallet using ethers.js
		const { mnemonic, account } = generateWallet();

		// Create new user
		const newUser = {
			id: crypto.randomUUID(),
			name,
			email,
			password: hashPassword(password),
			mnemonic: mnemonic, // Store mnemonic securely
			accounts: [account], // Store account
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		// Add user to database
		database.users.push(newUser);

		// Create initial wallet for the user
		const newWallet = {
			id: crypto.randomUUID(),
			userId: newUser.id,
			name: "My First Wallet",
			address: account.address,
			privateKey: account.privateKey, // Store securely
			balance: "0",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		// Add wallet to database
		database.wallets.push(newWallet);

		// Save to database file
		fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));

		// Create JWT token
		const token = jwt.sign(
			{
				userId: newUser.id,
				email: newUser.email,
			},
			process.env.JWT_SECRET || "your-secret-key",
			{ expiresIn: "12h" }
		);

		// Create response
		const response = NextResponse.json({
			success: true,
			user: {
				id: newUser.id,
				name: newUser.name,
				email: newUser.email,
			},
		});

		// Set auth cookie
		const cookieStore = await cookies();
		await cookieStore.set("auth_token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 60 * 60 * 24, // 24 hours
		});

		return response;
	} catch (error) {
		console.error("Signup error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
