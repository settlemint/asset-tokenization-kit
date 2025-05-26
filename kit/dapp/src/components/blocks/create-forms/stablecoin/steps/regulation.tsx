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

// Define the region regulations
const regionRegulations = {
  EU: [
    {
      id: "mica",
      name: "MiCA",
      description: "Markets in Crypto-Assets Regulation",
      requiredDocuments: ["white-paper", "audit", "policy"],
    },
  ],
} as const;

type Region = keyof typeof regionRegulations;
type Regulation = (typeof regionRegulations)[Region][number];

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

// EU disabled regulations (now empty since we only have MiCA)
const EU_DISABLED_IDS: string[] = [];

interface AssetRegulationStepProps {
  assetType: AssetType;
  form: UseFormReturn<any>;
  onBack: () => void;
  onNext: () => void;
}

// Region selection component
interface RegionSelectorProps {
  regions: string[];
  selectedRegion: Region | null;
  onRegionSelect: (region: string) => void;
}

function RegionSelector({
  regions,
  selectedRegion,
  onRegionSelect,
}: RegionSelectorProps) {
  return (
    <Card className="mb-6 p-6">
      <h3 className="text-lg font-medium">Select Regions</h3>
      <p className="text-sm text-muted-foreground -mt-6">
        Choose the regions where your asset will operate to see applicable
        regulations.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {regions.map((region) => (
          <Card
            key={region}
            className={cn(
              "relative p-4 cursor-pointer border hover:border-primary transition-colors",
              selectedRegion === region
                ? "border-primary bg-accent-hover"
                : "border-border"
            )}
            onClick={() => onRegionSelect(region)}
          >
            {selectedRegion === region && (
              <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
            )}
            <div className="flex items-start p-1">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">{region}</div>
                <div className="text-xs">European Union</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

// Disabled regulation component
interface DisabledRegulationProps {
  regulation: Regulation;
  selectedRegion: Region;
  isMicaEnabled?: boolean;
}

function DisabledRegulation({
  regulation,
  selectedRegion,
  isMicaEnabled,
}: DisabledRegulationProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden opacity-50">
      <div className="p-4 flex items-start gap-3 bg-muted/30">
        <div className="w-4 h-4 mt-1 border border-border rounded bg-muted flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium">{regulation.name}</span>
            <Badge variant="outline" className="ml-2">
              <span className="inline-flex items-center text-xs">
                <span className="mr-1">{selectedRegion}</span>
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

// MiCA requirements component
interface MiCARequirementsProps {
  requirements: typeof micaRegulationRequirements;
}

function MiCARequirements({ requirements }: MiCARequirementsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      {requirements.map((req) => (
        <div key={req.id} className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-success flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{req.title}</span>
              {req.required && <span className="text-xs text-primary">*</span>}
            </div>
            <p className="text-xs text-muted-foreground">{req.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Document upload section component
interface DocumentUploadSectionProps {
  regulationId: string;
  uploadedDocuments: {
    [regulationId: string]: UploadedDocument[];
  };
  onShowUploadDialog: (regulationId: string) => void;
  onDeleteDocument: (regulationId: string, documentId: string) => void;
}

function DocumentUploadSection({
  regulationId,
  uploadedDocuments,
  onShowUploadDialog,
  onDeleteDocument,
}: DocumentUploadSectionProps) {
  return (
    <div className="mt-4 border-t border-border pt-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">Supporting Documents</h4>
        <button
          type="button"
          onClick={() => onShowUploadDialog(regulationId)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-3 py-1.5 rounded-md"
        >
          Upload Document
        </button>
      </div>

      <div className="space-y-2">
        {uploadedDocuments[regulationId]?.length > 0 ? (
          uploadedDocuments[regulationId].map((document) => (
            <div
              key={document.id}
              className="bg-muted/30 p-3 rounded-md flex items-center justify-between"
            >
              <div>
                <span className="font-medium text-sm">{document.title}</span>
                <p className="text-xs text-muted-foreground">{document.type}</p>
              </div>
              <button
                type="button"
                onClick={() => onDeleteDocument(regulationId, document.id)}
                className="text-destructive hover:text-destructive/80 flex items-center gap-1 text-xs"
              >
                <span>Delete</span>
              </button>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No documents uploaded yet. Upload supporting documents for
            compliance verification.
          </p>
        )}
      </div>
    </div>
  );
}

// MiCA regulation component
interface MiCARegulationProps {
  regulation: Regulation;
  selectedRegion: Region;
  isSelected: boolean;
  uploadedDocuments: {
    [regulationId: string]: UploadedDocument[];
  };
  onShowUploadDialog: (regulationId: string) => void;
  onDeleteDocument: (regulationId: string, documentId: string) => void;
}

function MiCARegulation({
  regulation,
  selectedRegion,
  isSelected,
  uploadedDocuments,
  onShowUploadDialog,
  onDeleteDocument,
}: MiCARegulationProps) {
  return (
    <div className="p-4 border-t border-border bg-background">
      <h4 className="text-sm font-medium mb-0">Key Requirements</h4>
      <MiCARequirements requirements={micaRegulationRequirements} />

      <DocumentUploadSection
        regulationId={regulation.id}
        uploadedDocuments={uploadedDocuments}
        onShowUploadDialog={onShowUploadDialog}
        onDeleteDocument={onDeleteDocument}
      />

      <div className="mt-2 flex items-start gap-2 text-muted-foreground border-t border-border pt-2">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p className="text-xs">* Required by regulation</p>
      </div>
    </div>
  );
}

// Main regulation list component
interface RegulationListProps {
  selectedRegion: Region | null;
  isMicaEnabled: boolean;
  selectedRegulations: string[];
  form: UseFormReturn<any>;
  uploadedDocuments: {
    [regulationId: string]: UploadedDocument[];
  };
  onShowUploadDialog: (regulationId: string) => void;
  onDeleteDocument: (regulationId: string, documentId: string) => void;
  onRegulationSelect: (regulationId: string, isChecked: boolean) => void;
}

function RegulationList({
  selectedRegion,
  isMicaEnabled,
  selectedRegulations,
  form,
  uploadedDocuments,
  onShowUploadDialog,
  onDeleteDocument,
  onRegulationSelect,
}: RegulationListProps) {
  if (!selectedRegion) return null;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium">Available Regulations</h3>
      <p className="text-sm text-muted-foreground -mt-6">
        Regulations applicable to selected regions:
      </p>

      <div className="space-y-6">
        {regionRegulations[selectedRegion].map((regulation) => {
          // Check if regulation is disabled based on feature flag
          const isDisabled = regulation.id === "mica" && !isMicaEnabled;

          // Render disabled regulation
          if (isDisabled) {
            return (
              <DisabledRegulation
                key={regulation.id}
                regulation={regulation}
                selectedRegion={selectedRegion}
                isMicaEnabled={isMicaEnabled}
              />
            );
          }

          // Render active regulation
          const isRegulationSelected = selectedRegulations.includes(
            regulation.id
          );
          console.log(
            `Rendering ${regulation.id}, selected: ${isRegulationSelected}`
          );

          return (
            <div
              key={regulation.id}
              className="border border-border rounded-lg overflow-hidden"
            >
              <div className="p-4 flex items-start gap-3 bg-muted/30">
                <Checkbox
                  id={regulation.id}
                  checked={isRegulationSelected}
                  disabled={false}
                  onCheckedChange={(value) => {
                    onRegulationSelect(regulation.id, !!value);
                  }}
                  className="mt-1 cursor-pointer"
                  data-testid={`checkbox-${regulation.id}`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={regulation.id}
                      className="text-base font-medium cursor-pointer hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        onRegulationSelect(
                          regulation.id,
                          !isRegulationSelected
                        );
                      }}
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
              {(() => {
                const shouldShow =
                  selectedRegulations.includes(regulation.id) &&
                  regulation.id === "mica";
                console.log(
                  `Should show MiCA content for ${regulation.id}:`,
                  shouldShow,
                  "selectedRegulations:",
                  selectedRegulations
                );
                return (
                  shouldShow && (
                    <MiCARegulation
                      regulation={regulation}
                      selectedRegion={selectedRegion}
                      isSelected={selectedRegulations.includes(regulation.id)}
                      uploadedDocuments={uploadedDocuments}
                      onShowUploadDialog={onShowUploadDialog}
                      onDeleteDocument={onDeleteDocument}
                    />
                  )
                );
              })()}
            </div>
          );
        })}
      </div>
    </Card>
  );
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
  // Always enable MiCA in development mode, regardless of PostHog configuration
  const isMicaEnabled =
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined
      ? true
      : !!micaFlagFromPostHog;

  // Initialize selectedRegulations if not already set
  useEffect(() => {
    const currentValue = form.getValues("selectedRegulations");
    if (!currentValue) {
      console.log("Initializing selectedRegulations field");
      form.setValue("selectedRegulations", []);
    }
  }, [form]);

  // Use local state for selectedRegulations to ensure proper re-rendering
  const [selectedRegulations, setSelectedRegulations] = useState<string[]>([]);

  // Sync local state with form state
  useEffect(() => {
    const formValue = form.getValues("selectedRegulations") || [];
    setSelectedRegulations(formValue);
    console.log("Syncing selectedRegulations from form:", formValue);
  }, [form]);

  // Watch for form changes and sync local state
  const watchedRegulations = form.watch("selectedRegulations");
  useEffect(() => {
    const regulations = watchedRegulations || [];
    setSelectedRegulations(regulations);
    console.log(
      "Form watch triggered, updating selectedRegulations:",
      regulations
    );
  }, [watchedRegulations]);

  // Remove MiCA from selected regulations if feature flag is disabled
  useEffect(() => {
    if (!isMicaEnabled) {
      const selectedRegulations = form.getValues("selectedRegulations") || [];
      const filtered = selectedRegulations.filter(
        (id: string) => id !== "mica"
      );
      if (filtered.length !== selectedRegulations.length) {
        form.setValue("selectedRegulations", filtered);
      }
    }
  }, [isMicaEnabled, form]);

  // Handle region selection
  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region as Region);
  };

  // Handle regulation selection
  const handleRegulationSelect = (regulationId: string, isChecked: boolean) => {
    console.log(`handleRegulationSelect called: ${regulationId}, ${isChecked}`);
    const current = form.getValues("selectedRegulations") || [];
    console.log("Current selected regulations:", current);

    // Check if the regulation is currently selected (ignore isChecked parameter)
    const isCurrentlySelected = current.includes(regulationId);

    let updatedRegulations: string[];
    if (isCurrentlySelected) {
      // Remove it if it's already selected
      updatedRegulations = current.filter((id: string) => id !== regulationId);
      console.log(`Removing ${regulationId} from selection`);
    } else {
      // Add it if it's not selected
      updatedRegulations = [...current, regulationId];
      console.log(`Adding ${regulationId} to selection`);
    }

    console.log("Setting selectedRegulations to:", updatedRegulations);
    form.setValue("selectedRegulations", updatedRegulations, {
      shouldTouch: true,
    });

    // Update local state immediately for instant UI update
    setSelectedRegulations(updatedRegulations);

    // Force re-render by triggering form validation
    form.trigger("selectedRegulations");
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
    const updatedDocuments = {
      ...uploadedDocuments,
      [regulationId]: [...(uploadedDocuments[regulationId] || []), document],
    };

    setUploadedDocuments(updatedDocuments);

    // Also save to form state so it's available during asset creation
    form.setValue("uploadedDocuments", updatedDocuments);
    console.log("Updated uploaded documents in form:", updatedDocuments);
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
      const updatedDocuments = {
        ...uploadedDocuments,
        [regulationId]: uploadedDocuments[regulationId].filter(
          (doc) => doc.id !== documentId
        ),
      };

      setUploadedDocuments(updatedDocuments);

      // Also update form state
      form.setValue("uploadedDocuments", updatedDocuments);
      console.log(
        "Updated uploaded documents in form after deletion:",
        updatedDocuments
      );
    } catch (error) {
      console.error("Error deleting document from MinIO:", error);
    }
  };

  // Available regions
  const regions = Object.keys(regionRegulations);

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
          {/* Region Selection Component */}
          <RegionSelector
            regions={regions}
            selectedRegion={selectedRegion}
            onRegionSelect={handleRegionSelect}
          />

          {/* Regulations List Component */}
          <RegulationList
            key={`regulations-${selectedRegulations.join(",")}`}
            selectedRegion={selectedRegion}
            isMicaEnabled={isMicaEnabled as boolean}
            selectedRegulations={selectedRegulations}
            form={form}
            uploadedDocuments={uploadedDocuments}
            onShowUploadDialog={handleShowUploadDialog}
            onDeleteDocument={handleDeleteDocument}
            onRegulationSelect={handleRegulationSelect}
          />
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
