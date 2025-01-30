import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.join(process.cwd(), 'src/db/database.txt');

// Helper function to hash passwords
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

export async function POST(request) {
    try {
        const userData = await request.json();

        // Read existing users
        let users = [];
        try {
            const data = await fs.readFile(DB_PATH, 'utf8');
            users = JSON.parse(data);
        } catch (error) {
            // File doesn't exist or is empty, start with empty array
        }

        // Check if user already exists
        if (users.some(user => user.email === userData.email)) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        // Hash the password
        const hashedPassword = hashPassword(userData.password);

        // Create new user object
        const newUser = {
            id: crypto.randomUUID(),
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        // Add to users array
        users.push(newUser);

        // Write back to file
        await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2));

        // Return user without password
        const { password, ...userWithoutPassword } = newUser;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
        );
    }
}
