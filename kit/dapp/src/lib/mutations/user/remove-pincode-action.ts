"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { removePincodeFunction } from "./remove-pincode-function";

/**
 * Set pincode action to handle wallet verification
 */
export const removePincode = action
  .outputSchema(t.Object({ success: t.Boolean() }))
  .action(removePincodeFunction);
