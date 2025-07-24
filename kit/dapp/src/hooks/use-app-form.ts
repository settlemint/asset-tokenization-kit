import { BigIntField } from "@/components/form/bigint-field";
import { CheckboxField } from "@/components/form/checkbox-field";
import { CountrySelectField } from "@/components/form/country-select-field";
import { DateTimeField } from "@/components/form/datetime-field";
import { Errors } from "@/components/form/errors";
import { StepSubmitButton } from "@/components/form/multi-step/step-submit-button";
import { NumberField } from "@/components/form/number-field";
import { RadioField } from "@/components/form/radio-field";
import { SelectField } from "@/components/form/select-field";
import { SubmitButton } from "@/components/form/submit-button";
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
    CountrySelectField,
  },
  formComponents: {
    StepSubmitButton,
    SubmitButton,
    Errors,
  },
  fieldContext,
  formContext,
});
