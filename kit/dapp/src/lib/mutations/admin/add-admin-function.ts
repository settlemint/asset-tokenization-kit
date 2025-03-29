import type { User } from "@/lib/auth/types";
import { UserFragment } from "@/lib/queries/user/user-fragment";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { revalidatePath } from "next/cache";
import type { AddAdminFormType } from "./add-admin-schema";

/**
 * GraphQL mutation for adding an admin
 */
const AddAdmin = hasuraGraphql(
  `
  mutation AddAdmin($address: String!, $name: String!, $id: String!, $role: String!) {
    insert_user_one(
      object: {
        id: $id,
        wallet: $address,
        name: $name,
        role: $role
      }
    ) {
      ...UserFragment
    }
  }
`,
  [UserFragment]
);

/**
 * Function to add an admin user
 *
 * @param input - Validated input for adding an admin
 * @param user - The user adding the admin
 * @returns An array containing a mock transaction hash
 */
export async function addAdminFunction({
  parsedInput: { address, firstName, lastName },
  ctx: { user },
}: {
  parsedInput: AddAdminFormType;
  ctx: { user: User };
}) {
  try {
    const data = await hasuraClient.request(AddAdmin, {
      id: crypto.randomUUID(),
      address: address,
      name: `${firstName} ${lastName}`,
      role: "admin",
    });

    const admin = data?.insert_user_one;
    if (!admin) {
      throw new Error("Failed to add admin: No data returned");
    }

    // Revalidate both the parent and specific route to ensure table refresh
    revalidatePath("/platform/admins", "page");

    // Return a mock Ethereum transaction hash (0x + 64 hex chars)
    return [`0x${"0".repeat(64)}`];
  } catch (error) {
    console.error("Error adding admin:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to add admin"
    );
  }
}
