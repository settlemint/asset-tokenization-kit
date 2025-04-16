"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { attestPriceFunction } from "./attest-price-function";
import { AttestPriceSchema } from "./attest-price-schema";

export const attestPrice = action
  .schema(AttestPriceSchema())
  .outputSchema(t.Hashes())
  .action(attestPriceFunction);
