"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../../safe-action";
import { updateReservesFunction } from "./update-reserves-function";
import { UpdateReservesSchema } from "./update-reserves-schema";

export const updateReserves = action
  .schema(UpdateReservesSchema())
  .outputSchema(t.Hashes())
  .action(updateReservesFunction);
