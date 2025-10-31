import { contacts } from "@/lib/db/schema";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { and, asc, eq, ilike, or } from "drizzle-orm";

/**
 * Search contacts by name or wallet address.
 */
export const search = onboardedRouter.contacts.search
  .use(databaseMiddleware)
  .handler(async ({ input, context }) => {
    const { user } = context.auth;
    const pattern = `%${input.query.trim()}%`;

    return context.db
      .select({
        id: contacts.id,
        name: contacts.name,
        wallet: contacts.wallet,
      })
      .from(contacts)
      .where(
        and(
          eq(contacts.userId, user.id),
          or(ilike(contacts.name, pattern), ilike(contacts.wallet, pattern))
        )
      )
      .orderBy(asc(contacts.name))
      .limit(input.limit);
  });
