import type { z } from "zod";
import { ListSchema } from "@/routes/common/schemas/list.schema";
import { UserSchema } from "@/routes/user/routes/user.me.schema";

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

export const UserListOutputSchema = UserSchema.array();

export type UserList = z.infer<typeof UserListOutputSchema>;
