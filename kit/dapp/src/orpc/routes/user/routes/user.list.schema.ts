import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { ListSchema } from "@/orpc/routes/common/schemas/list.schema";
import { UserMeSchema } from "@/orpc/routes/user/routes/user.me.schema";

/**
 * Schema for user listing parameters.
 *
 * Extends the base ListSchema but overrides the default orderBy
 * to maintain backwards compatibility. Users are typically ordered
 * by creation date to show newest users first.
 */
export const UserListSchema = ListSchema.extend({
  orderBy: ListSchema.shape.orderBy.default("createdAt"),
  searchByAddress: ethereumAddress.optional(),
});

export const UserListOutputSchema = UserMeSchema.array();
