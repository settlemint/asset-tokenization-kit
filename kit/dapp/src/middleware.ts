import { proxyMiddleware } from '@settlemint/sdk-next/middlewares/proxy';
import { getSessionCookie } from 'better-auth';
import { default as createIntlMiddleware } from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { match } from 'path-to-regexp';

const isPrivateRoute = match([
  ':locale/admin',
  ':locale/admin/*path',
  '/proxy',
  '/proxy/*path',
]);

// Create the Next Intl middleware outside the main middleware function
const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'de'],
  defaultLocale: 'en',
  // Add this to ensure root path redirects to the default locale
  localePrefix: 'always',
});

function buildRedirectUrl(request: NextRequest): URL {
  const redirectUrl = new URL('/auth/signin', request.url);
  const returnPath = request.nextUrl.search
    ? `${request.nextUrl.pathname}${request.nextUrl.search}`
    : request.nextUrl.pathname;
  redirectUrl.searchParams.set('rd', returnPath);
  return redirectUrl;
}

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle proxy routes - proxyMiddleware already checks if the path matches
  // and returns NextResponse.next() if it's not a proxy route
  const proxyResponse = proxyMiddleware(request);

  // Only stop the middleware chain if the response is a rewrite (for proxy routes)
  // NextResponse.next() should be ignored and allow the middleware to continue
  if (proxyResponse && proxyResponse.headers.get('x-middleware-rewrite')) {
    return proxyResponse;
  }

  // Check for authentication for private routes
  const cookies = getSessionCookie(request);
  if (isPrivateRoute(pathname) && !cookies) {
    return NextResponse.redirect(buildRedirectUrl(request));
  }

  console.log('middleware', pathname);

  // Finally, handle the internationalization routing
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/proxy/:path*', '/', '/(de|en)/:path*'],
};
