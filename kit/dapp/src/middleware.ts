import { betterFetch } from '@better-fetch/fetch';
import { proxyMiddleware } from '@settlemint/sdk-next/middlewares/proxy';
import type { Session, User } from 'better-auth/types';
import { type NextRequest, NextResponse } from 'next/server';
import { match } from 'path-to-regexp';

const isUserAuthenticatedRoute = match(['/user', '/user/*path', '/portfolio', '/portfolio/*path']);
const isIssuerAuthenticatedRoute = match(['/admin', '/admin/*path']);
const isAdminAuthenticatedRoute = match(['/admin/supersecure', '/admin/supersecure/*path']);
const isOgRoute = match(['/*/og', '/*/og/*path']);

const routeRoleMap = [
  { checker: isUserAuthenticatedRoute, roles: ['user', 'issuer', 'admin'] },
  { checker: isIssuerAuthenticatedRoute, roles: ['issuer', 'admin'] },
  { checker: isAdminAuthenticatedRoute, roles: ['admin'] },
];

function buildRedirectUrl(request: NextRequest): URL {
  const redirectUrl = new URL('/auth/signin', request.url);
  const returnPath = request.nextUrl.search
    ? `${request.nextUrl.pathname}${request.nextUrl.search}`
    : request.nextUrl.pathname;
  redirectUrl.searchParams.set('rd', returnPath);
  return redirectUrl;
}

function buildWrongRoleRedirectUrl(request: NextRequest): URL {
  const redirectUrl = new URL('/auth/wrong-role', request.url);
  const returnPath = request.nextUrl.search
    ? `${request.nextUrl.pathname}${request.nextUrl.search}`
    : request.nextUrl.pathname;
  redirectUrl.searchParams.set('rd', returnPath);
  return redirectUrl;
}

export default async function middleware(request: NextRequest) {
  const proxyResponse = proxyMiddleware(request);
  if (proxyResponse) {
    return proxyResponse;
  }

  // Skip authentication for OG routes
  if (isOgRoute(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const { data } = await betterFetch<{ session: Session; user: User & { role: 'user' | 'issuer' | 'admin' } }>(
    '/api/auth/get-session',
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    }
  );

  for (const { checker, roles } of routeRoleMap) {
    if (checker(request.nextUrl.pathname)) {
      if (!data) {
        return NextResponse.redirect(buildRedirectUrl(request));
      }
      if (!roles.includes(data.user.role)) {
        return NextResponse.redirect(buildWrongRoleRedirectUrl(request));
      }
    }
  }

  return NextResponse.next();
}

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
