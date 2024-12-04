import { authConfig } from '@/lib/auth/config';
import { proxyMiddleware } from '@settlemint/sdk-next/middlewares/proxy';
import NextAuth from 'next-auth';
import { type NextRequest, NextResponse } from 'next/server';
import { match } from 'path-to-regexp';

const isUserAuthenticatedRoute = match(['/user', '/user/*path']);
const isIssuerAuthenticatedRoute = match(['/issuer', '/issuer/*path']);
const isAdminAuthenticatedRoute = match(['/admin', '/admin/*path']);

const { auth } = NextAuth({
  ...authConfig,
  providers: [], // we don't want to import bcryptjs in the middleware
});

const routeRoleMap = [
  { checker: isUserAuthenticatedRoute, role: 'user' },
  { checker: isIssuerAuthenticatedRoute, role: 'issuer' },
  { checker: isAdminAuthenticatedRoute, role: 'admin' },
] as const;

function buildRedirectUrl(request: NextRequest): URL {
  const redirectUrl = new URL('/auth/signin', request.url);
  const returnPath = request.nextUrl.search
    ? `${request.nextUrl.pathname}${request.nextUrl.search}`
    : request.nextUrl.pathname;
  redirectUrl.searchParams.set('rd', encodeURIComponent(returnPath));
  return redirectUrl;
}

export default auth((request) => {
  const proxyResponse = proxyMiddleware(request);
  if (proxyResponse) {
    return proxyResponse;
  }

  const userRoles = request.auth?.user?.roles ?? [];
  if (userRoles.includes('admin')) {
    return NextResponse.next();
  }

  for (const { checker, role } of routeRoleMap) {
    if (checker(request.nextUrl.pathname) && !userRoles.includes(role)) {
      return NextResponse.redirect(buildRedirectUrl(request));
    }
  }

  return NextResponse.next();
});

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
