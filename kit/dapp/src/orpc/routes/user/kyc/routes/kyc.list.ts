import { kycProfiles } from "@/lib/db/schema";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  or,
  sql,
  type AnyColumn,
} from "drizzle-orm";

export const list = authRouter.user.kyc.list
  // .use(permissionsMiddleware({ user: ["list"] }))
  .use(databaseMiddleware)
  .handler(async ({ context, input, errors }) => {
    const { userId, limit, offset, orderDirection, orderBy, search } = input;

    // Check if user is accessing their own data or is an admin
    if (context.auth.user.id !== userId && context.auth.user.role !== "admin") {
      throw errors.FORBIDDEN({
        message:
          "Access denied. You do not have permission to view these KYC profiles.",
      });
    }

    const order = orderDirection === "desc" ? desc : asc;
    const orderColumn =
      (kycProfiles[orderBy as keyof typeof kycProfiles] as
        | AnyColumn
        | undefined) ?? kycProfiles.createdAt;

    const baseCondition = eq(kycProfiles.userId, userId);
    const searchCondition = search
      ? or(
          ilike(kycProfiles.firstName, `%${search}%`),
          ilike(kycProfiles.lastName, `%${search}%`)
        )
      : undefined;

    const whereCondition = searchCondition
      ? and(baseCondition, searchCondition)
      : baseCondition;

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
      items: items.map((item) => ({
        ...item,
        nationalIdEncrypted: undefined,
        hasNationalId: !!item.nationalIdEncrypted,
      })),
      total: countResult?.count ?? 0,
      limit,
      offset,
    };
  });
