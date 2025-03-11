import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormOtp } from "@/components/blocks/form/inputs/form-otp";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { FormSummarySecurityConfirmation } from "@/components/blocks/form/summary/security-confirmation";
import type { MatureFormInput } from "@/lib/mutations/bond/mature/mature-schema";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const { control } = useFormContext<MatureFormInput>();
  const t = useTranslations("admin.bonds.mature-form.summary");

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormSummaryDetailCard
        icon={<Clock className="size-3 text-primary-foreground" />}
        title={t("mature-title")}
        description={t("mature-description")}
      >
        <FormSummaryDetailItem
          label={t("asset-label")}
          value={<EvmAddress address={address} />}
        />
      </FormSummaryDetailCard>

      <FormSummarySecurityConfirmation>
        <FormOtp control={control} name="pincode" />
      </FormSummarySecurityConfirmation>
    </FormStep>
  );
}

Summary.validatedFields = ["pincode"] as const;