import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const runtime = 'nodejs';

function verifyPassword(password, storedPassword) {
    const [salt, hash] = storedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Read database file
        const dbPath = path.join(process.cwd(), 'src', 'db', 'database.txt');
        const dbContent = fs.readFileSync(dbPath, 'utf8');
        const users = JSON.parse(dbContent);

        // Find user
        const user = users.find(u => u.email === email);

        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = verifyPassword(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Set cookie
        cookies().set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        // Return success response
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Signin error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
