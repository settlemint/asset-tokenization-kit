"use server";

import { CreateTokenWizardSchema } from "@/app/wallet/(home)/forms/create-token-wizard.schema";
import { actionClient } from "@/lib/safe-action";

export const createTokenAction = actionClient.schema(CreateTokenWizardSchema).action(async ({ parsedInput }) => {
  try {
    const { ...formData } = parsedInput;
  } catch (error) {
    return { success: false, error };
  }
});
