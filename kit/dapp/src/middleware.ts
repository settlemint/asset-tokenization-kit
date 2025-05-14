import { default as createIntlMiddleware } from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

// Create the Next Intl middleware outside the main middleware function
const intlMiddleware = createIntlMiddleware({
  locales: ["en", "de", "ja", "ar"],
  defaultLocale: "en",
  // Add this to ensure root path redirects to the default locale
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/auth-api")) {
    return NextResponse.next();
  }
  // Handle the internationalization routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|backgrounds|logos|apple|ingest).*)",
  ],
};
