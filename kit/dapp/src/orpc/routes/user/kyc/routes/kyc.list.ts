import { kycProfiles } from "@/lib/db/schema";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { asc, desc, ilike, or, sql, type AnyColumn } from "drizzle-orm";

export const list = authRouter.user.kyc.list
  .use(systemMiddleware)
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.kycList,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ context, input }) => {
    const { limit, offset, orderDirection, orderBy, search } = input;

    const order = orderDirection === "desc" ? desc : asc;
    const orderColumn =
      (kycProfiles[orderBy as keyof typeof kycProfiles] as
        | AnyColumn
        | undefined) ?? kycProfiles.createdAt;

    const whereCondition = search
      ? or(
          ilike(kycProfiles.firstName, `%${search}%`),
          ilike(kycProfiles.lastName, `%${search}%`)
        )
      : undefined;

    const [countResult] = await context.db
      .select({ count: sql<number>`count(*)::int` })
      .from(kycProfiles)
      .where(whereCondition);

    const items = await context.db
      .select()
      .from(kycProfiles)
      .where(whereCondition)
      .orderBy(order(orderColumn))
      .limit(limit)
      .offset(offset);

    return {
      items,
      total: countResult?.count ?? 0,
      limit,
      offset,
    };
  });
