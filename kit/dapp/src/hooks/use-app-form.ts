import { AddressInputField } from "@/components/form/address-fields/address-input-field";
import { AddressSelectField } from "@/components/form/address-fields/address-select-field";
import { AssetCategorySelectField } from "@/components/form/asset-classification/asset-category-select-field";
import { AssetClassSelectField } from "@/components/form/asset-classification/asset-class-select-field";
import { BigIntField } from "@/components/form/bigint-field";
import { CheckboxField } from "@/components/form/checkbox-field";
import { CountrySelectField } from "@/components/form/country-select-field";
import { DateTimeField } from "@/components/form/datetime-field";
import { DnumField } from "@/components/form/dnum-field";
import { Errors } from "@/components/form/errors";
import { StepSubmitButton } from "@/components/form/multi-step/step-submit-button";
import { NumberField } from "@/components/form/number-field";
import { RadioField } from "@/components/form/radio-field";
import { SelectField } from "@/components/form/select-field";
import { SelectTimeIntervalField } from "@/components/form/select-time-interval-field";
import { TextField } from "@/components/form/text-field";
import { TextAreaField } from "@/components/form/textarea-field";
import { VerificationButton } from "@/components/form/verification-button";
import { fieldContext, formContext } from "@/hooks/use-form-contexts";
import { createFormHook } from "@tanstack/react-form";

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    CheckboxField,
    DateTimeField,
    NumberField,
    RadioField,
    SelectField,
    SelectTimeIntervalField,
    TextAreaField,
    TextField,
    BigIntField,
    CountrySelectField,
    AddressInputField,
    AddressSelectField,
    DnumField,
    AssetClassSelectField,
    AssetCategorySelectField,
  },
  formComponents: {
    StepSubmitButton,
    VerificationButton,
    Errors,
  },
  fieldContext,
  formContext,
});
