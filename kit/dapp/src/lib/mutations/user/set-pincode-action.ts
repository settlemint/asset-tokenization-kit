"use server";

import { action } from "../safe-action";
import { setPincodeFunction } from "./set-pincode-function";
import { SetPincodeSchema } from "./set-pincode-schema";

/**
 * Set pincode action to handle wallet verification
 */
export const setPincode = action
  .schema(SetPincodeSchema())
  .action(setPincodeFunction);
