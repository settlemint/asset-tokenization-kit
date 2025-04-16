import { Elysia } from "elysia";
import { auth } from "../auth/auth";
import type { User } from "../auth/types";

export const betterAuth = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ error, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return error(401);

        return {
          user: session.user as User,
          session: session.session,
        };
      },
    },
  })
  .as("plugin");

export const cacheControl = new Elysia({ name: "cache-control" })
  .onBeforeHandle(({ request, set }) => {
    if (request.method === "GET") {
      set.headers["Cache-Control"] = "public, max-age=10";
    }
  })
  .as("plugin");
