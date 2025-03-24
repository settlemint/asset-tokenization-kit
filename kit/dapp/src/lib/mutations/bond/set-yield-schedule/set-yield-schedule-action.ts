"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { setYieldScheduleFunction } from "./set-yield-schedule-function";
import { SetYieldScheduleSchema } from "./set-yield-schedule-schema";

export const setYieldSchedule = action
  .schema(SetYieldScheduleSchema())
  .outputSchema(t.Hashes())
  .action(setYieldScheduleFunction);
