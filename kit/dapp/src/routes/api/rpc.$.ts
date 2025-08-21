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

import { logUnexpectedError } from "@/orpc/helpers/error";
import { router } from "@/orpc/routes/router";
import { bigDecimalSerializer } from "@atk/zod/bigdecimal";
import { bigIntSerializer } from "@atk/zod/bigint";
import { timestampSerializer } from "@atk/zod/timestamp";
import { onError } from "@orpc/client";
import { RPCHandler } from "@orpc/server/fetch";
import { BatchHandlerPlugin } from "@orpc/server/plugins";
import {
  createServerFileRoute,
  getHeaders,
} from "@tanstack/react-start/server";

/**
 * OpenAPI handler configuration.
 *
 * Configures the ORPC OpenAPI handler with:
 * - CORS plugin for cross-origin support
 * - OpenAPI reference plugin for API documentation
 * - Zod schema converter for JSON Schema generation
 * - Smart coercion for flexible parameter handling
 */
const handler = new RPCHandler(router, {
  interceptors: [onError(logUnexpectedError)],
  plugins: [new BatchHandlerPlugin()],
  customJsonSerializers: [
    bigDecimalSerializer,
    bigIntSerializer,
    timestampSerializer,
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
    prefix: "/api/rpc",
    context: {
      headers: getHeaders(),
    },
  });

  return response ?? new Response("Not Found", { status: 404 });
}

export const ServerRoute = createServerFileRoute("/api/rpc/$").methods({
  HEAD: handle,
  GET: handle,
  POST: handle,
  PUT: handle,
  PATCH: handle,
  DELETE: handle,
});
