import { auth } from "@/lib/auth";
import { router } from "@/orpc/routes/router";
import { RPCHandler } from "@orpc/server/node";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { toNodeHandler } from "better-auth/node";
import { createServer } from "node:http";

const logger = createLogger();

const handler = new RPCHandler(router, {
  plugins: [],
});
const authHandler = toNodeHandler(auth);

export function startServer(port: number) {
  const server = createServer(async (req, res) => {
    if (req.url?.toLowerCase().startsWith("/api/auth")) {
      return authHandler(req, res);
    }
    const result = await handler.handle(req, res, {
      context: { headers: req.headers as Record<string, string | undefined> },
    });

    if (!result.matched) {
      res.statusCode = 404;
      res.end("No procedure matched");
    }
  });
  return new Promise<{ stop: () => void }>((resolve, reject) => {
    server
      .listen(port, "127.0.0.1", () => {
        logger.info(`dApp api listening on 127.0.0.1:${port}`);
        resolve({
          stop: () => {
            logger.info(`Stopping dApp api`);
            server.close();
          },
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
