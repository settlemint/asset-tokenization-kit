import { proxyMiddleware } from "@settlemint/sdk-next/middlewares/proxy";
import { getSessionCookie } from "better-auth/cookies";
import { default as createIntlMiddleware } from "next-intl/middleware";
import { unauthorized } from "next/navigation";
import type { NextRequest } from "next/server";
import { match } from "path-to-regexp";

const isPrivateRoute = match(["/:locale/proxy", "/:locale/proxy/*path"]);

// Create the Next Intl middleware outside the main middleware function
const intlMiddleware = createIntlMiddleware({
  locales: ["en", "de"],
  defaultLocale: "en",
  // Add this to ensure root path redirects to the default locale
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  const cookies = getSessionCookie(request);

  if (isPrivateRoute(request.nextUrl.pathname) && !cookies) {
    unauthorized();
  }

  // Handle proxy routes - proxyMiddleware already checks if the path matches
  // and returns NextResponse.next() if it's not a proxy route
  const proxyResponse = proxyMiddleware(request);

  // Only stop the middleware chain if the response is a rewrite (for proxy routes)
  // NextResponse.next() should be ignored and allow the middleware to continue
  if (proxyResponse && proxyResponse.headers.get("x-middleware-rewrite")) {
    return proxyResponse;
  }

  // Finally, handle the internationalization routing
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
