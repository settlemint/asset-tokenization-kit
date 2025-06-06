"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { authClient } from "@/lib/auth/client";
import type { CreateAirdropInput } from "@/lib/mutations/airdrop/create/common/schema";
import { formatNumber } from "@/lib/utils/number";
import { HandHeart, Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps extends PropsWithChildren {
  predictAddress?: (values: any) => Promise<Address>;
  isAddressAvailable?: (address: Address) => Promise<boolean>;
}

export function Summary({
  children,
  predictAddress,
  isAddressAvailable,
}: SummaryProps) {
  const form = useFormContext<CreateAirdropInput>();
  const t = useTranslations("private.airdrops.create.summary");
  const locale = useLocale();
  const formValues = form.getValues();
  const { data: session } = authClient.useSession();

  // Fetch and validate predicted address on initial load
  useEffect(() => {
    // Skip validation if prediction functions aren't provided
    if (!predictAddress || !isAddressAvailable) {
      return;
    }

    // Validate predicted address
    // const validateAddress = async () => {
    //   try {
    //     const values = form.getValues();
    //     const predictedAddress = await predictAddress(values);
    //     const isAvailable = await isAddressAvailable(predictedAddress);

    //     if (!isAvailable) {
    //       form.setError("predictedAddress", {
    //         message: "private.airdrops.create.form.errors.duplicate-airdrop",
    //       });
    //       return;
    //     }

    //     // Set the predicted address in the form
    //     form.setValue("predictedAddress", predictedAddress);
    //     form.clearErrors("predictedAddress");
    //   } catch (error) {
    //     console.error("Error validating address:", error);
    //     form.setError("predictedAddress", {
    //       message:
    //         "private.airdrops.create.form.errors.address-prediction-failed",
    //     });
    //   }
    // };

    // validateAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StepContent className="max-w-3xl w-full mx-auto">
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {t("description")}
          </p>
        </div>

        {/* Basic Information Card */}
        <FormSummaryDetailCard
          title={t("basics.title")}
          description={t("basics.description")}
          icon={<Settings className="size-3 text-primary-foreground" />}
        >
          <FormSummaryDetailItem
            label={t("basics.asset-label")}
            value={
              formValues.asset ? (
                <EvmAddress
                  address={formValues.asset.id}
                  symbol={formValues.asset.symbol}
                />
              ) : undefined
            }
          />
          <FormSummaryDetailItem
            label={t("basics.owner-label")}
            value={
              <EvmAddress
                address={formValues.owner}
                name={
                  session?.user?.wallet === formValues.owner
                    ? session.user.name
                    : undefined
                }
                hoverCard={false}
              />
            }
          />
        </FormSummaryDetailCard>

        {children}

        {/* Distribution Configuration Card */}
        <FormSummaryDetailCard
          title={t("configuration.title")}
          description={t("configuration.description")}
          icon={<HandHeart className="size-3 text-primary-foreground" />}
        >
          <FormSummaryDetailItem
            label={t("configuration.distribution-recipients-label")}
            value={formValues.distribution?.length?.toString()}
          />
          <FormSummaryDetailItem
            label={t("configuration.total-distribution-amount-label")}
            value={
              formValues.distribution
                ? formatNumber(
                    formValues.distribution.reduce(
                      (sum, item) => sum + Number(item.amount),
                      0
                    ),
                    {
                      decimals: formValues.asset?.decimals,
                      token: formValues.asset?.symbol,
                      locale,
                    }
                  )
                : "-"
            }
          />
          {"distributionCap" in formValues && (
            <FormSummaryDetailItem
              label={t("configuration.distribution-limit-label")}
              value={
                formValues.distributionCap
                  ? formatNumber(formValues.distributionCap, {
                      decimals: formValues.asset?.decimals,
                      token: formValues.asset?.symbol,
                      locale,
                    })
                  : "-"
              }
            />
          )}
        </FormSummaryDetailCard>

        {/* Disclaimer */}
        <div className="text-sm text-muted-foreground mt-8">
          <p>{t("disclaimer")}</p>
        </div>
      </div>
    </StepContent>
  );
}
