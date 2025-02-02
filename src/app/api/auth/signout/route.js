import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        // Get cookie store
        const cookieStore = cookies();
        
        // Check if auth token exists before trying to delete it
        const authToken = cookieStore.get("auth_token");
        if (authToken) {
            cookieStore.delete("auth_token");
        }

        // Create the response with no-cache headers
        const response = NextResponse.json(
            { message: "Signed out successfully" },
            { 
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            }
        );

        return response;
    } catch (error) {
        console.error("Signout error:", error);
        return NextResponse.json(
            { error: "Failed to sign out" },
            { status: 500 }
        );
    }
}
