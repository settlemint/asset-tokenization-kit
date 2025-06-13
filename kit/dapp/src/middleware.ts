export { middleware as default } from "@/i18n/navigation";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|backgrounds|logos|apple|ingest|pdf-worker).*)",
  ],
};
