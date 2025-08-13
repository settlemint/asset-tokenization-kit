import { auth } from "@/lib/auth";
import { bigDecimalSerializer } from "@/lib/zod/validators/bigdecimal";
import { bigIntSerializer } from "@/lib/zod/validators/bigint";
import { timestampSerializer } from "@/lib/zod/validators/timestamp";
import { router } from "@/orpc/routes/router";
import { RPCHandler } from "@orpc/server/node";
import { BatchHandlerPlugin } from "@orpc/server/plugins";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { toNodeHandler } from "better-auth/node";
import { createServer } from "node:http";

const logger = createLogger({ level: "info" });

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
      context: { headers: req.headers as Record<string, string | undefined> },
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
        logger.info(`dApp api listening on ${url}`);
        resolve({
          stop: () => {
            logger.info(`Stopping dApp api on url ${url}`);
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
