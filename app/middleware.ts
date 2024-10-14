// middleware.ts
import { NextResponse,NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const token = await getToken({ req });
    console.log(token);

    const protectedRoutes = ['/stream', '/dashboard']; 

    // If the request is for a protected route and there's no token, redirect to sign in
    if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route)) && !token) {
        return NextResponse.redirect(new URL('/api/auth/signin', req.url));
    }

    // Allow the request to proceed if the user is authenticated or if the route is not protected
    return NextResponse.next();
}

// Specify the paths to apply the middleware
export const config = {
    matcher: ['/stream', '/dashboard'], // Adjust this to match your protected routes
};
