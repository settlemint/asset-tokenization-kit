import { auth } from "@atk/auth/server";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { serve } from "bun";
import { orpcRpcHandler } from "../src/server";

const logger = createLogger();

let dappUrl: string | undefined;

export function getDappUrl() {
  return dappUrl ?? "http://localhost:3000";
}

export async function startApiServer() {
  try {
    const { stop, url } = await startServer(0);
    dappUrl = url;
    return { stop, url };
  } catch (error) {
    logger.error("Failed to start dApp api", error);
    process.exit(1);
  }
}

function getRequestHeaders(request: Request) {
  const _headers: Record<string, string | undefined> = {};
  for (const [key, value] of request.headers.entries()) {
    _headers[key] = value || undefined;
  }
  return _headers;
}

export function startServer(port: number) {
  return new Promise<{ stop: () => void; url: string }>((resolve, reject) => {
    try {
      const server = serve({
        port,
        hostname: "127.0.0.1",
        async fetch(request) {
          const url = new URL(request.url);

          // Handle auth routes
          if (url.pathname.toLowerCase().startsWith("/api/auth")) {
            return auth.handler(request);
          }

          // Handle RPC routes
          if (url.pathname.startsWith("/api/rpc")) {
            const { response } = await orpcRpcHandler.handle(request, {
              prefix: "/api/rpc",
              context: {
                headers: getRequestHeaders(request),
              },
            });
            return response ?? new Response("Not Found", { status: 404 });
          }

          // No route matched
          return new Response("No procedure matched", { status: 404 });
        },
      });

      const url = `http://localhost:${server.port}`;

      resolve({
        stop: () => {
          server.stop();
        },
        url,
      });
    } catch (error) {
      reject(error);
    }
  });
}
