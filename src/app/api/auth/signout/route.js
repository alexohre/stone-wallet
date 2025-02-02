import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        // Get cookie store and await it
        const cookieStore = await cookies();
        
        // Check if auth token exists before trying to delete it
        const authToken = await cookieStore.get("auth_token");
        if (authToken) {
            await cookieStore.delete("auth_token");
        }

        // Create the response with no-cache headers
        const response = new NextResponse(
            JSON.stringify({ success: true }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Pragma': 'no-cache'
                },
            }
        );

        return response;
    } catch (error) {
        console.error('Signout error:', error);
        return NextResponse.json(
            { error: "Failed to sign out" },
            { status: 500 }
        );
    }
}
