/**
 * API Catch-All Route Handler
 *
 * This module implements a catch-all API route that handles all HTTP requests
 * to the /api/* path. It serves as the main entry point for the ORPC API,
 * providing:
 *
 * - OpenAPI-compliant REST endpoints generated from ORPC procedures
 * - Automatic API documentation and schema generation
 * - CORS handling for cross-origin requests
 * - Smart type coercion for request parameters
 * - Request context propagation (headers, auth, etc.)
 *
 * The route uses ORPC's OpenAPI handler to automatically transform typed
 * RPC procedures into RESTful endpoints with proper HTTP semantics.
 * @see {@link https://github.com/unjs/orpc} - ORPC documentation
 * @see {@link https://spec.openapis.org/oas/latest.html} - OpenAPI specification
 */

import { metadata } from "@/config/metadata";
import { bigDecimalSerializer } from "@/lib/zod/validators/bigdecimal";
import { router } from "@/orpc/routes/router";
import { onError } from "@orpc/client";
import { experimental_SmartCoercionPlugin as SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createLogger } from "@settlemint/sdk-utils/logging";
import {
  createServerFileRoute,
  getHeaders,
} from "@tanstack/react-start/server";
import pkgjson from "../../../package.json";

const logger = createLogger();

/**
 * OpenAPI handler configuration.
 *
 * Configures the ORPC OpenAPI handler with:
 * - CORS plugin for cross-origin support
 * - OpenAPI reference plugin for API documentation
 * - Zod schema converter for JSON Schema generation
 * - Smart coercion for flexible parameter handling
 */
const handler = new OpenAPIHandler(router, {
  // Log only unexpected server errors (skip 4xx like NOT_FOUND/UNAUTHORIZED)
  interceptors: [
    onError((error) => {
      const e = error as { code?: string; status?: number; message?: string };
      const status = typeof e?.status === "number" ? e.status : undefined;
      const code = typeof e?.code === "string" ? e.code : undefined;

      // Skip common/expected client-side errors
      if (
        (status && status < 500) /* 4xx */ ||
        code === "NOT_FOUND" ||
        code === "UNAUTHORIZED"
      ) {
        return;
      }

      logger.error(e?.message ?? "OpenAPI handler error", error);
    }),
  ],
  customJsonSerializers: [bigDecimalSerializer],
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
          version: pkgjson.version,
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

/**
 * Request handler for all API routes.
 *
 * Processes incoming HTTP requests through the ORPC OpenAPI handler,
 * which maps them to appropriate procedures based on the URL path.
 * Includes request headers in the context for authentication and
 * other middleware to access.
 * @param request.request
 * @param request - The incoming HTTP request
 * @returns HTTP response from the matched procedure or 404 if not found
 */
export async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: {
      headers: getHeaders(),
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
