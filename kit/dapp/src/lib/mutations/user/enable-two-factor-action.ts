"use server";

import { action } from "../safe-action";
import { enableTwoFactorFunction } from "./enable-two-factor-function";
import { EnableTwoFactorSchema } from "./enable-two-factor-schema";

/**
 * Set pincode action to handle wallet verification
 */
export const enableTwoFactor = action
  .schema(EnableTwoFactorSchema())
  .action(enableTwoFactorFunction);
