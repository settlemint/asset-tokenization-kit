import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Input schema for creating or updating a contact entry.
 */
export const ContactsUpsertSchema = z.object({
  /** Existing contact identifier; omitted when creating */
  id: z.uuid().optional(),
  /** Display label shown in address book pickers */
  name: z
    .string()
    .min(1)
    .max(120)
    .describe("Human readable label for the contact"),
  /** Target wallet address for the contact */
  wallet: ethereumAddress,
});

export type ContactsUpsertInput = z.infer<typeof ContactsUpsertSchema>;
