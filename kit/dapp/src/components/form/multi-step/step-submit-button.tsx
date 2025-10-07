import { Button } from "@/components/ui/button";
import { useFormContext } from "@/hooks/use-form-contexts";
import type { AnyFormApi } from "@tanstack/react-form";

export function StepSubmitButton<T extends readonly string[]>({
  label,
  onStepSubmit,
  validate,
  checkRequiredFn = () => false,
  revalidateOn = "valueChange",
}: {
  label: string;
  onStepSubmit: () => void;
  validate: T;
  checkRequiredFn?: (field: T[number]) => boolean;
  /**
   * Controls when the button re-evaluates disabled state.
   * - "valueChange" (default): re-render only on value changes
   * - "stateChange": re-render on any form state change (e.g. blur/touched/meta)
   */
  revalidateOn?: "valueChange" | "stateChange";
}) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) =>
        revalidateOn === "stateChange" ? state : state.values
      }
    >
      {() => {
        const disabled = isStepSubmitDisabled(validate, form, checkRequiredFn);
        return (
          <div>
            <Button
              onClick={onStepSubmit}
              disabled={disabled}
              className="press-effect"
            >
              {label}
            </Button>
          </div>
        );
      }}
    </form.Subscribe>
  );
}

export function isStepSubmitDisabled<T extends readonly string[]>(
  fields: T,
  form: AnyFormApi,
  isRequiredField: (field: T[number]) => boolean
) {
  return fields.some((field) => {
    const meta = form.getFieldMeta(field);
    if (meta === undefined) {
      return true;
    }
    const errors = meta.errors;
    const isPristine = meta.isPristine;
    const isRequired = isRequiredField(field);
    const requiredFieldPristine = isRequired && isPristine;
    return errors.length > 0 || requiredFieldPristine;
  });
}
