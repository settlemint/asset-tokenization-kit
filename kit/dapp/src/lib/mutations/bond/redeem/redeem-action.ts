"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { redeemFunction } from "./redeem-function";
import { RedeemBondSchema } from "./redeem-schema";

export const redeem = action
  .schema(RedeemBondSchema())
  .outputSchema(t.Hashes())
  .action(redeemFunction);
