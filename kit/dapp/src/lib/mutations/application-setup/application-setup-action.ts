"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { applicationSetupFunction } from "./application-setup-function";

export const applicationSetup = action
  .outputSchema(
    t.Object({
      started: t.Boolean(),
    })
  )
  .action(applicationSetupFunction);
