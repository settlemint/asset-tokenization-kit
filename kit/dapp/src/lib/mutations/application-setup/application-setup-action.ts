"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { applicationSetupFunction } from "./application-setup-function";
import { ApplicationSetupSchema } from "./application-setup-schema";

export const applicationSetup = action
  .schema(ApplicationSetupSchema())
  .outputSchema(
    t.Object({
      started: t.Boolean(),
    })
  )
  .action(applicationSetupFunction);
