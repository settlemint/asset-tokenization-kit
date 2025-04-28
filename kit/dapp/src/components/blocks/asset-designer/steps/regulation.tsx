"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteFile } from "@/lib/actions/delete-file";
import { uploadToStorage } from "@/lib/actions/upload";
import { cn } from "@/lib/utils";
import { XCircle } from "lucide-react";
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
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
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

    console.log(`Attempting to delete document:`, {
      id: docToDelete.id,
      title: docToDelete.title,
      objectName: docToDelete.objectName,
      type: docToDelete.type,
    });

    try {
      // Call our enhanced deleteFile function to delete from MinIO
      if (docToDelete.objectName) {
        // Try to delete with both the objectName and possible variations
        const result = await deleteFile(docToDelete.objectName);
        console.log("MinIO Delete Result:", result);

        if (!result.success && docToDelete.type === "mica") {
          // Try the specific MiCA path if the first attempt failed
          const micaPath = `regulations/mica/${docToDelete.fileName || ""}`;
          console.log(
            `First attempt failed, trying with MiCA path: ${micaPath}`
          );

          const secondResult = await deleteFile(micaPath);
          console.log("Second delete attempt with MiCA path:", secondResult);
        }
      }

      // Update local state regardless of whether the delete from MinIO was successful
      // This ensures the UI is updated even if the backend delete might have issues
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

  return (
    <StepContent onNext={onNext} onBack={onBack}>
      <div className="flex flex-col space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Regulatory Compliance</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Select regions and compliance regulations to which this asset must
            adhere. Upload any required documents for compliance verification.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
            {/* Regions List */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-3">Regions</h4>
              <div className="space-y-2">
                {regions.map((region) => (
                  <button
                    key={region}
                    type="button"
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm",
                      selectedRegion === region
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-background"
                    )}
                    onClick={() => handleRegionSelect(region)}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Regulations for Selected Region */}
            <div className="bg-muted p-4 rounded-lg">
              <FormProvider {...form}>
                {selectedRegion ? (
                  <>
                    <h4 className="text-sm font-medium mb-3">
                      {selectedRegion} Regulations
                    </h4>
                    <div className="space-y-4">
                      {regionRegulations[selectedRegion].map((regulation) => (
                        <div
                          key={regulation.id}
                          className="bg-background p-4 rounded-lg"
                        >
                          <div className="flex items-start gap-2">
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
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={regulation.id}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {regulation.name}
                              </label>
                              <p className="text-xs text-muted-foreground mt-1">
                                {regulation.description}
                              </p>
                            </div>
                          </div>

                          {/* Document Upload Section - only show if regulation is selected */}
                          {selectedRegulations.includes(regulation.id) && (
                            <div className="ml-6 mt-3">
                              <div className="flex justify-between items-center">
                                <h5 className="text-xs font-medium mb-2">
                                  Supporting Documents
                                </h5>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleShowUploadDialog(regulation.id)
                                  }
                                  className="text-xs h-8"
                                >
                                  Upload Document
                                </Button>
                              </div>

                              {/* List of uploaded documents */}
                              <div className="space-y-2 mt-2">
                                {uploadedDocuments[regulation.id]?.length >
                                0 ? (
                                  uploadedDocuments[regulation.id].map(
                                    (document) => (
                                      <div
                                        key={document.id}
                                        className="bg-secondary/30 p-2 rounded-md flex items-center justify-between text-xs"
                                      >
                                        <div>
                                          <span className="font-medium">
                                            {document.title}
                                          </span>{" "}
                                          ({document.type})
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeleteDocument(
                                              regulation.id,
                                              document.id
                                            )
                                          }
                                          className="text-destructive hover:text-destructive/80"
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </button>
                                      </div>
                                    )
                                  )
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">
                                    No documents uploaded yet
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select a region to view applicable regulations
                  </p>
                )}
              </FormProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Document Upload Dialog */}
      {showUploadDialog && (
        <DocumentUploadDialog
          regulationId={currentRegulationId}
          onClose={() => setShowUploadDialog(false)}
          onUpload={handleDocumentUploaded}
          uploadAction={uploadToStorage}
        />
      )}
    </StepContent>
  );
}
