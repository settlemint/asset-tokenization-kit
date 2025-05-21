"use client";

import { DocumentUploadDialog } from "@/components/blocks/asset-designer/components/document-upload-dialog";
import type {
  AssetFormStep,
  UploadedDocument,
} from "@/components/blocks/asset-designer/types";
import { StepContent } from "@/components/blocks/step-wizard/step-content";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteFile } from "@/lib/actions/delete-file";
import { uploadDocument } from "@/lib/actions/upload-document";
import { cn } from "@/lib/utils";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { Check, Info, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";

// Define the region regulations
const regionRegulations = {
  EU: [
    {
      id: "eu-mifid",
      name: "MiFID II",
      description: "Markets in Financial Instruments Directive II",
      requiredDocuments: ["prospectus", "kiid"],
    },
    {
      id: "eu-prospectus",
      name: "Prospectus Regulation",
      description: "EU Prospectus Regulation",
      requiredDocuments: ["prospectus"],
    },
    {
      id: "mica",
      name: "MiCA",
      description: "Markets in Crypto-Assets Regulation",
      requiredDocuments: ["white-paper", "audit", "policy"],
    },
  ],
  US: [
    {
      id: "us-sec",
      name: "SEC Regulations",
      description: "Securities and Exchange Commission Regulations",
      requiredDocuments: ["offering-memorandum", "form-d"],
    },
  ],
} as const;

type Region = keyof typeof regionRegulations;
type Regulation = (typeof regionRegulations)[Region][number];

interface AssetRegulationStepProps {
  assetType: AssetType;
  form: UseFormReturn<any>;
  onBack: () => void;
  onNext: () => void;
}

export function AssetRegulationStep({
  assetType,
  form,
  onBack,
  onNext,
}: AssetRegulationStepProps) {
  const t = useTranslations("private.assets.create.form");
  const [selectedRegion, setSelectedRegion] = useState<Region | null>("EU"); // Default to EU for demo
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [currentRegulationId, setCurrentRegulationId] = useState<string>("");
  const [uploadedDocuments, setUploadedDocuments] = useState<{
    [regulationId: string]: UploadedDocument[];
  }>({});
  const micaFlagFromPostHog = useFeatureFlagEnabled("mica");
  // In development, default to true if PostHog isn't fully initialized
  const isMicaEnabled =
    process.env.NODE_ENV === "development" ? true : micaFlagFromPostHog;

  // Get currently selected regulations from form
  const selectedRegulations = form.watch("selectedRegulations") || [];

  // Remove disabled regulations from form state if present (now in useEffect)
  const EU_DISABLED_IDS = ["eu-mifid", "eu-prospectus"];
  // Add MICA to disabled IDs if feature flag is disabled
  useEffect(() => {
    const disabledIds = [...EU_DISABLED_IDS];
    if (!isMicaEnabled) {
      disabledIds.push("mica");
    }

    if (selectedRegion === "EU") {
      const selectedRegulations = form.getValues("selectedRegulations") || [];
      const filtered = selectedRegulations.filter(
        (id: string) => !disabledIds.includes(id)
      );
      if (filtered.length !== selectedRegulations.length) {
        form.setValue("selectedRegulations", filtered);
      }
    }
  }, [selectedRegion, form, isMicaEnabled]);

  // Handle region selection
  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region as Region);
  };

  // Handle regulation selection
  const handleRegulationSelect = (regulationId: string, isChecked: boolean) => {
    const current = form.getValues("selectedRegulations") || [];

    if (isChecked) {
      form.setValue("selectedRegulations", [...current, regulationId]);
    } else {
      form.setValue(
        "selectedRegulations",
        current.filter((id: string) => id !== regulationId)
      );
    }
  };

  // Handle document upload
  const handleShowUploadDialog = (regulationId: string) => {
    setCurrentRegulationId(regulationId);
    setShowUploadDialog(true);
  };

  // Handle uploaded document
  const handleDocumentUploaded = (
    regulationId: string,
    document: UploadedDocument
  ) => {
    setUploadedDocuments((prev) => ({
      ...prev,
      [regulationId]: [...(prev[regulationId] || []), document],
    }));
  };

  // Handle document deletion
  const handleDeleteDocument = async (
    regulationId: string,
    documentId: string
  ) => {
    // Find the document to delete
    const docToDelete = uploadedDocuments[regulationId]?.find(
      (doc) => doc.id === documentId
    );

    if (!docToDelete) {
      console.error(
        `Document with ID ${documentId} not found for regulation ${regulationId}`
      );
      return;
    }

    try {
      // Call our enhanced deleteFile function to delete from MinIO
      if (docToDelete.objectName) {
        // Try to delete with both the objectName and possible variations
        const result = await deleteFile(docToDelete.objectName);

        if (!result.success && docToDelete.type === "mica") {
          // Try the specific MiCA path if the first attempt failed
          const micaPath = `regulations/mica/${docToDelete.fileName || ""}`;
          await deleteFile(micaPath);
        }
      }

      // Update local state
      setUploadedDocuments((prev) => ({
        ...prev,
        [regulationId]: prev[regulationId].filter(
          (doc) => doc.id !== documentId
        ),
      }));
    } catch (error) {
      console.error("Error deleting document from MinIO:", error);
    }
  };

  // Available regions
  const regions = Object.keys(regionRegulations);

  // MiCA regulation requirements specific to the EU
  const micaRegulationRequirements = [
    {
      id: "asset-referenced-token",
      title: "Asset-referenced token provisions",
      description:
        "Requirements for stablecoins backed by multiple currencies or assets",
      required: true,
    },
    {
      id: "reserve-requirements",
      title: "Reserve requirements",
      description: "Mandatory reserve assets and management policies",
      required: true,
    },
    {
      id: "authorization-procedure",
      title: "Authorization procedure",
      description: "Process for obtaining regulatory approval",
      required: true,
    },
    {
      id: "anti-market-abuse",
      title: "Anti-market abuse rules",
      description: "Provisions against market manipulation and insider trading",
      required: true,
    },
    {
      id: "e-money-token",
      title: "E-money token regulation",
      description: "Specific rules for tokens pegged to a single fiat currency",
      required: true,
    },
    {
      id: "transparency-obligations",
      title: "Transparency obligations",
      description: "Public disclosure requirements and reporting standards",
      required: true,
    },
    {
      id: "consumer-protection",
      title: "Consumer protection",
      description: "Safeguards for retail investors and users",
      required: true,
    },
  ];

  return (
    <StepContent>
      <div className="space-y-8 pb-4">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Regulation</h2>
          <p className="text-muted-foreground">
            Select regions and configure the regulations your asset needs to
            adhere to.
          </p>
        </div>
        <div>
          {/* Select Regions Section */}
          <Card className="mb-6 p-6">
            <h3 className="text-lg font-medium thank you. ">Select Regions</h3>
            <p className="text-sm text-muted-foreground -mt-6">
              Choose the regions where your asset will operate to see applicable
              regulations.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {regions.map((region) => (
                <Card
                  key={region}
                  className={cn(
                    "relative p-4 cursor-pointer border hover:border-primary transition-colors",
                    selectedRegion === region
                      ? "border-primary bg-accent-hover"
                      : "border-border"
                  )}
                  onClick={() => handleRegionSelect(region)}
                >
                  {selectedRegion === region && (
                    <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                  )}
                  <div className="flex items-start p-1">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{region}</div>
                      {region === "EU" && (
                        <div className="text-xs">European Union</div>
                      )}
                      {region === "US" && (
                        <div className="text-xs">United States</div>
                      )}
                      {region === "UK" && (
                        <div className="text-xs">United Kingdom</div>
                      )}
                      {region === "SG" && (
                        <div className="text-xs">Singapore</div>
                      )}
                      {region === "JP" && <div className="text-xs">Japan</div>}
                      {region === "CH" && (
                        <div className="text-xs">Switzerland</div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Available Regulations Section */}
          <Card className="p-6">
            <h3 className="text-lg font-medium">Available Regulations</h3>
            <p className="text-sm text-muted-foreground -mt-6">
              Regulations applicable to selected regions:
            </p>

            <FormProvider {...form}>
              {selectedRegion && (
                <div className="space-y-6">
                  {regionRegulations[selectedRegion].map((regulation) => {
                    // Check if this is a disabled regulation for EU or US
                    const isEU = selectedRegion === "EU";
                    const isUS = selectedRegion === "US";
                    const isDisabledRegulation =
                      (isEU &&
                        (regulation.id === "eu-mifid" ||
                          regulation.id === "eu-prospectus" ||
                          (regulation.id === "mica" && !isMicaEnabled))) ||
                      (isUS && regulation.id === "us-sec");

                    // Custom rendering based on if it's a disabled regulation
                    if (isDisabledRegulation) {
                      return (
                        <div
                          key={regulation.id}
                          className="border border-border rounded-lg overflow-hidden opacity-50"
                        >
                          <div className="p-4 flex items-start gap-3 bg-muted/30">
                            {/* Fixed unchecked and disabled checkbox for disabled regulations */}
                            <div className="w-4 h-4 mt-1 border border-border rounded bg-muted flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-base font-medium">
                                  {regulation.name}
                                </span>
                                <Badge variant="outline" className="ml-2">
                                  <span className="inline-flex items-center text-xs">
                                    <span className="mr-1">
                                      {selectedRegion}
                                    </span>
                                  </span>
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {regulation.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                {regulation.id === "mica" && !isMicaEnabled
                                  ? "This regulation is currently disabled via feature flag"
                                  : "This regulation is currently disabled"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Standard rendering for enabled regulations (MiCA)
                    return (
                      <div
                        key={regulation.id}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        <div className="p-4 flex items-start gap-3 bg-muted/30">
                          <Checkbox
                            id={regulation.id}
                            checked={selectedRegulations.includes(
                              regulation.id
                            )}
                            onCheckedChange={(checked) =>
                              handleRegulationSelect(
                                regulation.id,
                                checked as boolean
                              )
                            }
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor={regulation.id}
                                className="text-base font-medium cursor-pointer"
                              >
                                {regulation.name}
                              </label>
                              <Badge variant="outline" className="ml-2">
                                <span className="inline-flex items-center text-xs">
                                  <span className="mr-1">{selectedRegion}</span>
                                </span>
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {regulation.description}
                            </p>
                          </div>
                        </div>

                        {/* Display requirements if regulation is selected and it's MiCA */}
                        {selectedRegulations.includes(regulation.id) &&
                          regulation.id === "mica" && (
                            <div className="p-4 border-t border-border bg-background">
                              <h4 className="text-sm font-medium mb-0">
                                Key Requirements
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                {micaRegulationRequirements.map((req) => (
                                  <div
                                    key={req.id}
                                    className="flex items-start gap-2"
                                  >
                                    <div className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-success flex items-center justify-center">
                                      <Check className="h-3 w-3 text-white" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm font-medium">
                                          {req.title}
                                        </span>
                                        {req.required && (
                                          <span className="text-xs text-primary">
                                            *
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {req.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Document Upload Section */}
                              <div className="mt-4 border-t border-border pt-3">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-sm font-medium">
                                    Supporting Documents
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleShowUploadDialog(regulation.id)
                                    }
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-3 py-1.5 rounded-md"
                                  >
                                    Upload Document
                                  </button>
                                </div>

                                {/* List of uploaded documents */}
                                <div className="space-y-2">
                                  {uploadedDocuments[regulation.id]?.length >
                                  0 ? (
                                    uploadedDocuments[regulation.id].map(
                                      (document) => (
                                        <div
                                          key={document.id}
                                          className="bg-muted/30 p-3 rounded-md flex items-center justify-between"
                                        >
                                          <div>
                                            <span className="font-medium text-sm">
                                              {document.title}
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                              {document.type}
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDeleteDocument(
                                                regulation.id,
                                                document.id
                                              )
                                            }
                                            className="text-destructive hover:text-destructive/80 flex items-center gap-1 text-xs"
                                          >
                                            <span>Delete</span>
                                          </button>
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic">
                                      No documents uploaded yet. Upload
                                      supporting documents for compliance
                                      verification.
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="mt-2 flex items-start gap-2 text-muted-foreground border-t border-border pt-2">
                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <p className="text-xs">
                                  * Required by regulation
                                </p>
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}
            </FormProvider>
          </Card>
        </div>
      </div>

      {/* Document Upload Dialog */}
      {showUploadDialog && (
        <DocumentUploadDialog
          regulationId={currentRegulationId}
          onClose={() => setShowUploadDialog(false)}
          onUpload={handleDocumentUploaded}
          uploadAction={uploadDocument}
        />
      )}
    </StepContent>
  );
}

// Export step definition for the asset designer
export const stepDefinition: AssetFormStep & {
  component: typeof AssetRegulationStep;
} = {
  id: "regulation",
  title: "regulation.title",
  description: "regulation.description",
  component: AssetRegulationStep,
};
