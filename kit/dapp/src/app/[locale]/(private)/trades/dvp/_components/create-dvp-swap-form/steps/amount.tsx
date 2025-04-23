import { FormStep } from "@/components/blocks/form/form-step";
import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateDvpSwapInput } from "@/lib/mutations/dvp/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Amount() {
  const t = useTranslations("trade-management.forms.amounts");
  const { watch, control, setValue } = useFormContext<CreateDvpSwapInput>();
  const assetToSend = watch("assetToSend");
  const assetToReceive = watch("assetToReceive");

  return (
    <FormStep
      title={t("title")}
      description={t("description")}
      contentClassName="space-y-6"
    >
      <FormAssets
        control={control}
        name="assetToSend"
        label={t("asset-to-send")}
        placeholder={t("asset-to-send")}
        required
        onSelect={() => setValue("amountToSend", 0)}
      />
      <FormInput
        control={control}
        name="amountToSend"
        label={t("amount-to-send")}
        placeholder={t("amount-to-send")}
        required
        type="number"
        step={assetToSend?.decimals ? 10 ** -assetToSend.decimals : 1}
        postfix={assetToSend?.symbol}
      />
      <FormAssets
        control={control}
        name="assetToReceive"
        label={t("asset-to-receive")}
        placeholder={t("asset-to-receive")}
        required
      />
      <FormInput
        control={control}
        name="amountToReceive"
        label={t("amount-to-receive")}
        placeholder={t("amount-to-receive")}
        required
        type="number"
        step={assetToReceive?.decimals ? 10 ** -assetToReceive.decimals : 1}
        postfix={assetToReceive?.symbol}
      />
    </FormStep>
  );
}

Amount.validatedFields = [
  "assetToSend",
  "amountToSend",
] as (keyof CreateDvpSwapInput)[];
