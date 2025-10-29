import { source } from "@/lib/source";
import { env } from "@atk/config/env";
import { createFileRoute } from "@tanstack/react-router";

const baseUrl = env.APP_URL.endsWith("/")
  ? env.APP_URL.slice(0, -1)
  : env.APP_URL;

const CHANGEFREQ = "daily";

function getPriority(url: string): string {
  const path = url.slice(baseUrl.length);
  if (path === "" || path === "/") return "1.0";

  const trimmed = path.replaceAll(/^\/|\/$/g, "");
  if (trimmed.length === 0) return "1.0";

  const depth = trimmed.split("/").length;
  if (depth <= 1) return "0.9";
  if (depth === 2) return "0.7";
  if (depth === 3) return "0.6";
  return "0.5";
}

function buildSitemap(): string {
  const urls = new Set<string>([`${baseUrl}/`]);

  for (const page of source.getPages()) {
    if (!page.url.startsWith("/docs")) continue;
    urls.add(`${baseUrl}${page.url}`);
  }

  const entries = [...urls]
    .toSorted()
    .map(
      (url) =>
        `  <url><loc>${url}</loc><changefreq>${CHANGEFREQ}</changefreq><priority>${getPriority(
          url
        )}</priority></url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemap(), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
          },
        }),
    },
  },
});
