"use client";

import type { UseFormReturn } from "react-hook-form";
import { StepContent } from "../step-wizard/step-content";
import type { AssetType } from "../types";
import { regionRegulations } from "../utils";

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

  // Render asset-specific summary data
  const renderAssetSpecificSummary = () => {
    switch (assetType) {
      case "bond":
        return (
          <>
            <SummaryItem label="Max Supply" value={formValues.cap} />
            <SummaryItem label="Face Value" value={formValues.faceValue} />
            <SummaryItem
              label="Maturity Date"
              value={
                formValues.maturityDate
                  ? new Date(formValues.maturityDate).toLocaleDateString()
                  : "Not specified"
              }
            />
            <SummaryItem
              label="Underlying Asset"
              value={formValues.underlyingAsset}
            />
          </>
        );
      case "cryptocurrency":
        return (
          <>
            <SummaryItem
              label="Initial Supply"
              value={formValues.initialSupply}
            />
            <SummaryItem label="Max Supply" value={formValues.maxSupply} />
          </>
        );
      case "equity":
        return (
          <>
            <SummaryItem
              label="Shares Outstanding"
              value={formValues.sharesOutstanding}
            />
            <SummaryItem
              label="ISIN"
              value={formValues.isin || "Not specified"}
            />
            <SummaryItem
              label="CUSIP"
              value={formValues.cusip || "Not specified"}
            />
          </>
        );
      case "fund":
        return (
          <>
            <SummaryItem
              label="Fund Type"
              value={formValues.fundType || "Not specified"}
            />
            <SummaryItem
              label="Management Fee"
              value={`${formValues.managementFeeBps / 100}%`}
            />
            <SummaryItem
              label="ISIN"
              value={formValues.isin || "Not specified"}
            />
          </>
        );
      case "stablecoin":
        return (
          <>
            <SummaryItem
              label="Collateral Type"
              value={formValues.collateralType}
            />
            <SummaryItem
              label="Collateral Liveness"
              value={
                formValues.collateralLivenessValue &&
                formValues.collateralLivenessTimeUnit
                  ? `${formValues.collateralLivenessValue} ${formValues.collateralLivenessTimeUnit}`
                  : "Not specified"
              }
            />
          </>
        );
      case "deposit":
        return (
          <>
            <SummaryItem label="Deposit Type" value={formValues.depositType} />
            <SummaryItem
              label="Bank Name"
              value={formValues.bankName || "Not specified"}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <StepContent
      onNext={onSubmit}
      onBack={onBack}
      isNextDisabled={isSubmitting}
      nextLabel={isSubmitting ? "Creating..." : "Create Asset"}
      className="max-w-3xl w-full mx-auto"
      fixedButtons={true}
    >
      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-xl font-medium mb-6">Asset Summary</h3>

        <div className="space-y-6">
          {/* Basic Info Section */}
          <SummarySection title="Basic Information">
            <SummaryItem
              label="Asset Type"
              value={assetType ? assetType : undefined}
            />
            <SummaryItem label="Asset Name" value={formValues.assetName} />
            <SummaryItem label="Symbol" value={formValues.symbol} />
            <SummaryItem
              label="Decimals"
              value={formValues.decimals?.toString()}
            />
          </SummarySection>

          {/* Asset Specific Section */}
          <SummarySection title="Asset Configuration">
            {renderAssetSpecificSummary()}
          </SummarySection>

          {/* Administrators Section */}
          <SummarySection title="Administrators">
            {(formValues.assetAdmins || []).length > 0 ? (
              formValues.assetAdmins.map((admin: string, index: number) => (
                <SummaryItem
                  key={`admin-${index}`}
                  label={`Admin ${index + 1}`}
                  value={admin}
                />
              ))
            ) : (
              <SummaryItem label="Admins" value="None specified" />
            )}
          </SummarySection>

          {/* Regulations Section */}
          <SummarySection title="Regulations">
            {getRegulationLabels().map((label: string, index: number) => (
              <SummaryItem
                key={`regulation-${index}`}
                label={`Regulation ${index + 1}`}
                value={label}
              />
            ))}
          </SummarySection>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 text-sm text-muted-foreground">
        <p>
          By creating this asset, you confirm that all information provided is
          accurate and that you have the necessary permissions to deploy this
          asset. This action cannot be undone once the asset is created.
        </p>
      </div>
    </StepContent>
  );
}

// Helper component for summary sections
function SummarySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-lg font-medium mb-3 border-b pb-2">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// Helper component for individual summary items
function SummaryItem({ label, value }: { label: string; value?: any }) {
  // Convert object values to string representation
  const displayValue = (): string => {
    if (value === undefined || value === null) {
      return "Not specified";
    }

    if (typeof value === "object") {
      // For complex objects (like the underlying asset),
      // display in a more structured way
      try {
        // Format the JSON with indentation
        const formatted = JSON.stringify(value, null, 2);

        // Return the formatted JSON, but truncate if too long
        if (formatted.length > 100) {
          return formatted.substring(0, 100) + "... (complex object)";
        }
        return formatted;
      } catch (e) {
        return "Complex object";
      }
    }

    return String(value);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-sm font-medium">{label}:</div>
      <div className="text-sm break-words overflow-hidden">
        {typeof value === "object" && value !== null ? (
          <div className="max-h-[150px] overflow-y-auto bg-muted/50 p-2 rounded text-xs">
            <pre>{JSON.stringify(value, null, 2)}</pre>
          </div>
        ) : (
          displayValue()
        )}
      </div>
    </div>
  );
}
