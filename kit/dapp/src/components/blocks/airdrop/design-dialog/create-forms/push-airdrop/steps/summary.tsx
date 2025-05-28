"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    <>
      <style jsx global>{`
        .summary-container,
        .summary-container * {
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
      <StepContent className="max-w-3xl w-full mx-auto border-none">
        <div
          className="space-y-6 pr-4 border-none summary-container"
          style={{ border: "none", outline: "none" }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold">{t("title")}</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {t("description")}
            </p>
          </div>

          {/* Basic Information Card */}
          <Card className="border-none shadow-none">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                  <Settings size={16} />
                </div>
                <div>
                  <h3 className="font-medium text-base">{t("basics.title")}</h3>
                  <p className="text-xs text-muted-foreground">
                    {t("basics.description")}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="divide-y divide-slate-200">
                <SummaryRow
                  label={t("basics.asset-label")}
                  value={
                    formValues.asset ? `${formValues.asset.symbol}` : undefined
                  }
                />
                <SummaryRow
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
              </div>
            </CardContent>
          </Card>

          {/* Distribution Configuration Card */}
          <Card className="border-none shadow-none">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                  <Coins size={16} />
                </div>
                <div>
                  <h3 className="font-medium text-base">
                    {t("configuration.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("configuration.description")}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="divide-y divide-slate-200">
                <SummaryRow
                  label={t("configuration.distribution-cap-label")}
                  value={formValues.distributionCap?.toString()}
                />
                <SummaryRow
                  label={t("configuration.distribution-recipients-label")}
                  value={formValues.distribution?.length?.toString()}
                />
                <SummaryRow
                  label={t("configuration.total-distribution-amount-label")}
                  value={
                    formValues.distribution
                      ? formValues.distribution
                          .reduce((sum, item) => sum + Number(item.amount), 0)
                          .toString()
                      : undefined
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Distribution Recipients Card */}
          {formValues.distribution && formValues.distribution.length > 0 && (
            <Card className="border-none shadow-none">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    <HandHeart size={16} />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">
                      {t("recipients.title")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t("recipients.description")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {formValues.distribution
                    .slice(0, 10)
                    .map((recipient, index) => (
                      <div
                        key={`recipient-${index}`}
                        className="flex items-center justify-between"
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
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <div className="text-sm text-muted-foreground mt-8">
            <p>{t("disclaimer")}</p>
          </div>
        </div>
      </StepContent>
    </>
  );
}

// Helper component for summary rows
export function SummaryRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null | React.ReactNode;
}) {
  const t = useTranslations("private.airdrops.create.summary.push");

  return (
    <div className="px-6 py-3 flex justify-between">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value || t("not-specified")}</div>
    </div>
  );
}
