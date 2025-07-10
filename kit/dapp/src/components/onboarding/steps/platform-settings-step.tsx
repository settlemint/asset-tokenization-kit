import { useSettings } from "@/hooks/use-settings";
import { useWizardContext } from "@/components/multistep-form/wizard-context";
import { fiatCurrencyMetadata } from "@/lib/zod/validators/fiat-currency";
import React, { useCallback } from "react";
import { toast } from "sonner";

// Currency Field Component
function CurrencyField({
  field,
}: {
  field: {
    state: { value?: string; meta: { errors?: string[] } };
    handleChange: (value: string) => void;
  };
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      field.handleChange(e.target.value);
    },
    [field]
  );

  return (
    <div className="space-y-2">
      <label htmlFor="baseCurrency" className="text-sm font-medium">
        Base Currency
      </label>
      <p className="text-sm text-muted-foreground">
        Choose the default currency for your platform
      </p>
      <select
        id="baseCurrency"
        value={field.state.value ?? "USD"}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Object.entries(fiatCurrencyMetadata).map(([code, metadata]) => (
          <option key={code} value={code}>
            {metadata.name} ({code})
          </option>
        ))}
      </select>
      {field.state.meta.errors && field.state.meta.errors.length > 0 && (
        <p className="text-sm text-destructive mt-2">
          {field.state.meta.errors[0]}
        </p>
      )}
    </div>
  );
}

// Platform Settings Component
export function PlatformSettingsComponent({
  form,
  onNext,
  onPrevious,
  isFirstStep,
}: {
  form: {
    state: {
      values: {
        baseCurrency?: string;
      };
    };
    Field: (props: {
      name: string;
      children: (field: {
        state: { value?: string; meta: { errors?: string[] } };
        handleChange: (value: string) => void;
      }) => React.ReactNode;
    }) => React.ReactNode;
  };
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
}) {
  const [, setBaseCurrency] = useSettings("BASE_CURRENCY");
  const { clearStepError, markStepComplete } = useWizardContext();

  const handleConfirm = useCallback(() => {
    try {
      clearStepError("configure-platform-settings");
      const formValues = form.state.values;
      if (formValues.baseCurrency) {
        setBaseCurrency(formValues.baseCurrency);
        markStepComplete("configure-platform-settings");
        toast.success("Platform settings saved successfully");
      }
      onNext?.();
    } catch {
      toast.error("Failed to save platform settings");
    }
  }, [
    form.state.values,
    setBaseCurrency,
    clearStepError,
    markStepComplete,
    onNext,
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Configure Platform Settings
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Define how your platform behaves by default
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <p className="text-sm">
          Before you begin issuing assets, let's configure some basic settings
          that determine how the platform behaves. These default values help
          personalize the experience for you and your users.
        </p>
        <p className="text-sm">
          You can update these preferences later in the platform settings.
        </p>
      </div>

      <form.Field name="baseCurrency">
        {(field: {
          state: { value?: string; meta: { errors?: string[] } };
          handleChange: (value: string) => void;
        }) => <CurrencyField field={field} />}
      </form.Field>

      <div className="flex justify-end gap-3 pt-6">
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
          >
            Previous
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}
