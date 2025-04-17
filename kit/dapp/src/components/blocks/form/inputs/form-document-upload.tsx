"use client";

import { uploadDocumentAction } from "@/app/actions/upload-document";
import { TranslatableFormFieldMessage } from "@/components/blocks/form/form-field-translatable-message";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { t, type StaticDecode } from "@/lib/utils/typebox";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { FileIcon, PlusIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useForm, useFormContext, type FieldValues } from "react-hook-form";
import type { BaseFormInputProps } from "./types";

export type DocumentType = "audit" | "legal" | "financial" | "other";

export interface Document {
  id: string;
  title: string;
  description?: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  downloadUrl?: string;
  status: "uploading" | "complete" | "error";
  progress: number;
}

interface FormDocumentUploadProps<T extends FieldValues>
  extends BaseFormInputProps<T> {
  /** The title for the document upload section */
  title: string;
  /** A description for the document upload section */
  description?: string;
  /** Optional document types to show in the select dropdown */
  documentTypes?: { value: string; label: string }[];
  /** Maximum file size in MB (default: 10MB) */
  maxFileSize?: number;
  /** Accepted file formats (default: ['application/pdf']) */
  acceptedFormats?: string[];
  /** Called when a document is uploaded */
  onDocumentUploaded?: (document: Document) => void;
  /** Called when a document is deleted */
  onDocumentDeleted?: (documentId: string) => void;
}

export const documentUploadSchema = t.Object(
  {
    title: t.String({ minLength: 1, error: "Document title is required" }),
    description: t.Optional(t.String()),
    type: t.String({ minLength: 1, error: "Document type is required" }),
    file: t.Any(),
  },
  { $id: "DocumentUpload" }
);

type DocumentUploadFormValues = StaticDecode<typeof documentUploadSchema>;

