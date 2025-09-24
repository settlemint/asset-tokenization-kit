import { auth } from "@/lib/auth";
import { router } from "@/orpc/routes/router";
import { bigDecimalSerializer } from "@atk/zod/bigdecimal";
import { bigIntSerializer } from "@atk/zod/bigint";
import { timestampSerializer } from "@atk/zod/timestamp";
import { RPCHandler } from "@orpc/server/node";
import { BatchHandlerPlugin } from "@orpc/server/plugins";
import { toNodeHandler } from "better-auth/node";
import { createServer } from "node:http";

const handler = new RPCHandler(router, {
  plugins: [new BatchHandlerPlugin()],
  customJsonSerializers: [
    bigDecimalSerializer,
    bigIntSerializer,
    timestampSerializer,
  ],
});
const authHandler = toNodeHandler(auth);

export function startServer(port: number) {
  const server = createServer(async (req, res) => {
    if (req.url?.toLowerCase().startsWith("/api/auth")) {
      return authHandler(req, res);
    }

    // Strip /api/rpc from the url
    const url = req.url?.startsWith("/api/rpc")
      ? req.url.replace("/api/rpc", "")
      : req.url;
    req.url = url;

    const result = await handler.handle(req, res, {
      context: { headers: req.headers },
    });

    if (!result.matched) {
      res.statusCode = 404;
      res.end("No procedure matched");
    }
  });
  return new Promise<{ stop: () => void; url: string }>((resolve, reject) => {
    server
      .listen(port, "127.0.0.1", () => {
        const serverAddress = server.address();
        const assignedPort =
          serverAddress && typeof serverAddress === "object"
            ? serverAddress.port
            : port;
        const url = `http://localhost:${assignedPort}`;
        resolve({
          stop: () => {
            server.close();
            server.closeAllConnections();
            server.unref();
          },
          url,
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
