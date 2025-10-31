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

import { auth } from "@/lib/auth";
import { normalizeHeaders } from "@/orpc/context/context";
import { logUnexpectedError } from "@/orpc/helpers/error";
import { router } from "@/orpc/routes/router";
import { metadata } from "@atk/config/metadata";
import { bigDecimalSerializer } from "@atk/zod/bigdecimal";
import { onError } from "@orpc/client";
import { experimental_SmartCoercionPlugin as SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { getRequestHeaders } from "@tanstack/react-start/server";
import pkgjson from "../../package.json";

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
  interceptors: [onError(logUnexpectedError)],
  customJsonSerializers: [bigDecimalSerializer],
  plugins: [
    /**
     * CORS plugin configuration.
     * Enables cross-origin requests with credentials support.
     * Uses an allowlist of trusted origins instead of reflecting any origin.
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
      specGenerateOptions: async () => {
        const authOpenApiSchema = await auth.api.generateOpenAPISchema();
        authOpenApiSchema.paths = Object.fromEntries(
          Object.entries(authOpenApiSchema.paths).map(([path, methods]) => {
            // Override tags to ['auth'] for all methods in this path
            const updatedMethods = Object.fromEntries(
              Object.entries(methods).map(([method, operation]) => {
                return [
                  method,
                  {
                    ...operation,
                    tags: ["auth"],
                  },
                ];
              })
            );
            return [`/auth${path}`, updatedMethods];
          })
        );
        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(authOpenApiSchema as any),
          info: {
            title: metadata.title,
            version: pkgjson.version,
            description: metadata.description,
            license: {
              name: "FSL-1.1-MIT",
              url: "https://github.com/settlemint/asset-tokenization-kit/blob/main/LICENSE",
            },
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
          servers: [
            {
              url: "/api",
            },
          ],
        };
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
  let headers: Headers | Record<string, string | string[]> = {};
  try {
    headers = normalizeHeaders(getRequestHeaders());
  } catch {
    headers = {};
  }

  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: {
      headers,
    },
  });

  return response ?? new Response("Not Found", { status: 404 });
}