export function FormDocumentUpload<T extends FieldValues>({
  title,
  description,
  documentTypes = [
    { value: "audit", label: "Audit" },
    { value: "legal", label: "Legal" },
    { value: "financial", label: "Financial" },
    { value: "other", label: "Other" },
  ],
  maxFileSize = 10,
  acceptedFormats = ["application/pdf", "image/jpeg"],
  disabled,
  onDocumentUploaded,
  onDocumentDeleted,
  ...props
}: FormDocumentUploadProps<T>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeUpload, setActiveUpload] = useState<Document | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressInterval, setProgressInterval] =
    useState<NodeJS.Timeout | null>(null);

  const parentForm = useFormContext<T>();
  const t = useTranslations("components.form.document-upload");

  const uploadForm = useForm<DocumentUploadFormValues>({
    resolver: typeboxResolver(documentUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      type: documentTypes[0]?.value || "other",
      file: undefined,
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validate file format
      if (acceptedFormats.length > 0 && !acceptedFormats.includes(file.type)) {
        setFileError(t("invalid-file-format"));
        return;
      }

      // Validate file size
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxFileSize) {
        setFileError(t("file-too-large", { maxSize: maxFileSize }));
        return;
      }

      setSelectedFile(file);
      uploadForm.setValue("file", file);
    }
  };

  const resetUploadForm = () => {
    uploadForm.reset();
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openUploadDialog = () => {
    resetUploadForm();
    setIsDialogOpen(true);
  };

  const closeUploadDialog = () => {
    resetUploadForm();
    setIsDialogOpen(false);
  };

  const startProgressSimulation = (documentId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 95) {
        clearInterval(interval);
        return;
      }

      setUploadProgress(progress);
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === documentId ? { ...doc, progress } : doc))
      );
    }, 200);

    setProgressInterval(interval);
    return interval;
  };

  const uploadDocument = async () => {
    if (!selectedFile || fileError) return;

    const data = uploadForm.getValues();

    // Create document object with initial uploading state
    const newDocument: Document = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      type: data.type as DocumentType,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      uploadedAt: new Date().toISOString(),
      status: "uploading",
      progress: 0,
    };

    setActiveUpload(newDocument);
    setDocuments((prev) => [...prev, newDocument]);
    closeUploadDialog();

    // Start progress simulation
    const interval = startProgressSimulation(newDocument.id);

    try {
      // Prepare FormData for server action
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("type", data.type);

      // Call server action directly and cast the response
      // The server action returns an object with id, name, url, title, description, and type
      const response = await uploadDocumentAction(formData);

      // Clear the progress simulation
      if (interval) clearInterval(interval);
      setProgressInterval(null);

      // Type assertion to access response data
      // We know from our server action definition what properties should exist
      const responseData = response as unknown as {
        id: string;
        name: string;
        url: string;
        title: string;
        description?: string;
        type: string;
      };

      // Update document with success state
      const updatedDocument: Document = {
        ...newDocument,
        status: "complete",
        progress: 100,
        downloadUrl: responseData.url,
      };

      setDocuments((prev) =>
        prev.map((doc) => (doc.id === newDocument.id ? updatedDocument : doc))
      );

      // Notify parent component
      if (onDocumentUploaded) {
        onDocumentUploaded(updatedDocument);
      }

      // Store the list of document IDs in the parent form
      const updatedDocumentIds = [...documents, updatedDocument].map(
        (doc) => doc.id
      );
      parentForm.setValue(props.name, updatedDocumentIds.join(",") as any, {
        shouldValidate: true,
      });
    } catch (error) {
      console.error("Error uploading document:", error);

      // Update document with error state
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === newDocument.id
            ? { ...doc, status: "error", progress: 0 }
            : doc
        )
      );
    } finally {
      setActiveUpload(null);
      setUploadProgress(0);
    }
  };

  const deleteDocument = (id: string) => {
    // Remove document from state
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));

    // Notify parent component
    if (onDocumentDeleted) {
      onDocumentDeleted(id);
    }

    // Update the form value
    const documentIds = documents
      .filter((doc) => doc.id !== id)
      .map((doc) => doc.id);
    parentForm.setValue(props.name, documentIds.join(",") as any, {
      shouldValidate: true,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <FormField
      {...props}
      render={({ field }) => (
        <FormItem className="space-y-1">
          <Accordion
            type="single"
            collapsible
            className="w-full border rounded-lg"
          >
            <AccordionItem value="documents" className="border-0">
              <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-muted/50">
                <div className="flex flex-col items-start">
                  <FormLabel className="text-base font-medium">
                    {title}
                  </FormLabel>
                  {description && (
                    <FormDescription className="mt-1">
                      {description}
                    </FormDescription>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="flex justify-between items-center mb-4 mt-4">
                  <h3 className="text-sm font-medium">Documents</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={openUploadDialog}
                    disabled={disabled}
                  >
                    <PlusIcon className="size-4" />
                    {t("add-document")}
                  </Button>
                </div>

                {documents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 border border-dashed rounded-lg">
                    <FileIcon className="size-12 text-muted-foreground/70 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {t("no-documents")}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 gap-1"
                      onClick={openUploadDialog}
                      disabled={disabled}
                    >
                      <UploadIcon className="size-4" />
                      Upload document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <Card key={doc.id} className="p-3 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <FileIcon className="size-8 text-primary shrink-0" />
                            <div className="min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {doc.title}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {doc.fileName} ({formatFileSize(doc.fileSize)})
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0"
                            onClick={() => deleteDocument(doc.id)}
                            disabled={disabled || doc.status === "uploading"}
                          >
                            <Trash2Icon className="size-4" />
                            <span className="sr-only">
                              {t("delete-document")}
                            </span>
                          </Button>
                        </div>
                        {doc.status === "uploading" && (
                          <div className="mt-2">
                            <Progress value={doc.progress} className="h-1" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("uploading")}: {doc.progress}%
                            </p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}

                {/* Hidden input to store the document IDs in the parent form */}
                <FormControl>
                  <input
                    type="hidden"
                    {...field}
                    value={documents.map((doc) => doc.id).join(",")}
                  />
                </FormControl>
                <TranslatableFormFieldMessage />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Upload Document Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {t("upload-document-title", {
                    defaultValue: "Upload Document",
                  })}
                </DialogTitle>
                <DialogDescription>
                  {t("upload-document-description", {
                    defaultValue:
                      "Upload white papers, audit reports, and other compliance documents",
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <FormField
                  control={uploadForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("document-title", {
                          defaultValue: "Document Title",
                        })}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("document-title-placeholder", {
                            defaultValue: "e.g. MiCA Compliance White Paper",
                          })}
                          {...field}
                        />
                      </FormControl>
                      <TranslatableFormFieldMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={uploadForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("document-type", {
                          defaultValue: "Document Type",
                        })}
                      </FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="" disabled>
                            {t("select-document-type", {
                              defaultValue: "Select document type",
                            })}
                          </option>
                          {documentTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <TranslatableFormFieldMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={uploadForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("document-description", {
                          defaultValue: "Description",
                        })}
                      </FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder={t("document-description-placeholder", {
                            defaultValue: "Brief description of the document",
                          })}
                          {...field}
                        />
                      </FormControl>
                      <TranslatableFormFieldMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={uploadForm.control}
                  name="file"
                  render={({
                    field: { value, onChange, ref, ...fieldProps },
                  }) => (
                    <FormItem>
                      <FormLabel>
                        {t("document-file", { defaultValue: "Upload File" })}
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <div className="rounded-md border border-input w-full">
                            <div className="flex items-center">
                              <label
                                htmlFor="file-upload"
                                className="bg-muted/50 hover:bg-muted cursor-pointer py-1.5 px-3 border-r rounded-l-md text-sm"
                              >
                                {t("choose-file", {
                                  defaultValue: "Choose File",
                                })}
                              </label>
                              <span className="px-3 text-sm text-muted-foreground">
                                {selectedFile
                                  ? selectedFile.name
                                  : t("no-file-chosen", {
                                      defaultValue: "No file chosen",
                                    })}
                              </span>
                            </div>
                            <input
                              id="file-upload"
                              type="file"
                              ref={fileInputRef}
                              accept={acceptedFormats.join(",")}
                              onChange={(e) => {
                                handleFileSelect(e);
                                // This connects the file input to react-hook-form
                                if (e.target.files?.[0] && !fileError) {
                                  onChange(e.target.files[0]);
                                }
                              }}
                              {...fieldProps}
                              className="hidden"
                            />
                          </div>
                        </div>
                      </FormControl>
                      {fileError && (
                        <p className="text-sm text-destructive mt-1">
                          {fileError}
                        </p>
                      )}
                      {!fileError && selectedFile && (
                        <p className="text-xs text-muted-foreground">
                          {selectedFile.name} (
                          {formatFileSize(selectedFile.size)})
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("accepted-format", {
                          maxSize: maxFileSize,
                          formats: acceptedFormats
                            .map((f) => f.split("/")[1].toUpperCase())
                            .join(", "),
                        })}
                      </p>
                      <TranslatableFormFieldMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeUploadDialog}
                  >
                    {t("cancel", { defaultValue: "Cancel" })}
                  </Button>
                  <Button
                    type="button"
                    onClick={uploadDocument}
                    disabled={
                      !selectedFile || !!fileError || activeUpload !== null
                    }
                  >
                    {activeUpload !== null
                      ? t("uploading-document", {
                          defaultValue: "Uploading...",
                        })
                      : t("upload-document", { defaultValue: "Upload" })}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </FormItem>
      )}
    />
  );
}
