import {
  assetDesignerFormOptions,
  AssetDesignerFormSchema,
} from "@/components/asset-designer/shared-form";
import {
  FormStep,
  FormStepContent,
  FormStepSubmit,
} from "@/components/form/multi-step/form-step";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";

export const Summary = withForm({
  ...assetDesignerFormOptions,
  props: {
    onSubmit: noop,
  },
  render: function Render({ form, onSubmit }) {
    const parsedValues = AssetDesignerFormSchema.safeParse(form.state.values);

    return (
      <FormStep>
        <FormStepContent>
          <div>{JSON.stringify(parsedValues)}</div>

          <form.Errors />
        </FormStepContent>

        <FormStepSubmit>
          <form.SubmitButton label="Submit" onSubmit={onSubmit} />
        </FormStepSubmit>
      </FormStep>
    );
  },
});
