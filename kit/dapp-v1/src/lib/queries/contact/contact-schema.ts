import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for contact data
 *
 * Provides validation for contact information including:
 * id, name, wallet address, creation date, user id, and update date
 */
export const ContactSchema = t.Object(
  {
    id: t.String({
      description: "The unique identifier of the contact",
    }),
    name: t.String({
      description: "The name of the contact",
    }),
    wallet: t.EthereumAddress({
      description: "The wallet address of the contact",
    }),
  },
  {
    description: "Contact information for a user's address book",
  }
);
export type Contact = StaticDecode<typeof ContactSchema>;
