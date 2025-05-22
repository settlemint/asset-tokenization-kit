"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { mintFunction } from "./mint-function";
import { MintSchema } from "./mint-schema";

export const mint = action
  .schema(MintSchema())
  .outputSchema(t.Hashes())
  .action(mintFunction);
