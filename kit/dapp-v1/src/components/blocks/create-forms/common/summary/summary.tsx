"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { StepContent } from "@/components/blocks/step-wizard/step-content";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";
import { DollarSign, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useFormContext, type UseFormReturn } from "react-hook-form";
import type { Address } from "viem";

interface AssetAdmin {
  wallet: Address;
  roles: string[];
  name?: string;
}

interface SummaryProps {
  configurationCard: React.ReactNode;
  isAddressAvailable: (form: UseFormReturn<any>) => Promise<false | Address>;
}

export function Summary({
  configurationCard,
  isAddressAvailable,
}: SummaryProps) {
  const form = useFormContext();
  const t = useTranslations("private.assets.create");
  const formValues = form.getValues();
  const { data: session } = authClient.useSession();
  const assetAdmins = formValues.assetAdmins || [];
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Fetch and validate predicted address on initial load
  useEffect(() => {
    // Validate predicted address
    const validateAddress = async () => {
      try {
        setPredictionError(null);

        const availableAddress = await isAddressAvailable(form);

        if (!availableAddress) {
          form.setError("predictedAddress", {
            message: "private.assets.create.form.errors.duplicate-asset",
          });
          setPredictionError(
            "This asset name and symbol combination is already taken"
          );
          return;
        }

        // Set the predicted address in the form
        form.setValue("predictedAddress", availableAddress);
        form.clearErrors("predictedAddress");
      } catch (error) {
        console.error("Error validating address:", error);
        form.setError("predictedAddress", {
          message:
            "private.assets.create.form.errors.address-prediction-failed",
        });
        setPredictionError("Failed to predict contract address");
      }
    };

    validateAddress();
  }, [form, isAddressAvailable]);

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
            <h2 className="text-xl font-semibold">{t("summary.title")}</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {t("summary.description")}
            </p>
          </div>

          {/* Show prediction error if any */}
          {predictionError && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
              {predictionError}
            </div>
          )}

          {/* Basic Information Card: the same for all asset types */}
          <Card className="border-none shadow-none">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                  <DollarSign size={16} />
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
                <SummaryRow label="Name" value={formValues.assetName} />
                <SummaryRow label="Symbol" value={formValues.symbol} />
                <SummaryRow
                  label="Decimals"
                  value={formValues.decimals?.toString()}
                />
                {formValues.isin && (
                  <SummaryRow label="ISIN" value={formValues.isin} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Configuration Card: passed per asset type by that asset type's form component */}
          {configurationCard}

          {/* Asset Permissions Card: the same for all asset types */}
          <Card className="border-none shadow-none">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className="font-medium text-base">
                    {t("form.steps.asset-admins.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("form.steps.asset-admins.description")}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Always show the current user, which will become the default admin */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <EvmAddress
                      address={session.user.wallet}
                      name={session.user.name}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="font-normal text-xs px-3 py-1 rounded-full"
                    >
                      {t("form.steps.asset-admins.roles.admin")}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="font-normal text-xs px-3 py-1 rounded-full"
                    >
                      {t("form.steps.asset-admins.roles.user-manager")}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="font-normal text-xs px-3 py-1 rounded-full"
                    >
                      {t("form.steps.asset-admins.roles.issuer")}
                    </Badge>
                  </div>
                </div>

                {assetAdmins.map((admin: AssetAdmin, index: number) => (
                  <div
                    key={`admin-${index}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <EvmAddress
                        name={admin.name}
                        hoverCard={false}
                        address={admin.wallet}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(admin.roles || ["admin"]).map(
                        (role: string, roleIndex: number) => (
                          <Badge
                            key={roleIndex}
                            variant="secondary"
                            className="font-normal text-xs px-3 py-1 rounded-full"
                          >
                            {role === "issuer"
                              ? t("form.steps.asset-admins.roles.issuer")
                              : role === "user-manager"
                                ? t(
                                    "form.steps.asset-admins.roles.user-manager"
                                  )
                                : t("form.steps.asset-admins.roles.admin")}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer: the same for all asset types */}
          <div className="text-sm text-muted-foreground mt-8">
            <p>{t("summary.disclaimer")}</p>
          </div>
        </div>
      </StepContent>
    </>
  );
}

export const stepDefinition = {
  id: "summary",
  title: "summary.title",
  description: "summary.description",
  component: Summary,
} as const;

// Helper component for summary rows
export function SummaryRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  const t = useTranslations("private.assets.create.summary");
  return (
    <div className="px-6 py-3 flex justify-between">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value || t("not-specified")}</div>
    </div>
  );
}

// Helper function to format underlying asset for display
export const formatUnderlyingAsset = (
  asset:
    | string
    | {
        name?: string;
        symbol?: string;
      }
): string => {
  if (typeof asset === "object" && asset.name) {
    return asset.name || asset.symbol || JSON.stringify(asset);
  }

  return asset as string;
};
