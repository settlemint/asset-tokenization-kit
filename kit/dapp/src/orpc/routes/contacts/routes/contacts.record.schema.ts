import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Shared contact schema.
 *
 * Represents an address book entry owned by the authenticated user.
 */
export const ContactSchema = z.object({
  /** Contact identifier */
  id: z.string(),
  /** Display label */
  name: z.string(),
  /** Target wallet address */
  wallet: ethereumAddress,
  /** Creation timestamp */
  createdAt: z.date(),
  /** Last update timestamp */
  updatedAt: z.date(),
});

export type Contact = z.infer<typeof ContactSchema>;
