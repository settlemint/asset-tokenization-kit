"use client";

import type { MicaDocument } from "@/app/actions/get-mica-documents";
import { getMicaDocumentsAction } from "@/app/actions/get-mica-documents";
import { getMicaRegulationConfigAction } from "@/app/actions/get-mica-regulation-config";
import { uploadDocument } from "@/app/actions/upload-document";
import { DocumentUploadDialog } from "@/components/blocks/asset-designer/components/document-upload-dialog";
import type { UploadedDocument } from "@/components/blocks/asset-designer/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DocumentStatus,
  MicaDocumentType,
} from "@/lib/db/regulations/schema-mica-regulation-configs";
import { updateDocuments } from "@/lib/mutations/regulations/mica/update-documents/update-documents-action";
import { DocumentOperation } from "@/lib/mutations/regulations/mica/update-documents/update-documents-schema";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DocumentsTable } from "./documents-table";

// Skeleton loader for the documents table
function DocumentsTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <div className="w-full">
        {/* Table header skeleton */}
        <div className="flex border-b pb-2 mb-3">
          <div className="flex-1 px-4 py-2">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex-1 px-4 py-2">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex-1 px-4 py-2">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex-1 px-4 py-2">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex-1 px-4 py-2 flex justify-end">
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Table rows skeleton */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center border-b py-3">
            <div className="flex-1 px-4 py-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
            <div className="flex-1 px-4 py-2">
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex-1 px-4 py-2">
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex-1 px-4 py-2">
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="flex-1 px-4 py-2 flex justify-end gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DocumentationLayout() {
  const t = useTranslations("regulations.mica.documents");
  const params = useParams();
  const assetAddress = params.address as string;
  const assetType = params.assettype as string;
  const [documents, setDocuments] = useState<MicaDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [regulationConfigId, setRegulationConfigId] = useState<string | null>(
    null
  );

  // Fetch documents using server action
  const fetchDocuments = useCallback(async () => {
    console.log("🔍 Starting to fetch documents for asset:", assetAddress);
    setIsLoading(true);
    try {
      const result = await getMicaDocumentsAction(assetAddress);
      console.log("📄 getMicaDocumentsAction result:", result);

      if (result.success) {
        console.log(
          `✅ Successfully fetched ${result.data.length} documents:`,
          result.data
        );
        setDocuments(result.data);
      } else {
        console.error("❌ Failed to fetch documents:", result.error);
        toast.error(t("delete_error"));
      }
    } catch (error) {
      console.error("❌ Error fetching documents:", error);
      toast.error(t("delete_error"));
    } finally {
      setIsLoading(false);
      console.log("🏁 fetchDocuments completed");
    }
  }, [assetAddress, t]);

  // Upload action using MinIO SDK server action
  const uploadAction = async (formData: FormData, path: string) => {
    try {
      const file = formData.get("file") as File;
      const documentType = (formData.get("type") as string) || "mica";
      const title = formData.get("title") as string;

      if (!file) {
        throw new Error("No file provided");
      }

      // Use the uploadDocument action with the form data
      formData.append("assetAddress", assetAddress);
      const result = await uploadDocument(formData);

      toast.success(t("upload_success"));

      return {
        id: result.id,
        url: result.url,
      };
    } catch (error) {
      console.error("Error in EXISTING ASSET uploadAction:", error);
      toast.error(t("delete_error"));
      throw error;
    }
  };

  // Handle document upload completion
  const handleUploadComplete = async (
    regulationId: string,
    document: UploadedDocument
  ) => {
    try {
      console.log("🔄 Starting document upload completion process:", {
        regulationId,
        document: {
          id: document.id,
          title: document.title,
          type: document.type,
          url: document.url,
        },
      });

      // Convert UploadedDocument to MicaDocument format for database storage
      const convertToMicaDocument = (doc: UploadedDocument) => {
        // Handle the case where type might be "mica" - convert to a default MicaDocumentType
        let documentType: MicaDocumentType;
        if (doc.type === "mica") {
          documentType = MicaDocumentType.POLICY; // Default to policy for mica documents
        } else {
          documentType = doc.type as MicaDocumentType;
        }

        // Extract filename from title or URL
        let fileName = doc.title;
        if (doc.url) {
          try {
            const urlPath = new URL(doc.url).pathname;
            const urlFileName = urlPath.split("/").pop();
            if (urlFileName) {
              fileName = urlFileName;
            }
          } catch (error) {
            // Use title as fallback if URL parsing fails
            fileName = doc.title;
          }
        }

        const micaDocument = {
          id: doc.id,
          title: doc.title,
          fileName: fileName,
          type: documentType,
          category: doc.type, // Use the original type as category
          uploadDate: new Date().toISOString(), // This will be the upload date for the new document
          url: doc.url,
          status: DocumentStatus.PENDING,
          size: 0, // Default size, could be enhanced if available in UploadedDocument
          description: doc.description,
        };

        console.log("📄 Converted document for database:", micaDocument);
        return micaDocument;
      };

      const micaDocument = convertToMicaDocument(document);

      console.log("💾 Calling updateDocuments with:", {
        regulationId,
        operation: DocumentOperation.ADD,
        document: micaDocument,
      });

      // Save the document metadata to the database
      const updateResult = await updateDocuments({
        regulationId,
        operation: DocumentOperation.ADD,
        document: micaDocument,
      });

      console.log("✅ updateDocuments completed:", updateResult);

      toast.success("Document uploaded and metadata saved successfully");

      console.log("🔄 Refreshing documents list...");
      // Refresh the documents list
      await fetchDocuments();
      console.log("✅ Documents list refreshed");
    } catch (error) {
      console.error("❌ Error saving document metadata to database:", error);
      console.error("Full error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      toast.error(
        "Document uploaded but failed to save metadata. Please try again."
      );
    }
  };

  // Fetch regulation config ID for this asset using server action
  const fetchRegulationConfig = useCallback(async () => {
    console.log("🔍 Fetching regulation config for:", {
      assetAddress,
      assetType,
    });
    try {
      const result = await getMicaRegulationConfigAction(
        assetAddress,
        assetType as AssetType
      );
      console.log("📋 getMicaRegulationConfigAction result:", result);

      if (result.success && result.data) {
        console.log("✅ Setting regulation config ID:", result.data.id);
        setRegulationConfigId(result.data.id);
      } else {
        console.error("❌ Failed to fetch regulation config:", result.error);
        toast.error("Failed to load regulation configuration");
      }
    } catch (error) {
      console.error("❌ Error fetching regulation config:", error);
      toast.error("Failed to load regulation configuration");
    }
  }, [assetAddress, assetType]);

  // Fetch documents and regulation config on initial load
  useEffect(() => {
    fetchDocuments();
    fetchRegulationConfig();
  }, [assetAddress, fetchDocuments, fetchRegulationConfig]);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("card.title")}</CardTitle>
        <Button
          size="sm"
          onClick={() => {
            setIsDialogOpen(true);
          }}
          disabled={!regulationConfigId}
          title={
            !regulationConfigId
              ? "Loading regulation configuration..."
              : undefined
          }
        >
          <Upload className="h-4 w-4 mr-2" />
          {t("card.upload")}
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <DocumentsTableSkeleton />
        ) : (
          <DocumentsTable documents={documents} onRefresh={fetchDocuments} />
        )}
      </CardContent>

      {isDialogOpen && regulationConfigId && (
        <>
          <DocumentUploadDialog
            regulationId={regulationConfigId}
            onClose={() => {
              setIsDialogOpen(false);
            }}
            onUpload={handleUploadComplete}
            uploadAction={uploadAction}
          />
        </>
      )}
    </Card>
  );
}
