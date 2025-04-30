"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DollarSign, Scale, Settings, Users } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { Address } from "viem";
import { StepContent } from "../step-wizard/step-content";
import type { AssetType } from "../types";
import { regionRegulations } from "../utils";

interface AssetAdmin {
  wallet: Address;
  roles: string[];
  name?: string;
}

interface AssetSummaryStepProps {
  assetType: AssetType;
  form: UseFormReturn<any>;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function AssetSummaryStep({
  assetType,
  form,
  isSubmitting,
  onBack,
  onSubmit,
}: AssetSummaryStepProps) {
  const formValues = form.getValues();

  // Get labels for regulations
  const getRegulationLabels = () => {
    const selectedRegulations = formValues.selectedRegulations || [];
    if (!selectedRegulations.length) return ["None"];

    // Create a mapping of regulation ids to regulation names
    const regulationMap: Record<string, string> = {};
    Object.values(regionRegulations).forEach((regulations) => {
      regulations.forEach((regulation) => {
        regulationMap[regulation.id] = regulation.name;
      });
    });

    // Map selected regulation ids to names
    return selectedRegulations.map((id: string) => regulationMap[id] || id);
  };

  // Format underlying asset for display
  const formatUnderlyingAsset = () => {
    const asset = formValues.underlyingAsset;
    if (!asset) return "Not specified";

    if (typeof asset === "object" && asset.name) {
      return asset.name || asset.symbol || JSON.stringify(asset);
    }

    return asset;
  };

  // Get asset admins from form
  const assetAdmins = formValues.assetAdmins || [];

  return (
    <StepContent
      onNext={onSubmit}
      onBack={onBack}
      isNextDisabled={isSubmitting}
      nextLabel={
        isSubmitting
          ? "Creating..."
          : `Issue new ${assetType.charAt(0).toUpperCase() + assetType.slice(1)}`
      }
      className="max-w-3xl w-full mx-auto"
      fixedButtons={true}
    >
      <div className="space-y-6 pr-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <p className="text-sm text-muted-foreground">
            This is the final step before creating your asset. Please review all
            the details you have entered.
          </p>
        </div>

        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                <DollarSign size={16} />
              </div>
              <div>
                <h3 className="font-medium text-base">Basic information</h3>
                <p className="text-xs text-muted-foreground">
                  General information about your asset.
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

        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                <Settings size={16} />
              </div>
              <div>
                <h3 className="font-medium text-base">Configuration</h3>
                <p className="text-xs text-muted-foreground">
                  Specific parameters for your asset.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <div className="divide-y divide-slate-200">
              {assetType === "bond" && (
                <>
                  <SummaryRow label="Maximum supply" value={formValues.cap} />
                  <SummaryRow label="Face value" value={formValues.faceValue} />
                  <SummaryRow
                    label="Maturity date"
                    value={
                      formValues.maturityDate
                        ? new Date(formValues.maturityDate).toLocaleString()
                        : "Not specified"
                    }
                  />
                  <SummaryRow
                    label="Underlying asset"
                    value={formatUnderlyingAsset()}
                  />
                </>
              )}

              {assetType === "cryptocurrency" && (
                <>
                  <SummaryRow
                    label="Initial supply"
                    value={formValues.initialSupply}
                  />
                  <SummaryRow label="Max supply" value={formValues.maxSupply} />
                </>
              )}

              {assetType === "equity" && (
                <>
                  <SummaryRow
                    label="Shares outstanding"
                    value={formValues.sharesOutstanding}
                  />
                  {formValues.isin && (
                    <SummaryRow label="ISIN" value={formValues.isin} />
                  )}
                  {formValues.cusip && (
                    <SummaryRow label="CUSIP" value={formValues.cusip} />
                  )}
                </>
              )}

              {assetType === "fund" && (
                <>
                  <SummaryRow
                    label="Fund type"
                    value={formValues.fundType || "Not specified"}
                  />
                  <SummaryRow
                    label="Management fee"
                    value={`${formValues.managementFeeBps / 100}%`}
                  />
                </>
              )}

              {assetType === "stablecoin" && (
                <>
                  <SummaryRow
                    label="Collateral type"
                    value={formValues.collateralType}
                  />
                  <SummaryRow
                    label="Collateral liveness"
                    value={
                      formValues.collateralLivenessValue &&
                      formValues.collateralLivenessTimeUnit
                        ? `${formValues.collateralLivenessValue} ${formValues.collateralLivenessTimeUnit}`
                        : "Not specified"
                    }
                  />
                </>
              )}

              {assetType === "deposit" && (
                <>
                  <SummaryRow
                    label="Deposit type"
                    value={formValues.depositType}
                  />
                  <SummaryRow
                    label="Bank name"
                    value={formValues.bankName || "Not specified"}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Asset Permissions Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                <Users size={16} />
              </div>
              <div>
                <h3 className="font-medium text-base">Asset permissions</h3>
                <p className="text-xs text-muted-foreground">
                  Administrative roles and permissions for managing this asset.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {assetAdmins.length > 0 ? (
              <div className="space-y-3">
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
                              ? "Supply manager"
                              : role === "user-manager"
                                ? "User manager"
                                : "Admin"}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <EvmAddress
                    name="Patrick Mualaba"
                    hoverCard={false}
                    address="0x0000000000000000000000000000000000000001"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="font-normal text-xs px-3 py-1 rounded-full"
                  >
                    Admin
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="font-normal text-xs px-3 py-1 rounded-full"
                  >
                    User manager
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="font-normal text-xs px-3 py-1 rounded-full"
                  >
                    Supply manager
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Regulations Card (Optional - only show if regulations are selected) */}
        {getRegulationLabels().length > 0 &&
          getRegulationLabels()[0] !== "None" && (
            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    <Scale size={16} />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Regulations</h3>
                    <p className="text-xs text-muted-foreground">
                      Regulatory requirements for this asset.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <div className="divide-y divide-slate-200">
                  {getRegulationLabels().map((label: string, index: number) => (
                    <SummaryRow
                      key={`regulation-${index}`}
                      label={`Regulation ${index + 1}`}
                      value={label}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Disclaimer */}
        <div className="text-sm text-muted-foreground mt-8">
          <p>
            By creating this asset, you confirm that all information provided is
            accurate and that you have the necessary permissions to deploy this
            asset. This action cannot be undone once the asset is created.
          </p>
        </div>
      </div>
    </StepContent>
  );
}

// Helper component for summary rows
function SummaryRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="px-6 py-3 flex justify-between">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value || "Not specified"}</div>
    </div>
  );
}
