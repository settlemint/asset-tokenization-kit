"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { createStablecoinFunction } from "./create-function";
import { CreateStablecoinSchema } from "./create-schema";

export const createStablecoin = action
  .schema(CreateStablecoinSchema())
  .outputSchema(t.Hashes())
  .action(createStablecoinFunction);
