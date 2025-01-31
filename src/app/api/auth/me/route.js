import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
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

        // Read database file
        const dbPath = path.join(process.cwd(), "src", "db", "database.txt");
        const dbContent = fs.readFileSync(dbPath, "utf8");
        const database = JSON.parse(dbContent);

        // Find user
        const user = database.users.find((u) => u.id === decoded.userId);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return user data with accounts
        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            accounts: user.accounts
        });
    } catch (error) {
        console.error("Me endpoint error:", error);
        return NextResponse.json(
            { error: "Failed to get user data" },
            { status: 500 }
        );
    }
}
