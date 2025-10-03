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

export const StatsRangePresetSchema = z.enum([
  "trailing24Hours",
  "trailing7Days",
]);

export const StatsRangeInputSchema = StatsRangeObjectSchema.or(
  StatsRangePresetSchema
);

export type StatsRangeInterval = z.infer<typeof StatsIntervalSchema>;
export type StatsRangePreset = z.infer<typeof StatsRangePresetSchema>;
export type StatsRangeObject = z.infer<typeof StatsRangeObjectSchema>;
export type StatsRangeInput = z.infer<typeof StatsRangeInputSchema>;

const PRESET_CONFIG: Record<
  StatsRangePreset,
  {
    interval: StatsRangeInterval;
    resolveFrom: (to: Date) => Date;
  }
> = {
  trailing24Hours: {
    interval: "hour",
    resolveFrom: (to: Date) => subHours(to, 24),
  },
  trailing7Days: {
    interval: "day",
    resolveFrom: (to: Date) => subDays(to, 7),
  },
};

export const StatsResolvedRangeSchema = z.object({
  interval: StatsIntervalSchema,
  from: timestamp(),
  to: timestamp(),
  isPreset: z.boolean(),
});

export type StatsResolvedRange = z.infer<typeof StatsResolvedRangeSchema>;

export interface ResolveStatsRangeOptions {
  now?: Date;
  minFrom?: Date;
}

export function isStatsRangePreset(
  input: StatsRangeInput
): input is StatsRangePreset {
  return typeof input === "string";
}

export function resolveStatsRange(
  input: StatsRangeInput,
  options: ResolveStatsRangeOptions = {}
): StatsResolvedRange {
  const now = options.now ?? new Date();

  if (isStatsRangePreset(input)) {
    const parsed = StatsRangePresetSchema.parse(input);
    const { interval, resolveFrom } = PRESET_CONFIG[parsed];
    const minFrom = options.minFrom ?? resolveFrom(now);
    const to = now;
    let from = resolveFrom(to);

    if (isBefore(from, minFrom)) {
      from = minFrom;
    }

    if (isAfter(from, to)) {
      from = to;
    }

    return StatsResolvedRangeSchema.parse({
      interval,
      from,
      to,
      isPreset: true,
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
    isPreset: false,
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
