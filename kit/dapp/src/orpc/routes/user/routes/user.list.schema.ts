import { PaginatedListSchema } from "@/orpc/routes/common/schemas/paginated-list.schema";
import { UserSchema } from "@/orpc/routes/user/routes/user.me.schema";
import { accessControlRoles } from "@atk/zod/access-control-roles";
import { identityClaim } from "@atk/zod/claim";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

/**
 * Schema for user listing parameters.
 *
 * Extends the base ListSchema but overrides the default orderBy
 * to maintain backwards compatibility. Users are typically ordered
 * by creation date to show newest users first.
 */
export const UserListInputSchema = PaginatedListSchema.extend({
  orderBy: PaginatedListSchema.shape.orderBy.default("createdAt"),
  filters: z
    .object({
      search: z.string().optional().describe("Search query"),
    })
    .optional(),
});

export const UserWithIdentitySchema = UserSchema.extend({
  /**
   * User's on-chain identity address.
   * Present if the user has an on-chain identity.
   */
  identity: ethereumAddress.optional(),

  /**
   * User's identity claims from the blockchain.
   * Empty array if user has no identity or claims.
   */
  claims: z.array(identityClaim).default([]),

  /**
   * Whether the user is registered in the identity registry.
   * True if user has an identity and is registered.
   */
  isRegistered: z.boolean().default(false),

  /**
   * User's blockchain roles.
   * Record mapping role names to boolean values indicating if user has that role.
   */
  roles: accessControlRoles,

  /**
   * Whether the user is has any admin role.
   * True if user has any admin role.
   */
  isAdmin: z.boolean().optional().nullable(),
});

/**
 * Paginated response schema for user listing.
 *
 * Follows the same pattern as other paginated endpoints in the system
 * (kyc.list, exchange-rates.list) for consistency.
 */
export const UserListOutputSchema = z.object({
  /** Array of users for the current page */
  items: UserWithIdentitySchema.array(),
  /** Total number of users across all pages */
  total: z.number(),
  /** Current limit applied */
  limit: z.number().optional(),
  /** Current offset applied */
  offset: z.number(),
});

export type UserList = z.infer<typeof UserListOutputSchema>;
export type UserWithIdentity = z.infer<typeof UserWithIdentitySchema>;
