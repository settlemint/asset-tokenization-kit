import { useWizardContext } from "@/components/multistep-form/wizard-context";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeftRight, MoreHorizontal, TrendingUp, Zap } from "lucide-react";
import { memo, useCallback } from "react";
import { toast } from "sonner";

/**
 * Addon type definitions with descriptions
 */
const addonDefinitions = [
  {
    id: "airdrops",
    label: "Airdrops",
    description: "Distribute tokens to users automatically",
    icon: Zap,
    isRequired: undefined,
  },
  {
    id: "yield",
    label: "Fixed Yield",
    description: "Handle interest payouts on bonds and similar assets.",
    icon: TrendingUp,
    isRequired: (selectedAssetTypes: string[]) =>
      selectedAssetTypes.includes("bond"),
  },
  {
    id: "xvp",
    label: "XVP",
    description: "Enable exchange and value pool features",
    icon: ArrowLeftRight,
    isRequired: undefined,
  },
] as const;

/**
 * Wrapper component for checkbox elements to prevent event propagation.
 */
const CheckboxWrapper = memo(
  ({
    onClick,
    children,
  }: {
    onClick: (e: React.MouseEvent) => void;
    children: React.ReactNode;
  }) => <div onClick={onClick}>{children}</div>
);
CheckboxWrapper.displayName = "CheckboxWrapper";

/**
 * Individual addon checkbox component
 */
const AddonCheckbox = memo(
  ({
    addon,
    isSelected,
    isRequired,
    onToggle,
  }: {
    addon: (typeof addonDefinitions)[number];
    isSelected: boolean;
    isRequired: boolean;
    onToggle: (addonId: string) => void;
  }) => {
    const Icon = addon.icon;

    const handleItemClick = useCallback(() => {
      onToggle(addon.id);
    }, [addon.id, onToggle]);

    const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
    }, []);

    const handleCheckboxChange = useCallback(
      (checked: boolean) => {
        if (checked) {
          onToggle(addon.id);
        } else if (!isRequired) {
          onToggle(addon.id);
        }
      },
      [addon.id, onToggle, isRequired]
    );

    return (
      <div
        key={addon.id}
        className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={handleItemClick}
      >
        <CheckboxWrapper onClick={handleCheckboxClick}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            disabled={isRequired}
          />
        </CheckboxWrapper>
        <div className="flex-1 space-y-1 leading-none">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium cursor-pointer">
              {addon.label}
              {isRequired && <span className="text-amber-600 ml-1">*</span>}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{addon.description}</p>
        </div>
      </div>
    );
  }
);
AddonCheckbox.displayName = "AddonCheckbox";

/**
 * Platform Addons Selection Component
 */
export function PlatformAddonsComponent({
  form,
  onNext,
  onPrevious,
  isFirstStep,
}: {
  form: {
    state: {
      values: {
        selectedAddons?: string[];
        selectedAssetTypes?: string[];
      };
    };
    Field: (props: {
      name: string;
      children: (field: {
        state: { value?: string[]; meta: { errors?: string[] } };
        handleChange: (value: string[]) => void;
      }) => React.ReactNode;
    }) => React.ReactNode;
  };
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
}) {
  const { clearStepError, markStepComplete } = useWizardContext();

  const selectedAssetTypes = form.state.values.selectedAssetTypes ?? [];
  const selectedAddons = form.state.values.selectedAddons ?? [];

  // Check if any addon is required based on selected asset types
  const hasRequiredAddons = addonDefinitions.some(
    (addon) => addon.isRequired && addon.isRequired(selectedAssetTypes)
  );

  // Get required addons
  const requiredAddons = addonDefinitions.filter(
    (addon) => addon.isRequired && addon.isRequired(selectedAssetTypes)
  );

  const handleConfirm = useCallback(() => {
    try {
      clearStepError("enable-platform-addons");

      // Check if all required addons are selected
      const missingRequired = requiredAddons.filter(
        (addon) => !selectedAddons.includes(addon.id)
      );

      if (missingRequired.length > 0) {
        toast.error(
          `Required add-ons must be selected: ${missingRequired.map((a) => a.label).join(", ")}`
        );
        return;
      }

      markStepComplete("enable-platform-addons");
      toast.success("Platform add-ons configured successfully");
      onNext?.();
    } catch {
      toast.error("Failed to configure platform add-ons");
    }
  }, [
    clearStepError,
    markStepComplete,
    onNext,
    requiredAddons,
    selectedAddons,
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Configure Platform Add-ons
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enhance your platform with optional features.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <p className="text-sm">
          Platform add-ons allow you to extend the capabilities of your
          tokenization platform. These features — like Airdrops, Yield, or XVP —
          are deployed as smart contracts, just like the core system.
        </p>
        <p className="text-sm">
          You can enable the ones you need now, and{" "}
          <strong>easily change or expand them later in Settings</strong>.
        </p>
      </div>

      <div className="mb-4">
        <h3 className="text-base font-medium text-foreground">
          Select add-ons:
        </h3>
      </div>

      <form.Field name="selectedAddons">
        {(field: {
          state: { value?: string[]; meta: { errors?: string[] } };
          handleChange: (value: string[]) => void;
        }) => {
          const handleAddonToggle = useCallback(
            (addonId: string) => {
              const currentValue = field.state.value ?? [];
              const isSelected = currentValue.includes(addonId);

              if (isSelected) {
                // Check if this is a required addon
                const addon = addonDefinitions.find((a) => a.id === addonId);
                if (addon?.isRequired && addon.isRequired(selectedAssetTypes)) {
                  toast.warning(
                    `${addon.label} is required because you selected Bond assets`
                  );
                  return;
                }
                // Remove from selection
                field.handleChange(currentValue.filter((id) => id !== addonId));
              } else {
                // Add to selection
                field.handleChange([...currentValue, addonId]);
              }
            },
            [field, selectedAssetTypes]
          );

          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {addonDefinitions.map((addon) => {
                  const isRequired = addon.isRequired
                    ? addon.isRequired(selectedAssetTypes)
                    : false;
                  const isSelected = (field.state.value ?? []).includes(
                    addon.id
                  );

                  return (
                    <AddonCheckbox
                      key={addon.id}
                      addon={addon}
                      isSelected={isSelected}
                      isRequired={isRequired}
                      onToggle={handleAddonToggle}
                    />
                  );
                })}

                {/* More coming soon placeholder */}
                <div className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-dashed p-4 opacity-60">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1 leading-none">
                    <span className="text-sm font-medium text-muted-foreground italic">
                      More coming soon...
                    </span>
                  </div>
                </div>
              </div>

              {field.state.meta.errors &&
                field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive mt-2">
                    {field.state.meta.errors[0]}
                  </p>
                )}
            </div>
          );
        }}
      </form.Field>

      {/* Legend and warnings */}
      <div className="space-y-4">
        {hasRequiredAddons && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Below the table show a legend:
            </p>
            <p className="text-sm text-muted-foreground">
              (*) Required because Bond asset type is selected
            </p>
          </div>
        )}

        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            This process may take up to 2–3 minutes depending on your
            selections.
          </p>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            You'll be asked to confirm each transaction using your PIN or OTP.
          </p>
        </div>
      </div>

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
          Deploy Add-ons
        </button>
      </div>
    </div>
  );
}
