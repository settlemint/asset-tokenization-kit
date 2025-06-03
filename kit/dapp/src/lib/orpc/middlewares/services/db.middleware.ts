import { db } from "@/lib/db";
import { br } from "@/lib/orpc/routes/procedures/base.router";

export const databaseMiddleware = br.middleware(async ({ context, next }) => {
  return next({
    context: {
      db: context.db ?? db,
    },
  });
});
