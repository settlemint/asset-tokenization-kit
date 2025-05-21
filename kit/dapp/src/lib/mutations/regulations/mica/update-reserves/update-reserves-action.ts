"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { updateReservesFunction } from "./update-reserves-function";
import { UpdateReservesSchema } from "./update-reserves-schema";

export const updateReserves = action
  .schema(UpdateReservesSchema())
  .outputSchema(t.Hashes())
  .action(updateReservesFunction);
