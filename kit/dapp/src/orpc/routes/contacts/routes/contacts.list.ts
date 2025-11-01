import { contacts } from "@/lib/db/schema";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";

const ORDERABLE_COLUMNS = {
  createdAt: contacts.createdAt,
  updatedAt: contacts.updatedAt,
  name: contacts.name,
  wallet: contacts.wallet,
} as const;

/**
 * Contact listing route handler.
 *
 * Returns paginated address book entries scoped to the authenticated user
 * with optional fuzzy search on name and wallet fields.
 */
export const list = onboardedRouter.contacts.list
  .use(databaseMiddleware)
  .handler(async ({ input, context }) => {
    const { user } = context.auth;
    const { limit: requestedLimit, offset, orderBy, orderDirection } = input;
    const limit = requestedLimit ?? 50;
    const searchTerm = input.filters?.search?.trim();

    const baseCondition = eq(contacts.userId, user.id);
    const searchCondition = searchTerm
      ? or(
          ilike(contacts.name, `%${searchTerm}%`),
          ilike(contacts.wallet, `%${searchTerm}%`)
        )
      : undefined;

    const whereClause = searchCondition
      ? and(baseCondition, searchCondition)
      : baseCondition;

    const order = orderDirection === "desc" ? desc : asc;
    const orderColumn = ORDERABLE_COLUMNS[orderBy] ?? contacts.createdAt;

    const [totalResult, items] = await Promise.all([
      context.db.select({ value: count() }).from(contacts).where(whereClause),
      context.db
        .select({
          id: contacts.id,
          name: contacts.name,
          wallet: contacts.wallet,
          createdAt: contacts.createdAt,
          updatedAt: contacts.updatedAt,
        })
        .from(contacts)
        .where(whereClause)
        .orderBy(order(orderColumn))
        .limit(limit)
        .offset(offset),
    ]);

    const total = totalResult[0]?.value ?? 0;

    return {
      items,
      total,
      limit,
      offset,
    };
  });
