import { user } from "@/lib/db/schema";
import { getUserRole } from "@/lib/zod/validators/user-roles";
import { permissionsMiddleware } from "@/orpc/middlewares/auth/permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { getPagination } from "@/orpc/routes/utils/pagination";
import { asc, desc, type AnyColumn } from "drizzle-orm";

export const list = authRouter.user.list
  .use(permissionsMiddleware({ user: ["list"] }))
  .use(databaseMiddleware)
  .handler(async ({ context, input }) => {
    const { limit, offset, orderDirection, orderBy } = {
      ...getPagination(input),
      orderDirection: input?.orderDirection ?? "asc",
      orderBy: input?.orderBy ?? "createdAt",
    };

    const order = orderDirection === "desc" ? desc : asc;

    const orderColumn =
      (user[orderBy as keyof typeof user] as AnyColumn | undefined) ??
      user.createdAt;

    const result = await context.db
      .select()
      .from(user)
      .orderBy(order(orderColumn))
      .limit(limit)
      .offset(offset);

    return result.map((user) => ({
      ...user,
      role: getUserRole(user.role),
    }));
  });
