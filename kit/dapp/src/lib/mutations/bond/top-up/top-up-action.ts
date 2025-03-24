"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { topUpUnderlyingAssetFunction } from "./top-up-function";
import { TopUpSchema } from "./top-up-schema";

export const topUpUnderlyingAsset = action
  .schema(TopUpSchema())
  .outputSchema(t.Hashes())
  .action(topUpUnderlyingAssetFunction);
