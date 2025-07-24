import {
  assetDesignerFormOptions,
  isRequiredField,
} from "@/components/asset-designer/shared-form";
import {
  FormStep,
  FormStepContent,
  FormStepSubmit,
} from "@/components/form/multi-step/form-step";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";

const summaryFields: never[] = [];

export const Summary = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit: noop,
  },
  render: function Render({ form, onStepSubmit }) {
    return (
      <FormStep>
        <FormStepContent>
          <div>{JSON.stringify(form.state.values)}</div>
        </FormStepContent>

        <FormStepSubmit>
          <form.StepSubmitButton
            label="Next"
            onStepSubmit={onStepSubmit}
            validate={summaryFields}
            checkRequiredFn={isRequiredField}
          />
        </FormStepSubmit>
      </FormStep>
    );
  },
});
