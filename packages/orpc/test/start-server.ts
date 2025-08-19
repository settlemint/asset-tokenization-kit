import { auth } from "@atk/auth/server";
import { orpcRpcHandler } from "../src/server";

export function startServer(port: number) {
  return new Promise<{ stop: () => void; url: string }>((resolve, reject) => {
    try {
      const server = Bun.serve({
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
            const { response } = await orpcRpcHandler.handle(request);
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
