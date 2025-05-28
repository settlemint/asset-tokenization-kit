"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { authClient } from "@/lib/auth/client";
import type { CreatePushAirdropInput } from "@/lib/mutations/airdrop/create/push/create-schema";
import { Coins, HandHeart, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Summary() {
  const form = useFormContext<CreatePushAirdropInput>();
  const t = useTranslations("private.airdrops.create.summary.push");
  const formValues = form.getValues();
  const { data: session } = authClient.useSession();

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
            value={formValues.asset ? `${formValues.asset.symbol}` : undefined}
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

        {/* Distribution Configuration Card */}
        <FormSummaryDetailCard
          title={t("configuration.title")}
          description={t("configuration.description")}
          icon={<Coins className="size-3 text-primary-foreground" />}
        >
          <FormSummaryDetailItem
            label={t("configuration.distribution-cap-label")}
            value={formValues.distributionCap?.toString()}
          />
          <FormSummaryDetailItem
            label={t("configuration.distribution-recipients-label")}
            value={formValues.distribution?.length?.toString()}
          />
          <FormSummaryDetailItem
            label={t("configuration.total-distribution-amount-label")}
            value={
              formValues.distribution
                ? formValues.distribution
                    .reduce((sum, item) => sum + Number(item.amount), 0)
                    .toString()
                : undefined
            }
          />
        </FormSummaryDetailCard>

        {/* Distribution Recipients Card */}
        {formValues.distribution && formValues.distribution.length > 0 && (
          <FormSummaryDetailCard
            title={t("recipients.title")}
            description={t("recipients.description")}
            icon={<HandHeart className="size-3 text-primary-foreground" />}
          >
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {formValues.distribution.slice(0, 10).map((recipient, index) => (
                <div
                  key={`recipient-${index}`}
                  className="flex items-center justify-between py-1.5"
                >
                  <div className="flex items-center">
                    <EvmAddress
                      address={recipient.recipient}
                      hoverCard={false}
                    />
                  </div>
                  <div className="text-sm font-medium">
                    {recipient.amount} {formValues.asset?.symbol}
                  </div>
                </div>
              ))}
              {formValues.distribution.length > 10 && (
                <div className="text-sm text-muted-foreground text-center pt-2">
                  {t("recipients.and-more", {
                    count: formValues.distribution.length - 10,
                  })}
                </div>
              )}
            </div>
          </FormSummaryDetailCard>
        )}

        {/* Disclaimer */}
        <div className="text-sm text-muted-foreground mt-8">
          <p>{t("disclaimer")}</p>
        </div>
      </div>
    </StepContent>
  );
}
