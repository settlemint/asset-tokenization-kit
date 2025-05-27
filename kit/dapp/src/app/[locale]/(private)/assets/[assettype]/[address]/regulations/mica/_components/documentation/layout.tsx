"use client";

import type { MicaDocument } from "@/app/actions/get-mica-documents";
import { getMicaDocumentsAction } from "@/app/actions/get-mica-documents";
import { getMicaRegulationConfigAction } from "@/app/actions/get-mica-regulation-config";
import { DocumentUploadDialog } from "@/components/blocks/asset-designer/components/document-upload-dialog";
import type { UploadedDocument } from "@/components/blocks/asset-designer/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Upload } from "lucide-react";
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
        console.error("Failed to fetch documents:", result.error);
        toast.error(t("delete_error"));
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error(t("delete_error"));
    } finally {
      setIsLoading(false);
    }
  }, [assetAddress, t]);

  // Upload action using MinIO SDK server action
  const uploadAction = async (formData: FormData) => {
    try {
      const file = formData.get("file") as File;
      const documentType = (formData.get("type") as string) || "mica";
      const title = formData.get("title") as string;

      if (!file) {
        throw new Error("No file provided");
      }

      console.log(
        `Document type: ${documentType}, will be stored appropriately`
      );

      // Note: This is temporarily disabled until we create a proper upload dialog
      // that works with our server action
      toast.error(
        "Upload functionality is being updated to use the new MinIO SDK"
      );
      return {
        id: "temp",
        url: "#",
      };

      // TODO: Implement proper upload using server action
      // const result = await uploadMicaDocumentAction({
      //   file,
      //   assetAddress,
      //   documentType,
      //   title,
      // });

      // if (!result.success) {
      //   throw new Error(result.error || "Upload failed");
      // }

      // toast.success(t("upload_success"));

      // // Force a delay to ensure MinIO has time to update
      // setTimeout(() => {
      //   fetchDocuments();
      // }, 2000);

      // return {
      //   id: result.data.id,
      //   url: result.data.url,
      // };
    } catch (error) {
      console.error("Error in uploadAction:", error);
      toast.error(t("delete_error"));
      throw error;
    }
  };

  // Handle document upload completion
  const handleUploadComplete = (
    _regulationId: string,
    _document: UploadedDocument
  ) => {
    // Add a small delay to ensure MinIO has time to update
    setTimeout(() => {
      fetchDocuments();
    }, 1500);
  };

  // Fetch regulation config ID for this asset using server action
  const fetchRegulationConfig = useCallback(async () => {
    try {
      const result = await getMicaRegulationConfigAction(assetAddress);

      if (result.success && result.data) {
        setRegulationConfigId(result.data.id);
        console.log("Regulation config ID fetched:", result.data.id);
        console.log("Full server action response:", result.data);
      } else {
        console.error("Failed to fetch regulation config:", result.error);
        toast.error("Failed to load regulation configuration");
      }
    } catch (error) {
      console.error("Error fetching regulation config:", error);
      toast.error("Failed to load regulation configuration");
    }
  }, [assetAddress]);

  // Fetch documents and regulation config on initial load
  useEffect(() => {
    fetchDocuments();
    fetchRegulationConfig();
  }, [assetAddress, fetchDocuments, fetchRegulationConfig]);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("card.title")}</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDocuments}
            title={t("card.refresh")}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => setIsDialogOpen(true)}
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
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <DocumentsTableSkeleton />
        ) : (
          <DocumentsTable documents={documents} onRefresh={fetchDocuments} />
        )}
      </CardContent>

      {isDialogOpen && regulationConfigId && (
        <DocumentUploadDialog
          regulationId={regulationConfigId}
          onClose={() => setIsDialogOpen(false)}
          onUpload={handleUploadComplete}
          uploadAction={uploadAction}
        />
      )}
    </Card>
  );
}
