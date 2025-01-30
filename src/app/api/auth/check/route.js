import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get("auth_token");

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Verify token
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');

        // Read database file
        const dbPath = path.join(process.cwd(), 'src', 'db', 'database.txt');
        const dbContent = fs.readFileSync(dbPath, 'utf8');
        const users = JSON.parse(dbContent);

        // Find user
        const user = users.find(u => u.id === decoded.userId);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return user data without sensitive information
        const { password, ...userWithoutPassword } = user;
        return NextResponse.json({ user: userWithoutPassword });

    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}
