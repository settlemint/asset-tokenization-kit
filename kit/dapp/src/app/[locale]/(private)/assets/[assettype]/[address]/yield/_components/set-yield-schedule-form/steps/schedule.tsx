"use client";

import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import { IntervalPeriod, getIntervalLabel } from "@/lib/utils/yield";
import { useTranslations } from "next-intl";

export function Schedule() {
  const t = useTranslations("admin.bonds.yield.set-schedule");

  const intervalOptions = Object.values(IntervalPeriod).map((value) => ({
    value,
    label: getIntervalLabel(value, (key) => t(key)),
  }));

  return (
    <div className="space-y-4">
      <FormInput
        name="startTime"
        type="datetime-local"
        label={t("start-time.label")}
      />
      <FormInput
        name="endTime"
        type="datetime-local"
        label={t("end-time.label")}
      />
      <FormInput
        name="rate"
        type="number"
        label={t("rate.label")}
        step="0.01"
        min="0"
        max="100"
        description={t("rate.description")}
      />
      <FormSelect
        name="interval"
        label={t("interval.label")}
        options={intervalOptions}
        description={t("interval.description")}
        className="w-full"
      />
    </div>
  );
}