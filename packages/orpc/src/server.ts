import { metadata } from "@atk/config/metadata";
import { bigDecimalSerializer } from "@atk/zod/validators/bigdecimal";
import { bigIntSerializer } from "@atk/zod/validators/bigint";
import { timestampSerializer } from "@atk/zod/validators/timestamp";
import { experimental_SmartCoercionPlugin as SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { RPCHandler } from "@orpc/server/fetch";
import { BatchHandlerPlugin, CORSPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { router } from "./routes/router";

export const orpcRpcHandler = new RPCHandler(router, {
  plugins: [
    new BatchHandlerPlugin(),
    new CORSPlugin({
      allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
      allowHeaders: ["Content-Type", "X-Api-Key"],
      exposeHeaders: ["Content-Disposition", "X-Retry-After"],
      credentials: true,
      origin: (origin) => origin || "http://localhost:3000",
    }),
  ],
  customJsonSerializers: [bigDecimalSerializer, bigIntSerializer, timestampSerializer],
});

export const orpcOpenApiHandler = new OpenAPIHandler(router, {
  customJsonSerializers: [bigDecimalSerializer, bigIntSerializer, timestampSerializer],
  plugins: [
    /**
     * CORS plugin configuration.
     * Enables cross-origin requests with credentials support.
     */
    new CORSPlugin({
      allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
      allowHeaders: ["Content-Type", "X-Api-Key"],
      exposeHeaders: ["Content-Disposition", "X-Retry-After"],
      credentials: true,
      origin: (origin) => origin || "http://localhost:3000",
    }),

    /**
     * OpenAPI documentation plugin.
     * Generates OpenAPI spec and provides API documentation endpoints.
     */
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: metadata.title,
          version: "latest",
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
    new SmartCoercionPlugin(),
  ],
});
