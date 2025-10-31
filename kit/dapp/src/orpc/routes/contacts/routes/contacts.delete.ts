import { contacts } from "@/lib/db/schema";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { and, eq } from "drizzle-orm";

/**
 * Delete a contact entry owned by the authenticated user.
 */
export const del = onboardedRouter.contacts.delete
  .use(databaseMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { user } = context.auth;

    const [removed] = await context.db
      .delete(contacts)
      .where(and(eq(contacts.id, input.id), eq(contacts.userId, user.id)))
      .returning({ id: contacts.id });

    if (!removed) {
      throw errors.NOT_FOUND({
        message: "Contact not found",
      });
    }

    return { success: true as const };
  });
