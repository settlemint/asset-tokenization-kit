import { auth } from "@/lib/auth/auth";
import { router } from "@/lib/orpc/routes/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { CORSPlugin } from "@orpc/server/plugins";
import {
  experimental_ZodSmartCoercionPlugin as ZodSmartCoercionPlugin,
  experimental_ZodToJsonSchemaConverter as ZodToJsonSchemaConverter,
} from "@orpc/zod/zod4";
import { headers } from "next/headers";

const handler = new OpenAPIHandler(router, {
  plugins: [
    new CORSPlugin({
      exposeHeaders: ["Content-Disposition"],
    }),
    new ZodSmartCoercionPlugin(),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: "ORPC Playground",
          version: "1.0.0",
        },
      },
    }),
  ],
});

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: {
      session: await auth.api.getSession({
        headers: await headers(),
      }),
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
