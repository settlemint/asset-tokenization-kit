import { PaginatedListSchema } from "@/orpc/routes/common/schemas/paginated-list.schema";
import { EntityTypeSchema } from "@atk/zod/entity-types";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

export const EntityListFiltersSchema = z
  .object({
    entityType: EntityTypeSchema.optional(),
  })
  .partial();

export const EntityListInputSchema = PaginatedListSchema.extend({
  orderBy: PaginatedListSchema.shape.orderBy.default("lastActivity"),
  filters: EntityListFiltersSchema.optional(),
});

export const EntityItemSchema = z.object({
  id: ethereumAddress,
  contractAddress: ethereumAddress.nullable(),
  contractName: z.string().nullable(),
  entityType: EntityTypeSchema.nullable(),
  isContract: z.boolean().nullable(),
  status: z.enum(["pending", "registered"]),
  verificationBadges: z.array(z.string()),
  lastActivity: z.string(),
  activeClaimsCount: z.number().int().nonnegative(),
  revokedClaimsCount: z.number().int().nonnegative(),
  deployedInTransaction: z.string(),
});

export const EntityListOutputSchema = z.object({
  items: z.array(EntityItemSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive().max(200).optional(),
  offset: z.number().int().nonnegative(),
});

export type EntityListFilters = z.infer<typeof EntityListFiltersSchema>;
export type EntityListInput = z.infer<typeof EntityListInputSchema>;
export type EntityListOutput = z.infer<typeof EntityListOutputSchema>;
export type EntityItem = z.infer<typeof EntityItemSchema>;
