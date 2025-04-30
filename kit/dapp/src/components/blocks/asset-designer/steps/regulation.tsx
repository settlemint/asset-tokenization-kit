"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteFile } from "@/lib/actions/delete-file";
import { uploadDocument } from "@/lib/actions/upload-document";
import { cn } from "@/lib/utils";
import { Check, Info, MapPin } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { DocumentUploadDialog } from "../components/document-upload-dialog";
import { StepContent } from "../step-wizard/step-content";
import type { AssetType, UploadedDocument } from "../types";
import { regionRegulations } from "../utils";

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
  const [selectedRegion, setSelectedRegion] = useState<string | null>("EU"); // Default to EU for demo
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [currentRegulationId, setCurrentRegulationId] = useState<string>("");
  const [uploadedDocuments, setUploadedDocuments] = useState<{
    [regulationId: string]: UploadedDocument[];
  }>({});

  // Get currently selected regulations from form
  const selectedRegulations = form.watch("selectedRegulations") || [];

  // Handle region selection
  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
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
    <StepContent onNext={onNext} onBack={onBack}>
      <div className="flex flex-col space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-0">Regulation</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Select regions and configure the regulations your asset needs to
            adhere to.
          </p>

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
                  {regionRegulations[selectedRegion].map((regulation) => (
                    <div
                      key={regulation.id}
                      className="border border-border rounded-lg overflow-hidden"
                    >
                      <div className="p-4 flex items-start gap-3 bg-muted/30">
                        <Checkbox
                          id={regulation.id}
                          checked={selectedRegulations.includes(regulation.id)}
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
                                    No documents uploaded yet. Upload supporting
                                    documents for compliance verification.
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
                  ))}
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
