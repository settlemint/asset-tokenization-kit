import { api } from "@/lib/api";

// This is required to enable streaming
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const result = await api.handle(req);
  if (!result.headers.get("content-type")?.includes("text/event-stream")) {
    return result;
  }

  return new Response(result.body, {
    headers: {
      ...result.headers,
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}

export const POST = api.handle;
export const PUT = api.handle;
export const PATCH = api.handle;
export const DELETE = api.handle;
export const HEAD = api.handle;
export const OPTIONS = api.handle;
