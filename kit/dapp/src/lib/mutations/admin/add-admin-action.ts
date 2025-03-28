"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { addAdminFunction } from "./add-admin-function";
import { getAddAdminFormSchema } from "./add-admin-schema";

export const addAdmin = action
  .schema(getAddAdminFormSchema())
  .outputSchema(t.Array(t.String()))
  .action(addAdminFunction);
