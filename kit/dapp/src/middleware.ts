import { proxyMiddleware } from '@settlemint/sdk-next/middlewares/proxy';
import { getSessionCookie } from 'better-auth';
import { type NextRequest, NextResponse } from 'next/server';
import { type Match, match } from 'path-to-regexp';
import { isCrawler } from './lib/config/crawlers';

const isAssetRoute = match(['/admin/:type/:id', '/admin/:type/:id/*path']);
const isPrivateRoute = match([
  '/admin',
  '/admin/*path',
  '/proxy',
  '/proxy/*path',
]);

function buildRedirectUrl(request: NextRequest): URL {
  const redirectUrl = new URL('/auth/signin', request.url);
  const returnPath = request.nextUrl.search
    ? `${request.nextUrl.pathname}${request.nextUrl.search}`
    : request.nextUrl.pathname;
  redirectUrl.searchParams.set('rd', returnPath);
  return redirectUrl;
}

export default function middleware(request: NextRequest) {
  if (isCrawler(request.headers.get('user-agent') || '')) {
    const assetMatch = isAssetRoute(request.nextUrl.pathname) as Match<{
      type: string;
      id: string;
    }>;
    if (assetMatch) {
      const shareUrl = new URL(
        `/share/${assetMatch.params.type}/${assetMatch.params.id}`,
        request.url
      );
      return NextResponse.redirect(shareUrl);
    }
  }

  // quick check for the session cookie
  const cookies = getSessionCookie(request);

  if (isPrivateRoute(request.nextUrl.pathname) && !cookies) {
    return NextResponse.redirect(buildRedirectUrl(request));
  }

  const proxyResponse = proxyMiddleware(request);
  if (proxyResponse) {
    return proxyResponse;
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
