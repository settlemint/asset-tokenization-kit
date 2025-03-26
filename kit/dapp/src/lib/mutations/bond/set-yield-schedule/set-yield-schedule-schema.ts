import { type StaticDecode, t } from "@/lib/utils/typebox";
import { IntervalPeriod } from "@/lib/utils/yield";

export function SetYieldScheduleSchema() {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The bond contract address",
      }),
      startTime: t.String({
        description: "The start time of the yield schedule",
      }),
      endTime: t.String({
        description: "The end time of the yield schedule",
      }),
      rate: t.String({
        description: "The interest rate percentage (0-100)",
        minLength: 1,
        errorMessage: "Rate must be between 0 and 100",
      }),
      interval: t.Enum(IntervalPeriod, {
        description: "The interval period for yield payments",
      }),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
      }),
    },
    {
      description: "Schema for validating yield schedule inputs",
    }
  );
}

export type SetYieldScheduleInput = StaticDecode<
  ReturnType<typeof SetYieldScheduleSchema>
>;
