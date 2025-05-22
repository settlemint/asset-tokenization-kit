"use client";

import { uploadDocument } from "@/app/actions/upload-document";
import { DocumentUploadDialog } from "@/components/blocks/asset-designer/components/document-upload-dialog";
import type { UploadedDocument } from "@/components/blocks/asset-designer/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MicaDocument } from "@/lib/queries/regulations/mica-documents";
import { Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DocumentsTable } from "./documents-table";

export function DocumentationLayout() {
  const params = useParams();
  const assetAddress = params.address as string;
  const [documents, setDocuments] = useState<MicaDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents/mica/${assetAddress}`, {
        // Add cache: 'no-store' to prevent caching
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        const errorText = await response.text();
        console.error(
          `Failed to fetch documents: ${response.status}`,
          errorText
        );
        toast.error("Failed to fetch documents");
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to fetch documents");
    } finally {
      setIsLoading(false);
    }
  }, [assetAddress]);

  // Custom upload action that adds the assetAddress to the formData
  const uploadAction = async (formData: FormData) => {
    // Add asset address to the form data
    formData.append("assetAddress", assetAddress);

    // Get the document type to use as folder path
    const documentType = formData.get("type") as string;

    // If a document type was selected, use it for the folder structure
    // This will create paths like Documents/Audit/... or Documents/Whitepaper/...
    if (documentType && documentType !== "Other" && documentType !== "mica") {
      // Override the "type" to make sure it's stored as entered by the user
      // This is important as the type will be displayed in the table
      formData.set("type", documentType);

      console.log(
        `Document type: ${documentType}, will be stored in Documents/${documentType}`
      );
    } else {
      // For mica specific documents or unspecified types
      formData.set("type", "mica");
      console.log(
        `Document type: mica, will be stored in regulations/mica/${assetAddress}`
      );
    }

    try {
      const result = await uploadDocument(formData);

      if (!result) {
        throw new Error("Upload failed");
      }

      toast.success("Document uploaded successfully");

      // Force a delay to ensure MinIO has time to update
      setTimeout(() => {
        fetchDocuments();
      }, 2000);

      return {
        id: result.id,
        url: result.url,
      };
    } catch (error) {
      console.error("Error in uploadAction:", error);
      toast.error("Failed to upload document");
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

  // Fetch documents on initial load
  useEffect(() => {
    fetchDocuments();
  }, [assetAddress, fetchDocuments]);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documentation</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDocuments}
            title="Refresh documents"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </Button>
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="text-center py-8">Loading documents...</div>
        ) : (
          <DocumentsTable documents={documents} onRefresh={fetchDocuments} />
        )}
      </CardContent>

      {isDialogOpen && (
        <DocumentUploadDialog
          regulationId="mica"
          onClose={() => setIsDialogOpen(false)}
          onUpload={handleUploadComplete}
          uploadAction={uploadAction}
        />
      )}
    </Card>
  );
}
