import { handle } from "@/orpc/api-handler.ts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api")({
  server: {
    handlers: {
      OPTIONS: handle,
      HEAD: handle,
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
    },
  },
});
