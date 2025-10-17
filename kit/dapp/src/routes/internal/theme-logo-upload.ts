import { createServerFileRoute } from "@tanstack/react-start/server";
import { Buffer } from "node:buffer";

type UploadResponse = {
  etag?: string;
  uploadedAt: string;
};

const normalizeUploadUrl = (rawUrl: string): string => {
  try {
    const url = new URL(rawUrl);
    if (
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      url.protocol === "https:"
    ) {
      const endpoint =
        process.env.SETTLEMINT_MINIO_ENDPOINT ??
        process.env.MINIO_SERVER_URL ??
        "";
      if (endpoint.startsWith("http://")) {
        url.protocol = "http:";
      }
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
};

export const ServerRoute = createServerFileRoute(
  "/internal/theme-logo-upload"
).methods({
  POST: async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get("file");
    const uploadUrl = formData.get("uploadUrl");
    const methodValue = formData.get("method");
    const method =
      typeof methodValue === "string" && methodValue.length > 0
        ? methodValue
        : "PUT";
    const headersRaw = formData.get("headers");

    if (!(file instanceof File) || typeof uploadUrl !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing file or upload URL" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let headerMap: Record<string, string> = {};
    if (typeof headersRaw === "string" && headersRaw.length > 0) {
      try {
        headerMap = JSON.parse(headersRaw) as Record<string, string>;
      } catch {
        // ignore malformed headers, fall back to empty
      }
    }

    if (!headerMap["Content-Type"] && file.type) {
      headerMap["Content-Type"] = file.type;
    }

    const normalizedUrl = normalizeUploadUrl(uploadUrl);
    const arrayBuffer = await file.arrayBuffer();
    const upstreamResponse = await fetch(normalizedUrl, {
      method,
      headers: headerMap,
      body: Buffer.from(arrayBuffer),
    });

    if (!upstreamResponse.ok) {
      return new Response(
        JSON.stringify({
          error: `Upstream upload failed with status ${upstreamResponse.status} ${upstreamResponse.statusText}`,
        }),
        {
          status: upstreamResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const etag =
      upstreamResponse.headers.get("etag") ??
      upstreamResponse.headers.get("ETag") ??
      undefined;

    const payload: UploadResponse = {
      etag: etag ?? undefined,
      uploadedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
});
