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
    created_at: t.String({
      format: "date-time",
      description: "The timestamp when the contact was created",
    }),
    user_id: t.String({
      description: "The user ID of the contact owner",
    }),
    updated_at: t.Optional(
      t.Nullable(
        t.String({
          format: "date-time",
          description: "The timestamp when the contact was last updated",
        })
      )
    ),
  },
  {
    description: "Contact information for a user's address book",
  }
);
export type Contact = StaticDecode<typeof ContactSchema>;
