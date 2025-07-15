import { CheckboxField } from "@/components/form/checkbox-field";
import { DateTimeField } from "@/components/form/datetime-field";
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
    RadioField,
    SelectField,
    TextAreaField,
    TextField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});
