import { type StaticDecode, t } from "@/lib/utils/typebox";

export function getAddContactFormSchema() {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The wallet address of the contact",
      }),
      firstName: t.String({
        description: "First name of the contact",
        minLength: 1,
        errorMessage: "First name is required",
      }),
      lastName: t.String({
        description: "Last name of the contact",
        minLength: 1,
        errorMessage: "Last name is required",
      }),
    },
    {
      description: "Schema for validating add contact form inputs",
    }
  );
}

export const AddContactOutputSchema = t.Object(
  {
    id: t.String({
      description: "Unique identifier for the contact",
    }),
    wallet: t.String({
      description: "Wallet address of the contact",
    }),
    name: t.String({
      description: "Full name of the contact",
    }),
    user_id: t.String({
      description: "User ID of the contact owner",
    }),
    created_at: t.String({
      description: "Creation timestamp",
    }),
    lastTransaction: t.Object(
      {
        hash: t.String({
          description: "Transaction hash",
        }),
        status: t.Enum(
          {
            success: "success",
            pending: "pending",
            error: "error",
          },
          {
            description: "Status of the transaction",
            default: "success",
          }
        ),
      },
      {
        description: "Last transaction information",
      }
    ),
  },
  {
    description: "Schema for contact output data",
  }
);

export type AddContactFormType = StaticDecode<
  ReturnType<typeof getAddContactFormSchema>
>;
export type AddContactOutputType = StaticDecode<typeof AddContactOutputSchema>;
