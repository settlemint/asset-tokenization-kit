// src/components.tsx

import type { Value } from "expry";
import type { Components, DefaultValues, OnBack, OnNext, Resolver, Step } from "formity";
import { Fragment } from "react";

import Form from "./form";
import YesNo from "./form-field-checkbox-list";
import NumberField from "./form-field-number";
import TextField from "./form-field-text";
import FormLayout from "./form-layout";
import Back from "./form-navigation-back";
import Next from "./form-navigation-next";

type Parameters = {
  form: {
    step: Step;
    defaultValues: DefaultValues;
    resolver: Resolver;
    onNext: OnNext;
    children: Value;
  };
  formLayout: {
    heading: string;
    description: string;
    fields: Value[];
    button: Value;
    back?: Value;
  };
  next: {
    text: string;
  };
  back: {
    onBack: OnBack;
  };
  textField: {
    name: string;
    label: string;
    cy: string;
  };
  numberField: {
    name: string;
    label: string;
    cy: string;
  };
  yesNo: {
    name: string;
    label: string;
  };
};

const components: Components<Parameters> = {
  form: ({ step, defaultValues, resolver, onNext, children }, render) => (
    <Form step={step} defaultValues={defaultValues} resolver={resolver} onNext={onNext}>
      {render(children)}
    </Form>
  ),
  formLayout: ({ heading, description, fields, button, back }, render) => (
    <FormLayout
      heading={heading}
      description={description}
      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
      fields={fields.map((field, index) => <Fragment key={index}>{render(field)}</Fragment>)}
      button={render(button)}
      back={back ? render(back) : undefined}
    />
  ),
  next: ({ text }) => <Next>{text}</Next>,
  back: ({ onBack }) => <Back onBack={onBack} />,
  textField: ({ name, label, cy }) => <TextField name={name} label={label} cy={cy} />,
  numberField: ({ name, label, cy }) => <NumberField name={name} label={label} cy={cy} />,
  yesNo: ({ name, label }) => (
    <YesNo fieldControlName={name} fieldLabel={label} checkboxItems={{ yes: "Yes", no: "No" }} />
  ),
};

export default components;
