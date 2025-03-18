import { IntervalPeriod } from "@/lib/utils/yield";
import { z, type ZodInfer } from "@/lib/utils/zod";

export const SetYieldScheduleSchema = z.object({
  address: z.address(),
  startTime: z.string(),
  endTime: z.string(),
  rate: z.string().min(0, "Rate must be between 0 and 100")
    .max(100, "Rate must be between 0 and 100"),
  interval: z.nativeEnum(IntervalPeriod),
  pincode: z.pincode(),
});

export type SetYieldScheduleInput = ZodInfer<typeof SetYieldScheduleSchema>;