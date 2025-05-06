import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import { useTranslations } from "next-intl";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export function Basics() {
  const { control } = useFormContext<CreateBondInput>();
  const t = useTranslations("private.assets.create");
  const posthog = usePostHog();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture("create_bond_form_basics_step_opened");
    }
  }, [posthog]);

  return (
    <div className="space-y-6">
      <FormStep
        title={t("basics.title")}
        description={t("basics.description")}
        className="w-full"
        contentClassName="w-full"
      >
        <div className="grid grid-cols-1 gap-6 w-full">
          <FormInput
            control={control}
            name="assetName"
            label={t("parameters.common.name-label")}
            placeholder={t("parameters.bonds.name-placeholder")}
            description="The name of the bond. This is used to identify the bond in the UI and cannot be changed after creation."
            required
            maxLength={50}
          />
          <div className="grid grid-cols-2 gap-6">
            <FormInput
              control={control}
              name="symbol"
              label={t("parameters.common.symbol-label")}
              placeholder={t("parameters.bonds.symbol-placeholder")}
              description="The symbol of the bond. This a unique identifier for the bond for onchain purposes. It can be up to 10 characters long and cannot be changed after creation."
              alphanumeric
              required
              maxLength={10}
            />
            <FormInput
              control={control}
              type="number"
              name="decimals"
              label={t("parameters.common.decimals-label")}
              defaultValue={18}
              description="The number of decimals to use for the bond. This is used to determine the precision of the bond. Blockchain based tokens typically use 18 decimals, but in any case use enough decimals to prevent rounding errors. The number of decimals cannot be changed after creation."
              required
            />
          </div>
        </div>
      </FormStep>
      <FormStep
        title={t("basics.title-offchain")}
        description={t("basics.description-offchain")}
        className="w-full"
        contentClassName="w-full"
      >
        <div className="grid grid-cols-1 gap-6 w-full">
          <div className="grid grid-cols-2 gap-6">
            <FormInput
              control={control}
              name="isin"
              label={t("parameters.common.isin-label")}
              placeholder={t("parameters.bonds.isin-placeholder")}
              description="The ISIN of the bond. This is an optional unique identifier for the bond in the financial system."
              maxLength={12}
            />
            <FormInput
              control={control}
              name="internalid"
              label={t("parameters.common.internalid-label")}
              description="The internal ID of the bond. This is an optional unique identifier for the bond in your internal system."
              maxLength={12}
            />
          </div>
        </div>
      </FormStep>
    </div>
  );
}

Basics.validatedFields = [
  "assetName",
  "symbol",
  "decimals",
  "isin",
] satisfies (keyof CreateBondInput)[];
