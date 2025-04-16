"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { registerSchemasFunction } from "./register-schema-function";
import { RegisterSchemaSchema } from "./register-schema-schema";

export const registerSchema = action
  .schema(RegisterSchemaSchema())
  .outputSchema(t.Hashes())
  .action(registerSchemasFunction);
