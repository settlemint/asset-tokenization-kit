import { isAfter, isBefore, subDays, subHours } from "date-fns";
import { z } from "zod";
import { getUnixTimeMicroseconds, timestamp } from "./timestamp";

export const StatsIntervalSchema = z.enum(["hour", "day"]);

const StatsRangeObjectSchema = z
  .object({
    interval: StatsIntervalSchema,
    from: timestamp(),
    to: timestamp(),
  })
  .superRefine((value, ctx) => {
    if (isAfter(value.from, value.to)) {
      ctx.addIssue({
        code: "custom",
        message: "`from` must be before or equal to `to`",
        path: ["from"],
      });
    }
  });

const Trailing24HoursPresetSchema = z.object({
  preset: z.literal("trailing24Hours"),
  interval: z.literal("hour"),
});

const Trailing7DaysPresetSchema = z.object({
  preset: z.literal("trailing7Days"),
  interval: z.literal("day"),
});

export const StatsRangePresetSchema = z.union([
  Trailing24HoursPresetSchema,
  Trailing7DaysPresetSchema,
]);

export const StatsRangeInputSchema = StatsRangeObjectSchema.or(
  StatsRangePresetSchema
);

export type StatsRangeInterval = z.infer<typeof StatsIntervalSchema>;
export type StatsRangePreset = z.infer<typeof StatsRangePresetSchema>;
export type StatsRangePresetName = StatsRangePreset["preset"];
export type StatsRangeObject = z.infer<typeof StatsRangeObjectSchema>;
export type StatsRangeInput = z.infer<typeof StatsRangeInputSchema>;

export const StatsResolvedRangeSchema = z.object({
  interval: StatsIntervalSchema,
  from: timestamp(),
  to: timestamp(),
});

export type StatsResolvedRange = z.infer<typeof StatsResolvedRangeSchema>;

export interface ResolveStatsRangeOptions {
  now?: Date;
  minFrom?: Date;
}

const PRESET_RESOLVERS: Record<StatsRangePresetName, (to: Date) => Date> = {
  trailing24Hours: (to: Date) => subHours(to, 24),
  trailing7Days: (to: Date) => subDays(to, 7),
};

export function isStatsRangePreset(
  input: StatsRangeInput
): input is StatsRangePreset {
  return typeof input === "object" && input !== null && "preset" in input;
}

export function resolveStatsRange(
  input: StatsRangeInput,
  options: ResolveStatsRangeOptions = {}
): StatsResolvedRange {
  const now = options.now ?? new Date();

  if (isStatsRangePreset(input)) {
    const parsed = StatsRangePresetSchema.parse(input);
    const minFrom = options.minFrom ?? subHours(now, 48);
    // TODO: Replace minFrom with system.createdAt when available in context
    const to = now;
    let from = PRESET_RESOLVERS[parsed.preset](to);

    if (isBefore(from, minFrom)) {
      from = minFrom;
    }

    if (isAfter(from, to)) {
      from = to;
    }

    return StatsResolvedRangeSchema.parse({
      interval: parsed.interval,
      from,
      to,
    });
  }

  const parsed = StatsRangeObjectSchema.parse(input);
  const minFrom = options.minFrom ?? parsed.from;

  let to = parsed.to;
  if (isAfter(to, now)) {
    to = now;
  }

  let from = parsed.from;
  if (isBefore(from, minFrom)) {
    from = minFrom;
  }

  if (isAfter(from, to)) {
    from = to;
  }

  return StatsResolvedRangeSchema.parse({
    interval: parsed.interval,
    from,
    to,
  });
}

export function buildStatsRangeQuery(
  input: StatsRangeInput,
  options?: ResolveStatsRangeOptions
): {
  interval: StatsRangeInterval;
  fromMicroseconds: string;
  toMicroseconds: string;
  range: StatsResolvedRange;
} {
  const range = resolveStatsRange(input, options);

  return {
    interval: range.interval,
    fromMicroseconds: getUnixTimeMicroseconds(range.from),
    toMicroseconds: getUnixTimeMicroseconds(range.to),
    range,
  };
}
