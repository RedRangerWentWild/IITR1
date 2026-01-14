import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Since we store JWT in localStorage, we can't easily check it in server-side middleware 
    // without a cookie fallback. However, the user spec mentions cookies.get('jwt_token').
    // Let's check for either cookie or just let the client-side handle it if we only have localStorage.
    // For the sake of the spec "request.cookies.get('jwt_token')", I'll implement that.

    const token = request.cookies.get('jwt_token')?.value;

    if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
