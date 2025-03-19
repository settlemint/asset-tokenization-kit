import { proxyMiddleware } from "@settlemint/sdk-next/middlewares/proxy";
import { parseCookies } from "better-auth/cookies";
import { default as createIntlMiddleware } from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

// Create the Next Intl middleware outside the main middleware function
const intlMiddleware = createIntlMiddleware({
  locales: ["en", "de", "ja", "ar"],
  defaultLocale: "en",
  // Add this to ensure root path redirects to the default locale
  localePrefix: "always",
});

const getSessionCookie = (request: NextRequest, config?: any) => {
  const headers = request instanceof Headers ? request : request.headers;
  const cookies = headers.get("cookie");
  if (!cookies) {
    return null;
  }
  const {
    cookieName = "session_token",
    cookiePrefix = "better-auth",
    useSecureCookies = (request instanceof Request &&
      process.env.NODE_ENV === "production" &&
      request.url.startsWith("https://")) ||
      (request instanceof Request && request.url.startsWith("https://")
        ? true
        : false),
  } = config || {};
  console.log({ cookieName, cookiePrefix, useSecureCookies });
  const name = useSecureCookies
    ? `__Secure-${cookiePrefix}.${cookieName}`
    : `${cookiePrefix}.${cookieName}`;
  const parsedCookie = parseCookies(cookies);
  const sessionToken = parsedCookie.get(name);
  if (sessionToken) {
    return sessionToken;
  }
  return null;
};

export default function middleware(request: NextRequest) {
  // Handle proxy routes - proxyMiddleware already checks if the path matches
  // and returns NextResponse.next() if it's not a proxy route
  const proxyResponse = proxyMiddleware(request);

  // Only stop the middleware chain if the response is a rewrite (for proxy routes)
  // NextResponse.next() should be ignored and allow the middleware to continue
  if (proxyResponse?.headers.get("x-middleware-rewrite")) {
    const cookies = getSessionCookie(request);
    console.log("request", request);
    console.log("cookies", cookies);
    if (!cookies) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return proxyResponse;
  }

  // Finally, handle the internationalization routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|backgrounds|logos|apple).*)",
  ],
};
