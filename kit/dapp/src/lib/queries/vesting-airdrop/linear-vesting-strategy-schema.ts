import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * Schema for vesting data associated with linear vesting strategy
 */
export const VestingDataSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The vesting data contract address",
    }),
  },
  {
    description: "Vesting data associated with the strategy",
  }
);

/**
 * Schema for linear vesting strategy data
 *
 * @remarks
 * Provides validation for linear vesting strategy configuration including
 * contract address, cliff and vesting durations, and associated vesting data
 */
export const LinearVestingStrategySchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the linear vesting strategy",
    }),
    cliffDuration: t.StringifiedBigInt({
      description: "Duration of the cliff period in seconds",
    }),
    vestingDuration: t.StringifiedBigInt({
      description: "Total duration of the vesting period in seconds",
    }),
    vestingData: t.Array(VestingDataSchema, {
      description: "The vesting data for the linear vesting strategy",
    }),
  },
  {
    description: "Linear vesting strategy configuration",
  }
);

/**
 * TypeScript type for LinearVestingStrategy
 */
export type LinearVestingStrategy = StaticDecode<
  typeof LinearVestingStrategySchema
>;
