import { ListSchema } from "@/orpc/routes/common/schemas/list.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Filters for narrowing identity listings.
 */
export const IdentityListFiltersSchema = z
  .object({
    /** Wallet address bound to the identity */
    accountId: ethereumAddress.optional(),
    /** Whether the identity represents a smart contract */
    isContract: z.boolean().optional(),
  })
  .partial();

/**
 * Input schema for identity listing.
 */
export const IdentityListInputSchema = ListSchema.extend({
  orderBy: ListSchema.shape.orderBy.default("id"),
  filters: IdentityListFiltersSchema.optional(),
});

/**
 * Account metadata returned with an identity item.
 * Contains the address and optional contract metadata.
 */
export const IdentityAccountSchema = z.object({
  id: ethereumAddress,
  contractName: z.string().nullable().optional(),
});

/**
 * Output schema exposed to clients.
 */
export const IdentityListOutputSchema = z.object({
  items: z.array(
    z.object({
      id: ethereumAddress,
      account: IdentityAccountSchema.nullable(),
      isContract: z.boolean().nullable(),
      claimsCount: z.number().int().nonnegative(),
      activeClaimsCount: z.number().int().nonnegative(),
      revokedClaimsCount: z.number().int().nonnegative(),
      deployedInTransaction: z.string(),
    })
  ),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive().max(200).optional(),
  offset: z.number().int().nonnegative(),
});

export type IdentityListFilters = z.infer<typeof IdentityListFiltersSchema>;
export type IdentityListInput = z.infer<typeof IdentityListInputSchema>;
export type IdentityListOutput = z.infer<typeof IdentityListOutputSchema>;
export type IdentityContract = z.infer<typeof IdentityAccountSchema>;
