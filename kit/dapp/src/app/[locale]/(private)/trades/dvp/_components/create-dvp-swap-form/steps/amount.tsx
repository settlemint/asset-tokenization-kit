import { FormStep } from "@/components/blocks/form/form-step";
import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateDvpSwapInput } from "@/lib/mutations/dvp/create/create-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { getAddress } from "viem";

export function Amount() {
  const t = useTranslations("trade-management.forms.amounts");
  const locale = useLocale();
  const { watch, control } = useFormContext<CreateDvpSwapInput>();
  const assetToSend = watch("assetToSend");
  const assetToReceive = watch("assetToReceive");
  const sender = watch("sender");
  const receiver = watch("receiver");
  const maxAmountToSend = assetToSend?.holders.find(
    (holder) => getAddress(holder.account.id) === getAddress(sender)
  )?.value;

  const maxAmountToReceive = assetToReceive?.holders.find(
    (holder) => getAddress(holder.account.id) === getAddress(receiver)
  )?.value;

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
        userWallet={sender}
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
        max={
          !isNaN(Number(maxAmountToSend)) ? Number(maxAmountToSend) : undefined
        }
        description={
          !isNaN(Number(maxAmountToSend))
            ? t("max-amount-to-send", {
                maxAmount: formatNumber(Number(maxAmountToSend), { locale }),
              })
            : undefined
        }
      />
      <FormAssets
        control={control}
        name="assetToReceive"
        label={t("asset-to-receive")}
        placeholder={t("asset-to-receive")}
        required
        userWallet={receiver}
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
        max={
          !isNaN(Number(maxAmountToReceive))
            ? Number(maxAmountToReceive)
            : undefined
        }
        description={
          !isNaN(Number(maxAmountToReceive))
            ? t("max-amount-to-receive", {
                maxAmount: formatNumber(Number(maxAmountToReceive), { locale }),
              })
            : undefined
        }
      />
    </FormStep>
  );
}

Amount.validatedFields = [
  "assetToSend",
  "amountToSend",
  "assetToReceive",
  "amountToReceive",
] as (keyof CreateDvpSwapInput)[];
