import {
  SelectField,
  type SelectFieldProps,
} from "@/components/form/select-field";
import { timeIntervals } from "@atk/zod/time-interval";
import { useTranslation } from "react-i18next";

export function SelectTimeIntervalField({ label, ...props }: SelectFieldProps) {
  const { t } = useTranslation(["common"]);

  const options = timeIntervals.map((interval) => ({
    label: t(`common:timeInterval.${interval}`),
    value: interval,
  }));

  return <SelectField label={label} options={options} {...props} />;
}
