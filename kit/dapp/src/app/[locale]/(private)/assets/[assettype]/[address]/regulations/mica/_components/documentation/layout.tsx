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
    setIsLoading(true);
    try {
      const result = await getMicaDocumentsAction(assetAddress);

      if (result.success) {
        setDocuments(result.data);
      } else {
        toast.error(t("delete_error"));
      }
    } catch (error) {
      toast.error(t("delete_error"));
    } finally {
      setIsLoading(false);
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
        uploadedAt: result.uploadedAt,
        size: result.size,
        fileName: result.name,
      };
    } catch (error) {
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
      // Convert UploadedDocument to MicaDocument format for database storage
      const convertToMicaDocument = (doc: UploadedDocument) => {
        // Handle the case where type might be "mica" - convert to a default MicaDocumentType
        let documentType: MicaDocumentType;
        if (doc.type === "mica") {
          documentType = MicaDocumentType.POLICY; // Default to policy for mica documents
        } else {
          documentType = doc.type as MicaDocumentType;
        }

        // Extract filename from title, fileName field, or URL
        let fileName = doc.fileName || doc.title;
        if (!fileName && doc.url) {
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
          type: documentType,
          url: doc.url,
          status: DocumentStatus.PENDING,
          description: doc.description,
          // Include upload metadata
          uploadDate: doc.uploadedAt || new Date().toISOString(),
          size: doc.size,
          fileName: fileName,
        };

        return micaDocument;
      };

      const micaDocument = convertToMicaDocument(document);

      // Save the document metadata to the database
      const updateResult = await updateDocuments({
        regulationId,
        operation: DocumentOperation.ADD,
        document: micaDocument,
      });

      if (updateResult?.data) {
        toast.success("Document uploaded and metadata saved successfully");
        // Refresh the documents list
        await fetchDocuments();
      } else {
        throw new Error(
          `Database update failed: ${updateResult?.serverError || "Unknown error"}`
        );
      }
    } catch (error) {
      toast.error(
        "Document uploaded but failed to save metadata. Please try again."
      );
    }
  };

  // Fetch regulation config ID for this asset using server action
  const fetchRegulationConfig = useCallback(async () => {
    try {
      const result = await getMicaRegulationConfigAction(
        assetAddress,
        assetType as AssetType
      );

      if (result.success && result.data) {
        setRegulationConfigId(result.data.id);
      } else {
        toast.error("Failed to load regulation configuration");
      }
    } catch (error) {
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
          <DocumentsTable
            documents={documents}
            regulationId={regulationConfigId || ""}
          />
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
