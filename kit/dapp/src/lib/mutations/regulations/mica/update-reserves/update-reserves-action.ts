"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { UpdateReservesSchema } from "./update-reserves-schema";

export const updateReserves = action
  .schema(UpdateReservesSchema())
  .outputSchema(t.Hashes())
  .action(async ({ parsedInput }) => {
    // TODO: Implement the actual update logic
    return ["0x123"];
  });
