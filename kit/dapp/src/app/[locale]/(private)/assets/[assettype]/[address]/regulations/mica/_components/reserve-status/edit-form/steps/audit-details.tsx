"use client";

import { uploadDocument } from "@/app/actions/upload-document";
import { DocumentUploadDialog } from "@/components/blocks/asset-designer/components/document-upload-dialog";
import type { UploadedDocument } from "@/components/blocks/asset-designer/types";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import { FormLabel } from "@/components/ui/form";
import {
  DocumentStatus,
  MicaDocumentType,
  ReserveComplianceStatus,
  type MicaDocument,
  type MicaRegulationConfigResponse,
} from "@/lib/db/regulations/schema-mica-regulation-configs";
import { updateDocuments } from "@/lib/mutations/regulations/mica/update-documents/update-documents-action";
import { DocumentOperation } from "@/lib/mutations/regulations/mica/update-documents/update-documents-schema";
import { UpdateReservesSchema } from "@/lib/mutations/regulations/mica/update-reserves/update-reserves-schema";
import type { StaticDecode } from "@/lib/utils/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

type UpdateReservesInput = StaticDecode<
  ReturnType<typeof UpdateReservesSchema>
>;

// Convert UploadedDocument to MicaDocument format
const convertToMicaDocument = (
  doc: UploadedDocument
): MicaDocument & { id: string } => {
  // Handle the case where type might be "mica" - convert to a default MicaDocumentType
  let documentType: MicaDocumentType;
  if (doc.type === "mica") {
    documentType = MicaDocumentType.POLICY; // Default to policy for mica documents
  } else {
    documentType = doc.type as MicaDocumentType;
  }

  return {
    id: doc.id,
    title: doc.title,
    type: documentType,
    url: doc.url,
    status: DocumentStatus.PENDING,
    description: doc.description,
  };
};

export function AuditDetails({
  config,
}: {
  config: MicaRegulationConfigResponse;
}) {
  const t = useTranslations(
    "regulations.mica.dashboard.reserve-status.form.fields.audit-details"
  );
  const docsT = useTranslations("components.form.document-upload");
  const form = useFormContext();
  const [uploadedDocuments, setUploadedDocuments] = useState<{
    [regulationId: string]: UploadedDocument[];
  }>({});
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const handleDocumentUploaded = async (
    regulationId: string,
    document: UploadedDocument
  ) => {
    try {
      // Add the document using the server action
      await updateDocuments({
        regulationId,
        operation: DocumentOperation.ADD,
        document: convertToMicaDocument(document),
      });

      // Update local state
      setUploadedDocuments((prev) => ({
        ...prev,
        [regulationId]: [...(prev[regulationId] || []), document],
      }));
    } catch (error) {
      console.error("Error saving document metadata:", error);
      toast.error("Failed to save document metadata. Please try again.");
    }
  };

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
      // Delete the document using the server action
      await updateDocuments({
        regulationId,
        operation: DocumentOperation.DELETE,
        document: convertToMicaDocument(docToDelete),
      });

      // Update local state
      setUploadedDocuments((prev) => ({
        ...prev,
        [regulationId]: prev[regulationId].filter(
          (doc) => doc.id !== documentId
        ),
      }));

      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document. Please try again.");
    }
  };

  return (
    <FormStep
      title={t("title")}
      description={t("description")}
      contentClassName="space-y-4"
    >
      <FormInput
        control={form.control}
        name="lastAuditDate"
        type="datetime-local"
        label={t("last-audit-date")}
        placeholder={t("last-audit-date-placeholder")}
        max={new Date().toISOString().slice(0, 16)}
      />

      <FormSelect
        control={form.control}
        name="reserveStatus"
        label={t("reserve-status")}
        placeholder={t("reserve-status-placeholder")}
        className="w-full"
        options={[
          {
            label: t("status.compliant"),
            value: ReserveComplianceStatus.COMPLIANT,
          },
          {
            label: t("status.pending-review"),
            value: ReserveComplianceStatus.PENDING_REVIEW,
          },
          {
            label: t("status.under-investigation"),
            value: ReserveComplianceStatus.UNDER_INVESTIGATION,
          },
          {
            label: t("status.non-compliant"),
            value: ReserveComplianceStatus.NON_COMPLIANT,
          },
        ]}
      />

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <FormLabel>{t("audit-documents")}</FormLabel>
          <button
            type="button"
            onClick={() => setShowUploadDialog(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-3 py-1.5 rounded-md"
          >
            {docsT("add-document")}
          </button>
        </div>

        <div className="space-y-2">
          {uploadedDocuments[config.id]?.length > 0 ? (
            uploadedDocuments[config.id].map((document) => (
              <div
                key={document.id}
                className="bg-muted/30 p-3 rounded-md flex items-center justify-between"
              >
                <div>
                  <span className="font-medium text-sm">{document.title}</span>
                  <p className="text-xs text-muted-foreground">
                    {document.type}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteDocument(config.id, document.id)}
                  className="text-destructive hover:text-destructive/80 flex items-center gap-1 text-xs"
                >
                  {docsT("delete-document")}
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic">
              {docsT("no-documents")}
            </p>
          )}
        </div>
      </div>

      {showUploadDialog && (
        <DocumentUploadDialog
          regulationId={config.id}
          onClose={() => setShowUploadDialog(false)}
          onUpload={handleDocumentUploaded}
          uploadAction={uploadDocument}
        />
      )}
    </FormStep>
  );
}
