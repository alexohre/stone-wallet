import { ethers } from 'ethers';
import { getTokenFromCookies } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { database } from '@/db';

export async function POST(request) {
    try {
        // Get JWT token from cookies
        const token = await getTokenFromCookies();
        if (!token) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return Response.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Get request body
        const { mnemonic, name } = await request.json();

        // Validate input
        if (!mnemonic || !name) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate mnemonic
        try {
            ethers.Wallet.fromPhrase(mnemonic);
        } catch (error) {
            return Response.json({ error: 'Invalid recovery phrase' }, { status: 400 });
        }

        // Create new wallet entry
        const newWallet = {
            id: `wallet_${Date.now()}`,
            userId: decoded.userId,
            name,
            mnemonic,
            createdAt: new Date().toISOString(),
        };

        // Add wallet to database
        database.wallets.push(newWallet);

        // Return success without sensitive data
        return Response.json({
            id: newWallet.id,
            name: newWallet.name,
            createdAt: newWallet.createdAt,
        });
    } catch (error) {
        console.error('Error importing wallet:', error);
        return Response.json(
            { error: 'Failed to import wallet' },
            { status: 500 }
        );
    }
}
