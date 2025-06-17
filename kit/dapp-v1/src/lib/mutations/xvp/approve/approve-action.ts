"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { approveXvpFunction } from "./approve-function";
import { ApproveXvpSchema } from "./approve-schema";

export const approveXvp = action
  .schema(ApproveXvpSchema)
  .outputSchema(t.Number())
  .action(approveXvpFunction);
