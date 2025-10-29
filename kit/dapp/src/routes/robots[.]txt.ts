import { env } from "@atk/config/env";
import { createFileRoute } from "@tanstack/react-router";

const baseUrl = env.APP_URL.endsWith("/")
  ? env.APP_URL.slice(0, -1)
  : env.APP_URL;

const body = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`;

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        }),
    },
  },
});
