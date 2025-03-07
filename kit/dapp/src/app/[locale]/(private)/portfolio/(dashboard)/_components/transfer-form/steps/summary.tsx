import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormOtp } from "@/components/blocks/form/inputs/form-otp";
import { FormSummarySecurityConfirmation } from "@/components/blocks/form/summary/security-confirmation";
import type {
  TransferFormAssetType,
  TransferFormType,
} from "@/lib/mutations/asset/transfer/transfer-schema";
import { DollarSign, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import type { Address } from "viem";

export function Summary({
  address,
  assetType,
  decimals,
}: {
  address: Address;
  assetType: TransferFormAssetType;
  decimals: number;
}) {
  const { control } = useFormContext<TransferFormType>();
  const t = useTranslations("portfolio.transfer-form.summary");
  const values = useWatch({
    control: control,
  });

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
            <DollarSign className="h-3 w-3 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Asset Basics</h3>
            <p className="text-muted-foreground text-xs">
              Basic asset information and settings.
            </p>
          </div>
        </div>
        <dl className="space-y-2 [&>div:last-child]:border-0 [&>div]:border-b">
          <div className="flex justify-between py-1.5">
            <dt className="text-muted-foreground text-sm">Asset type</dt>
            <dd className="font-medium text-sm">{assetType}</dd>
          </div>
          <div className="flex justify-between py-1.5">
            <dt className="text-muted-foreground text-sm">Address</dt>
            <dd className="font-medium text-sm">{address}</dd>
          </div>
          <div className="flex justify-between py-1.5">
            <dt className="text-muted-foreground text-sm">Amount</dt>
            <dd className="font-medium text-sm">{values.value}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-3 w-3 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Security Confirmation</h3>
            <p className="text-muted-foreground text-xs">
              Enter your pin code to confirm and sign the transaction.
            </p>
          </div>
        </div>

        <FormInput
          control={control}
          name="address"
          type="hidden"
          defaultValue={address}
        />
        <FormInput
          control={control}
          name="assetType"
          type="hidden"
          defaultValue={assetType}
        />
        <FormInput
          control={control}
          name="decimals"
          type="hidden"
          defaultValue={decimals}
        />

        <FormSummarySecurityConfirmation>
          <FormOtp control={control} name="pincode" />
        </FormSummarySecurityConfirmation>
      </div>
    </FormStep>
  );
}

Summary.validatedFields = ["pincode"] as const;
