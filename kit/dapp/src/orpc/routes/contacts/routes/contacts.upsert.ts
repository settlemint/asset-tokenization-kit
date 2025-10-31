import { contacts } from "@/lib/db/schema";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import type { SQL } from "drizzle-orm";
import { and, eq, ne } from "drizzle-orm";
import { randomUUID } from "node:crypto";

/**
 * Create or update a contact entry.
 *
 * Ensures wallet uniqueness per user and returns the persisted record.
 */
export const upsert = onboardedRouter.contacts.upsert
  .use(databaseMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { user } = context.auth;
    const id = input.id ?? randomUUID();
    const name = input.name.trim();
    const wallet = input.wallet.toLowerCase() as `0x${string}`;

    const duplicateConditions: SQL[] = [
      eq(contacts.userId, user.id),
      eq(contacts.wallet, wallet),
    ];

    if (input.id) {
      duplicateConditions.push(ne(contacts.id, input.id));
    }

    const duplicateWhere =
      duplicateConditions.length === 1
        ? duplicateConditions[0]
        : and(...duplicateConditions);

    const [existing] = await context.db
      .select({ id: contacts.id })
      .from(contacts)
      .where(duplicateWhere)
      .limit(1);

    if (existing) {
      throw errors.RESOURCE_ALREADY_EXISTS({
        message: "Contact with that wallet already exists",
      });
    }

    const returningSelection = {
      id: contacts.id,
      name: contacts.name,
      wallet: contacts.wallet,
      createdAt: contacts.createdAt,
      updatedAt: contacts.updatedAt,
    };

    if (input.id) {
      const [updated] = await context.db
        .update(contacts)
        .set({
          name,
          wallet,
          updatedAt: new Date(),
        })
        .where(and(eq(contacts.id, input.id), eq(contacts.userId, user.id)))
        .returning(returningSelection);

      if (!updated) {
        throw errors.NOT_FOUND({
          message: "Contact not found",
        });
      }

      return updated;
    }

    const [created] = await context.db
      .insert(contacts)
      .values({
        id,
        name,
        wallet,
        userId: user.id,
      })
      .returning(returningSelection);

    if (!created) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to create contact",
      });
    }

    return created;
  });
