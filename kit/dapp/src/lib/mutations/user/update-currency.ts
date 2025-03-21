"use server";

import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { action } from "../safe-action";

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
 * Zod schema for validating user currency update
 */
const UpdateCurrencySchema = z.object({
  currency: z.enum(["USD", "EUR", "JPY", "AED", "SGD", "SAR"]),
});

/**
 * Server action to update a user's preferred currency
 *
 * @example
 * ```tsx
 * import { updateCurrency } from "@/lib/mutations/user/update-currency";
 *
 * // In your component
 * const handleCurrencyChange = async (currency: CurrencyCode) => {
 *   try {
 *     await updateCurrency({ currency });
 *     toast.success("Currency updated successfully");
 *   } catch (error) {
 *     toast.error("Failed to update currency");
 *   }
 * };
 * ```
 */
export const updateCurrency = action
  .schema(UpdateCurrencySchema)
  .action(async ({ parsedInput: { currency }, ctx: { user } }) => {
    try {
      const result = await hasuraClient.request(UpdateUserCurrency, {
        userId: user.id,
        currency,
      });

      revalidateTag("user");

      revalidatePath("/[locale]/assets", "layout");
      revalidatePath("/[locale]/portfolio", "layout");

      return { success: true, data: result.update_user_by_pk };
    } catch (error) {
      console.error("Error updating currency:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to update currency"
      );
    }
  });
