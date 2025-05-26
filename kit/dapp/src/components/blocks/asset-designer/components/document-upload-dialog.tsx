"use client";

import {
  DocumentStatus,
  MicaDocumentType,
} from "@/lib/db/regulations/schema-mica-regulation-configs";
import { updateDocuments } from "@/lib/mutations/regulations/mica/update-documents/update-documents-action";
import { DocumentOperation } from "@/lib/mutations/regulations/mica/update-documents/update-documents-schema";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import type { UploadedDocument } from "../types";

interface DocumentUploadDialogProps {
  regulationId: string;
  onClose: () => void;
  onUpload: (regulationId: string, document: UploadedDocument) => void;
  uploadAction: (
    formData: FormData,
    path: string
  ) => Promise<{ id: string; url: string }>;
}

export function DocumentUploadDialog({
  regulationId,
  onClose,
  onUpload,
  uploadAction,
}: DocumentUploadDialogProps) {
  const t = useTranslations("regulations.mica.documents.types");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>("");
  const [documentType, setDocumentType] = useState<MicaDocumentType>(
    MicaDocumentType.AUDIT
  );
  const [documentDescription, setDocumentDescription] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        toast.error("File is too large. Maximum file size is 10MB.");
        return;
      }

      // Validate file type
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are accepted.");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!documentTitle) {
      toast.error("Document title is required");
      return;
    }

    setIsUploading(true);
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", documentTitle);
      formData.append("type", documentType);
      formData.append("description", documentDescription || "");

      // Use the server action to upload the file with the regulation ID as path
      const path = `regulations/${regulationId}`;
      const result = await uploadAction(formData, path);

      // Create the document object
      const newDocument: UploadedDocument = {
        id: result.id,
        name: selectedFile.name,
        title: documentTitle,
        type: documentType,
        description: documentDescription,
        url: result.url,
        objectName: result.id,
        fileName: selectedFile.name,
      };

      // Check if we're in asset creation mode (regulationId is just "mica" instead of a UUID)
      const isAssetCreationMode =
        regulationId === "mica" ||
        regulationId === "fund" ||
        regulationId === "bond" ||
        regulationId === "equity" ||
        regulationId === "deposit" ||
        regulationId === "cryptocurrency" ||
        regulationId === "stablecoin";

      if (isAssetCreationMode) {
        console.log(
          "Asset creation mode detected - skipping database save for now"
        );
        console.log("Document will be saved to database when asset is created");
        toast.success(
          "Document uploaded to storage (metadata will be saved when asset is created)"
        );
      } else {
        try {
          const dbResult = await updateDocuments({
            regulationId,
            operation: DocumentOperation.ADD,
            document: {
              id: result.id,
              title: documentTitle,
              type: documentType,
              url: result.url,
              status: DocumentStatus.PENDING,
              description: documentDescription || undefined,
            },
          });

          console.log(
            "Document metadata saved to database successfully:",
            dbResult
          );
          toast.success("Document uploaded and metadata saved successfully");
        } catch (dbError) {
          console.error("Error saving document metadata to database:", dbError);
          console.error(
            "Full error details:",
            JSON.stringify(dbError, null, 2)
          );
          toast.error(
            "Document uploaded but failed to save metadata. Please try again."
          );
          return;
        }
      }

      // Send the document back to the parent component
      onUpload(regulationId, newDocument);

      // Close dialog
      onClose();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Upload Document</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Upload white papers, audit reports, and other compliance documents
        </p>

        <div className="space-y-4">
          {/* Document Title */}
          <div className="grid w-full items-center gap-1.5">
            <label
              htmlFor="document-title"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Document Title
            </label>
            <input
              id="document-title"
              type="text"
              placeholder="e.g. MiCA Compliance White Paper"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
            />
          </div>

          {/* Document Type */}
          <div className="grid w-full items-center gap-1.5">
            <label
              htmlFor="document-type"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Document Type
            </label>
            <select
              id="document-type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={documentType}
              onChange={(e) =>
                setDocumentType(e.target.value as MicaDocumentType)
              }
            >
              <option value={MicaDocumentType.WHITE_PAPER}>
                {t("white_paper")}
              </option>
              <option value={MicaDocumentType.AUDIT}>{t("audit")}</option>
              <option value={MicaDocumentType.POLICY}>{t("policy")}</option>
              <option value={MicaDocumentType.GOVERNANCE}>
                {t("governance")}
              </option>
              <option value={MicaDocumentType.PROCEDURE}>
                {t("procedure")}
              </option>
            </select>
          </div>

          {/* Description */}
          <div className="grid w-full items-center gap-1.5">
            <label
              htmlFor="document-description"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Description
            </label>
            <textarea
              id="document-description"
              placeholder="Brief description of the document"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div className="grid w-full items-center gap-1.5">
            <label
              htmlFor="document-upload"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Upload File
            </label>
            <div className="flex items-center">
              <label
                htmlFor="document-upload"
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
              >
                Choose File
              </label>
              <span className="ml-3 text-sm text-muted-foreground">
                {selectedFile ? selectedFile.name : "No file chosen"}
              </span>
              <input
                id="document-upload"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept="application/pdf"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Accepted format: PDF only (Max: 10MB)
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUploadDocument}
              disabled={!selectedFile || !documentTitle || isUploading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
