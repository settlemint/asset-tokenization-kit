import { metadata } from "@/config/metadata";
import { router } from "@/lib/orpc/routes/router";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { CORSPlugin } from "@orpc/server/plugins";
import {
  experimental_ZodSmartCoercionPlugin as ZodSmartCoercionPlugin,
  experimental_ZodToJsonSchemaConverter as ZodToJsonSchemaConverter,
} from "@orpc/zod/zod4";
import { createServerFileRoute } from "@tanstack/react-start/server";
import pkgjson from "../../../package.json";

// const logger = createLogger({
//   level: env.SETTLEMINT_LOG_LEVEL,
// });

const handler = new OpenAPIHandler(router, {
  // Use if you have unexplained 500 errors
  // interceptors: [
  //   onError((error) => {
  //     logger.error((error as Error).message, error);
  //   }),
  // ],
  plugins: [
    new CORSPlugin({
      allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
      allowHeaders: ["Content-Type", "X-Api-Key"],
      exposeHeaders: ["Content-Disposition", "X-Retry-After"],
      credentials: true,
      origin: (origin) => origin || "http://localhost:3000",
    }),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: metadata.title,
          version: pkgjson.version as string,
          description: metadata.description,
          license: {
            name: "FSL-1.1-MIT",
            url: "https://github.com/settlemint/asset-tokenization-kit/blob/main/LICENSE",
          },
        },
        externalDocs: {
          description: "SettleMint Asset Tokenization Kit",
          url: "https://console.settlemint.com/documentation/application-kits/asset-tokenization/introduction",
        },
        security: [
          {
            apiKey: [],
          },
        ],
        components: {
          securitySchemes: {
            apiKey: {
              type: "apiKey",
              in: "header",
              name: "X-Api-Key",
              description: "API key",
            },
          },
        },
      },
    }),
    new ZodSmartCoercionPlugin(),
  ],
});

export async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: {
      headers: request.headers,
    },
  });

  return response ?? new Response("Not Found", { status: 404 });
}

export const ServerRoute = createServerFileRoute("/api/$").methods({
  HEAD: handle,
  GET: handle,
  POST: handle,
  PUT: handle,
  PATCH: handle,
  DELETE: handle,
});
