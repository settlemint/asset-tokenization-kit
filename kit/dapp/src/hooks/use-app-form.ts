import { BigIntField } from "@/components/form/bigint-field";
import { CheckboxField } from "@/components/form/checkbox-field";
import { DateTimeField } from "@/components/form/datetime-field";
import { StepSubmitButton } from "@/components/form/multi-step/step-submit-button";
import { NumberField } from "@/components/form/number-field";
import { RadioField } from "@/components/form/radio-field";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { TextAreaField } from "@/components/form/textarea-field";
import { fieldContext, formContext } from "@/hooks/use-form-contexts";
import { createFormHook } from "@tanstack/react-form";

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    CheckboxField,
    DateTimeField,
    NumberField,
    RadioField,
    SelectField,
    TextAreaField,
    TextField,
    BigIntField,
  },
  formComponents: {
    StepSubmitButton,
  },
  fieldContext,
  formContext,
});
