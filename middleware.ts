import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const protectedPaths = ['/plan', '/plant', '/grow', '/watch', '/onboarding', '/settings'];

export default auth((req) => {
  const { nextUrl } = req;
  const isProtected = protectedPaths.some((path) => nextUrl.pathname.startsWith(path));

  if (!req.auth && isProtected) {
    const signInUrl = new URL('/auth/sign-in', nextUrl);
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/plan/:path*',
    '/plant/:path*',
    '/grow/:path*',
    '/watch/:path*',
    '/onboarding/:path*',
    '/settings/:path*'
  ]
};
