import { metadata } from "@/lib/config/metadata";
import { siteConfig } from "@/lib/config/site";
import { router } from "@/lib/orpc/routes/router";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodSmartCoercionPlugin, ZodToJsonSchemaConverter } from "@orpc/zod";
import { NextRequest } from "next/server";
import pkgjson from "../../../../package.json";

const handler = new OpenAPIHandler(router, {
  plugins: [
    new CORSPlugin({
      allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
      allowHeaders: ["Content-Type", "x-api-key"],
      exposeHeaders: ["Content-Disposition", "X-Retry-After"],
      credentials: true,
      origin: (origin) => origin ?? "http://localhost:3000",
    }),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: metadata.title.default,
          version: pkgjson.version,
          description: metadata.description,
          license: {
            name: "FSL-1.1-MIT",
            url: "https://github.com/settlemint/asset-tokenization-kit/blob/main/LICENSE",
          },
          contact: {
            name: siteConfig.publisher,
            url: siteConfig.url,
            email: siteConfig.email,
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
              name: "x-api-key",
              description: "API key",
            },
          },
        },
      },
    }),
    new ZodSmartCoercionPlugin(),
  ],
});

async function handleRequest(request: NextRequest) {
  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: {
      headers: request.headers,
    },
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
