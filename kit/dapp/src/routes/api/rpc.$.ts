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

import { orpcRpcHandler } from "@atk/orpc/server";
import { createServerFileRoute, getHeaders } from "@tanstack/react-start/server";

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
  const { response } = await orpcRpcHandler.handle(request, {
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
