"use server";

import { action } from "../safe-action";
import { updateKycStatusFunction } from "./update-kyc-status-function";
import { UpdateKycStatusSchema } from "./update-kyc-status.schema";

/**
 * Update kyc status action to handle user kyc status updates
 */
export const updateKycStatus = action
  .schema(UpdateKycStatusSchema())
  .action(updateKycStatusFunction);
