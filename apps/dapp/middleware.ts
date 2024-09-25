import { auth } from "@/lib/auth";
import { middleware as i18nMiddleware } from "@/lib/i18n";
import { proxyMiddleware } from "@settlemint/sdk-next/edge";

export default auth((request) => {
  const proxyResponse = proxyMiddleware(request);
  if (proxyResponse) {
    return proxyResponse;
  }

  return i18nMiddleware(request);
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
