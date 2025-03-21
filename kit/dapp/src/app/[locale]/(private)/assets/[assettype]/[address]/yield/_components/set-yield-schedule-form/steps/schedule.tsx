"use client";

import { FormNumberInput } from "@/components/blocks/form/inputs";
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
        required
      />
      <FormInput
        name="endTime"
        type="datetime-local"
        label={t("end-time.label")}
        required
      />
      <FormNumberInput
        name="rate"
        label={t("rate.label")}
        decimals={2}
        max="100"
        description={t("rate.description")}
        required
      />
      <FormSelect
        name="interval"
        label={t("interval.label")}
        options={intervalOptions}
        description={t("interval.description")}
        className="w-full"
        required
      />
    </div>
  );
}
