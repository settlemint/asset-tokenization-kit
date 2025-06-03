/**
 * Server-side ORPC configuration module.
 *
 * This module is marked as "server only" to ensure it never gets bundled
 * into the client-side JavaScript, preventing server-specific code from
 * being exposed to the browser.
 */
"server only";

import { headers } from "next/headers";

/**
 * Global headers injection for server-side ORPC requests.
 *
 * This setup enables the ORPC client to access Next.js request headers
 * during server-side rendering (SSR) and API route execution. By attaching
 * the headers function to globalThis, we create a bridge between Next.js's
 * header context and the ORPC client's header injection mechanism.
 *
 * The headers are used for:
 * - Authentication token forwarding from incoming requests
 * - CSRF token validation
 * - Request context preservation across internal API calls
 * - Maintaining user session state during SSR
 *
 * @see {@link kit/dapp/src/lib/orpc/orpc.ts} - Client configuration that consumes these headers
 */
(globalThis as unknown as { $headers: () => Promise<Headers> }).$headers =
  headers;
