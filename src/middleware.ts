import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Assume auth token is stored in cookie 'auth-storage' or similar if using server-side auth
    // Since we are using client-side Zustand persistence in localStorage, middleware access to auth is limited.
    // We can check for a cookie if we were syncing it. 
    // For this mock implementation without real backend cookies, middleware is limited.
    // HOWEVER, we can simulate protection logic or handle specific redirects.

    // Real implementation: verify JWT from cookie
    // Mock implementation: We'll rely on client-side checks for now as Zustand data is in LocalStorage (client-only).
    // But we can protect admin routes if we had a cookie.

    // Since we don't have server-side auth set up (cookies), we can't fully protect routes in Middleware 
    // without a strategy to sync Zustand to Cookies.
    // I will skip enforcing auth in Middleware and rely on Client-Side protection components
    // or add a basic check if we pretend a cookie exists.

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/orders/:path*'],
};
