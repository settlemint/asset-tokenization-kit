import { ListSchema } from "@/orpc/routes/common/schemas/list.schema";
import { UserSchema } from "@/orpc/routes/user/routes/user.me.schema";
import { z } from "zod";

/**
 * Schema for user listing parameters.
 *
 * Extends the base ListSchema but overrides the default orderBy
 * to maintain backwards compatibility. Users are typically ordered
 * by creation date to show newest users first.
 */
export const UserListInputSchema = ListSchema.extend({
  orderBy: ListSchema.shape.orderBy.default("createdAt"),
});

/**
 * Paginated response schema for user listing.
 *
 * Follows the same pattern as other paginated endpoints in the system
 * (kyc.list, exchange-rates.list) for consistency.
 */
export const UserListOutputSchema = z.object({
  /** Array of users for the current page */
  items: UserSchema.array(),
  /** Total number of users across all pages */
  total: z.number(),
  /** Current limit applied */
  limit: z.number().optional(),
  /** Current offset applied */
  offset: z.number(),
});

export type UserList = z.infer<typeof UserListOutputSchema>;
