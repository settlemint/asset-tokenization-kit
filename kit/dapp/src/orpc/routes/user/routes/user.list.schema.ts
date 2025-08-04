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

export const UserListOutputSchema = UserSchema.array();

export type UserList = z.infer<typeof UserListOutputSchema>;
