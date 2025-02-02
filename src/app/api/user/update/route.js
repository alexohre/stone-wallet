import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function PUT(request) {
    try {
        // Get the auth token
        const cookieStore = await cookies();
        const token = await cookieStore.get("auth_token");

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Verify token
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.userId;

        // Get update data
        const { name } = await request.json();

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        // Read database
        const dbPath = path.join(process.cwd(), 'src', 'db', 'database.txt');
        const dbContent = fs.readFileSync(dbPath, 'utf8');
        const database = JSON.parse(dbContent);

        // Find and update user
        const userIndex = database.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Update user name
        database.users[userIndex].name = name.trim();
        database.users[userIndex].updatedAt = new Date().toISOString();

        // Save to database
        fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));

        return NextResponse.json({
            success: true,
            user: {
                id: database.users[userIndex].id,
                name: database.users[userIndex].name,
                email: database.users[userIndex].email,
                accounts: database.users[userIndex].accounts
            }
        });

    } catch (error) {
        console.error('Update user error:', error);
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}
