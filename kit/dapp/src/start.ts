/**
 * TanStack Start Instance Configuration
 *
 * This module configures the TanStack Start instance with custom middleware.
 * Currently includes LLM path rewriting middleware for documentation routing.
 *
 * The middleware intercepts requests to /docs paths and rewrites them to
 * the appropriate /llms.mdx paths for LLM-specific documentation.
 */

import { redirect } from "@tanstack/react-router";
import { createMiddleware, createStart } from "@tanstack/react-start";
import { rewritePath } from "fumadocs-core/negotiation";

const { rewrite: rewriteLLM } = rewritePath(
  "/docs{/*path}.mdx",
  "/llms.mdx{/*path}"
);

const llmMiddleware = createMiddleware().server(({ next, request }) => {
  const url = new URL(request.url);
  const path = rewriteLLM(url.pathname);
  if (path) {
    throw redirect({ to: path });
  }

  return next();
});

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [llmMiddleware],
  };
});

export default startInstance;
