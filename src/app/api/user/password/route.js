import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import crypto from "crypto";

function hashPassword(password) {
	const salt = crypto.randomBytes(16).toString("hex");
	const hash = crypto
		.pbkdf2Sync(password, salt, 1000, 64, "sha512")
		.toString("hex");
	return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
	const [salt, hash] = storedPassword.split(":");
	const verifyHash = crypto
		.pbkdf2Sync(password, salt, 1000, 64, "sha512")
		.toString("hex");
	return hash === verifyHash;
}

export async function PUT(request) {
	try {
		// Get the auth token
		const cookieStore = await cookies();
		const token = await cookieStore.get("auth_token");

		if (!token) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Verify token
		const decoded = jwt.verify(
			token.value,
			process.env.JWT_SECRET || "your-secret-key"
		);
		const userId = decoded.userId;

		// Get update data
		const { currentPassword, newPassword } = await request.json();

		if (!currentPassword || !newPassword) {
			return NextResponse.json(
				{ error: "Current password and new password are required" },
				{ status: 400 }
			);
		}

		if (newPassword.length < 6) {
			return NextResponse.json(
				{ error: "New password must be at least 6 characters long" },
				{ status: 400 }
			);
		}

		// Read database
		const dbPath = path.join(process.cwd(), "src", "db", "database.txt");
		const dbContent = fs.readFileSync(dbPath, "utf8");
		const database = JSON.parse(dbContent);

		// Find user
		const userIndex = database.users.findIndex((u) => u.id === userId);
		if (userIndex === -1) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Verify current password
		const isValidPassword = verifyPassword(
			currentPassword,
			database.users[userIndex].password
		);
		if (!isValidPassword) {
			return NextResponse.json(
				{ error: "Current password is incorrect" },
				{ status: 400 }
			);
		}

		// Update password
		database.users[userIndex].password = hashPassword(newPassword);
		database.users[userIndex].updatedAt = new Date().toISOString();

		// Save to database
		fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));

		return NextResponse.json({
			success: true,
			message: "Password updated successfully",
		});
	} catch (error) {
		console.error("Update password error:", error);
		if (error.name === "JsonWebTokenError") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "Failed to update password" },
			{ status: 500 }
		);
	}
}
