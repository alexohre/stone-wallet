import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        // Create the response
        const response = NextResponse.json({ message: 'Signed out successfully' });

        // Get cookie store and remove the cookie
        const cookieStore = cookies();
        cookieStore.delete('auth_token');
        
        return response;
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to sign out' },
            { status: 500 }
        );
    }
}
