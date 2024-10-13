// middleware.ts (if you need middleware for route protection)
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req:NextRequest) {
  const token = await getToken({ req });
  console.log(token);
  
  // If no token is found, redirect to login
  if (!token) {
    return NextResponse.redirect('/login');
  }

  // Allow request to continue if authenticated
  return NextResponse.next();
}

export const config = {
    matcher: ['/streams/*', '/dashboard/*'], // Adjust paths as necessary
};
