"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { updateCollateralFunction } from "./update-collateral-function";
import { UpdateCollateralSchema } from "./update-collateral-schema";

/**
 * Update collateral action to handle updating collateral for token contracts
 */
export const updateCollateral = action
  .schema(UpdateCollateralSchema())
  .outputSchema(t.Hashes())
  .action(updateCollateralFunction);
