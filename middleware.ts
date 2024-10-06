import { auth } from "@/lib/auth";
import { middleware as i18nMiddleware } from "@/lib/i18n";

// const isUserAuthenticatedRoute = createRouteMatcher(["/wallet", "/wallet/(.*)"]);

export default auth((request) => {
  // const proxyResponse = proxyMiddleware(request);
  // if (proxyResponse) {
  //   return proxyResponse;
  // }

  // if (isUserAuthenticatedRoute(request) && !request.auth) {
  //   const language = i18nMiddleware.detectLanguage(request);
  //   return NextResponse.redirect(new URL(`/${language}/auth/signin`, request.url));
  // }

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
