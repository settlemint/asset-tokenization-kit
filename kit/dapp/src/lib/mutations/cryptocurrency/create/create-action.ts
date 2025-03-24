"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { createCryptoCurrencyFunction } from "./create-function";
import { CreateCryptoCurrencySchema } from "./create-schema";

export const createCryptoCurrency = action
  .schema(CreateCryptoCurrencySchema())
  .outputSchema(t.Hashes())
  .action(createCryptoCurrencyFunction);
