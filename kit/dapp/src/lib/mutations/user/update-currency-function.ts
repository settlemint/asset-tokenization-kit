import type { User } from "@/lib/auth/types";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { revalidatePath, revalidateTag } from "next/cache";
import type { UpdateCurrencyInput } from "./update-currency-schema";

/**
 * GraphQL mutation to update a user's currency setting
 */
const UpdateUserCurrency = hasuraGraphql(`
  mutation UpdateUserCurrency($userId: String!, $currency: String!) {
    update_user_by_pk(pk_columns: {id: $userId}, _set: {currency: $currency}) {
      id
      currency
    }
  }
`);

/**
 * Function to update a user's preferred currency
 *
 * @param input - Validated input containing currency
 * @param user - The user executing the update operation
 * @returns Success status and updated user data
 */
export async function updateCurrencyFunction({
  parsedInput: { currency },
  ctx: { user },
}: {
  parsedInput: UpdateCurrencyInput;
  ctx: { user: User };
}) {
  const result = await hasuraClient.request(UpdateUserCurrency, {
    userId: user.id,
    currency,
  });

  revalidateTag("user");

  revalidatePath("/[locale]/assets", "layout");
  revalidatePath("/[locale]/portfolio", "layout");

  return { success: true, data: result.update_user_by_pk };
}
