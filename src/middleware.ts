
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
    const session = await auth();
    const { pathname } = request.nextUrl;

    // Protected admin routes - require ADMIN role
    if (pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if ((session.user as any)?.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Protected staff / karyawan routes - require STAFF or ADMIN role
    if (pathname.startsWith('/staff')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        const userRole = (session.user as any)?.role;
        if (userRole !== 'STAFF' && userRole !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Protected user routes - require any authenticated user
    const protectedUserRoutes = ['/my-orders', '/profile', '/checkout', '/payment'];
    const isProtectedUserRoute = protectedUserRoutes.some(route => pathname.startsWith(route));

    if (isProtectedUserRoute) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/staff/:path*',
        '/my-orders/:path*',
        '/profile/:path*',
        '/checkout/:path*',
        '/payment/:path*'
    ],
};
