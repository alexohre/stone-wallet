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
    console.log('Password verification:', {
        passwordLength: password.length,
        saltLength: salt.length,
        hashMatch: hash === verifyHash
    });
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

        console.log('Signin attempt:', { email });

        // Read database file
        const dbPath = path.join(process.cwd(), 'src', 'db', 'database.txt');
        const dbContent = fs.readFileSync(dbPath, 'utf8');
        const database = JSON.parse(dbContent);

        // Find user by email
        const user = database.users.find(u => u.email === email);

        if (!user) {
            console.log('User not found:', { email });
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        console.log('User found:', { 
            userId: user.id,
            email: user.email,
            hasPassword: !!user.password
        });

        // Verify password
        const isValidPassword = verifyPassword(password, user.password);
        console.log('Password verification result:', { isValidPassword });

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
                email: user.email,
                password
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Create response with accounts included
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                accounts: user.accounts
            }
        });

        // Set cookie
        const cookieStore = await cookies();
        await cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        console.log('Signin successful:', { 
            userId: user.id,
            email: user.email,
            accountsCount: user.accounts.length
        });

        return response;

    } catch (error) {
        console.error('Signin error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
