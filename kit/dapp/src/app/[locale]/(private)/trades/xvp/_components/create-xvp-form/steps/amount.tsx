import { FormStep } from "@/components/blocks/form/form-step";
import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { authClient } from "@/lib/auth/client";
import type { CreateXvpInput } from "@/lib/mutations/xvp/create/create-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import { getAddress } from "viem";

export function Amount() {
  const t = useTranslations("trade-management.forms.amounts");
  const locale = useLocale();
  const { control } = useFormContext<CreateXvpInput>();
  const offerAsset = useWatch({ control, name: "offerAsset" });
  const loggedInUserWallet = authClient.useSession().data.user.wallet;
  const maxAmountToSend = offerAsset?.holders.find(
    (holder) => getAddress(holder.account.id) === getAddress(loggedInUserWallet)
  )?.value;
  const requestAsset = useWatch({ control, name: "requestAsset" });
  const user = useWatch({ control, name: "user" });

  return (
    <FormStep
      title={t("title")}
      description={t("description")}
      contentClassName="space-y-6"
    >
      <FormAssets
        control={control}
        name="offerAsset"
        label={t("asset-to-offer")}
        placeholder={t("asset-to-offer")}
        required
        userWallet={loggedInUserWallet}
      />
      <FormInput
        control={control}
        name="offerAmount"
        label={t("amount-to-offer")}
        placeholder={t("amount-to-offer")}
        required
        type="number"
        step={offerAsset?.decimals ? 10 ** -offerAsset.decimals : 1}
        postfix={offerAsset?.symbol}
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
        name="requestAsset"
        label={t("asset-to-request")}
        placeholder={t("asset-to-request")}
        required
        userWallet={user}
      />
      <FormInput
        control={control}
        name="requestAmount"
        label={t("amount-to-request")}
        placeholder={t("amount-to-request")}
        required
        type="number"
        step={requestAsset?.decimals ? 10 ** -requestAsset.decimals : 1}
        postfix={requestAsset?.symbol}
      />
    </FormStep>
  );
}

Amount.validatedFields = [
  "offerAsset",
  "offerAmount",
  "requestAsset",
  "requestAmount",
] as (keyof CreateXvpInput)[];
