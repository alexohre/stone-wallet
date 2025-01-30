import { NextResponse } from 'next/server';
 
// This function can be marked `async` if using `await` inside
export function middleware(request) {
    // Get the pathname of the request (e.g. /, /protected)
    const path = request.nextUrl.pathname;

    // Get the token from the cookies
    const authToken = request.cookies.get('auth_token')?.value;

    // Define public paths that don't require authentication
    const isPublicPath = path === '/signin' || path === '/signup' || path === '/';

    if (isPublicPath && authToken) {
        // If user is signed in and tries to access public path,
        // redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!isPublicPath && !authToken) {
        // If user is not signed in and tries to access protected path,
        // redirect to sign-in page
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
