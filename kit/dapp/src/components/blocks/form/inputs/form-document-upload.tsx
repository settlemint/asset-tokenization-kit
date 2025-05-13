"use client";

import { deleteDocument } from "@/app/actions/delete-document";
import { uploadDocument } from "@/app/actions/upload-document";
import {
  AlertCircleIcon,
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileUpIcon,
  HeadphonesIcon,
  ImageIcon,
  VideoIcon,
  XIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { useController, type Control, type FieldValues } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";

export type UploadedDocument = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  objectName: string;
  uploadedAt: string;
  title?: string;
  description?: string;
};

export type FormDocumentUploadProps<
  TFieldValues extends FieldValues = FieldValues,
> = {
  name: string;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  documentType?: string; // Type of document for categorization
  accept?: string; // Accepted file types
  onUploadSuccess?: (files: UploadedDocument[]) => void;
  onUploadError?: (error: Error) => void;
  disabled?: boolean;
  required?: boolean;
};

const getFileIcon = (file: { file: File | { type: string; name: string } }) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type;
  const fileName = file.file instanceof File ? file.file.name : file.file.name;

  if (
    fileType.includes("pdf") ||
    fileName.endsWith(".pdf") ||
    fileType.includes("word") ||
    fileName.endsWith(".doc") ||
    fileName.endsWith(".docx")
  ) {
    return <FileTextIcon className="size-4 opacity-60" />;
  } else if (
    fileType.includes("zip") ||
    fileType.includes("archive") ||
    fileName.endsWith(".zip") ||
    fileName.endsWith(".rar")
  ) {
    return <FileArchiveIcon className="size-4 opacity-60" />;
  } else if (
    fileType.includes("excel") ||
    fileName.endsWith(".xls") ||
    fileName.endsWith(".xlsx")
  ) {
    return <FileSpreadsheetIcon className="size-4 opacity-60" />;
  } else if (fileType.includes("video/")) {
    return <VideoIcon className="size-4 opacity-60" />;
  } else if (fileType.includes("audio/")) {
    return <HeadphonesIcon className="size-4 opacity-60" />;
  } else if (fileType.startsWith("image/")) {
    return <ImageIcon className="size-4 opacity-60" />;
  }
  return <FileIcon className="size-4 opacity-60" />;
};

export function FormDocumentUpload<
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  label,
  description,
  maxSize = 100 * 1024 * 1024, // 100MB default
  maxFiles = 10,
  documentType = "default",
  accept = "*",
  onUploadSuccess,
  onUploadError,
  disabled,
  required,
}: FormDocumentUploadProps<TFieldValues>) {
  const { field, fieldState } = useController({
    control,
    name: name as any,
  });
  const [isUploading, setIsUploading] = useState(false);
  const processingFilesRef = useRef(false);

  // Convert the field.value to the format expected by useFileUpload
  const initialFiles = Array.isArray(field.value)
    ? field.value.map((doc: UploadedDocument) => ({
        name: doc.name,
        size: doc.size,
        type: doc.type,
        url: doc.url,
        id: doc.id,
      }))
    : [];

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile: internalRemoveFile,
      clearFiles,
      getInputProps,
      addFiles: internalAddFiles,
    },
  ] = useFileUpload({
    multiple: maxFiles > 1,
    maxFiles,
    maxSize,
    accept,
    initialFiles,
    onFilesChange: (updatedFiles) => {
      // Only sync back to the form when files are not being processed
      if (!processingFilesRef.current) {
        const uploadedDocs = updatedFiles
          .filter((file) => file.file instanceof File === false)
          .map((file) => {
            const fileData = file.file as any;
            return {
              id: fileData.id || file.id,
              name: fileData.name,
              url: fileData.url,
              size: fileData.size,
              type: fileData.type,
              objectName: fileData.objectName || fileData.id,
              uploadedAt: fileData.uploadedAt || new Date().toISOString(),
              title: fileData.title || fileData.name,
              description: fileData.description || "",
            } as UploadedDocument;
          });

        field.onChange(uploadedDocs);
      }
    },
  });

  // Process newly added files - we'll use this instead of a useEffect
  const processNewFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0 || isUploading || disabled) return;

    try {
      processingFilesRef.current = true;
      setIsUploading(true);

      const uploadedFiles: UploadedDocument[] = [];

      for (const file of newFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name);
        formData.append("type", documentType);

        try {
          const uploadedFile = await uploadDocument(formData);
          if (uploadedFile) {
            uploadedFiles.push(uploadedFile);
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          if (onUploadError) {
            onUploadError(
              error instanceof Error
                ? error
                : new Error(`Failed to upload ${file.name}`)
            );
          }
        }
      }

      // After all uploads are done, update the files list
      if (uploadedFiles.length > 0) {
        // Add all successfully uploaded files to the UI
        const fileMetadataList = uploadedFiles.map((doc) => ({
          file: {
            name: doc.name,
            size: doc.size,
            type: doc.type,
            url: doc.url,
            id: doc.id,
            objectName: doc.objectName,
            uploadedAt: doc.uploadedAt,
            title: doc.title || doc.name,
            description: doc.description || "",
          },
          id: doc.id,
          preview: doc.url,
        }));

        // Clear any pending files and add the uploaded ones
        const pendingFileIds = files
          .filter((f) => f.file instanceof File)
          .map((f) => f.id);

        // Remove pending files first
        pendingFileIds.forEach((id) => internalRemoveFile(id));

        // Then add the uploaded files
        fileMetadataList.forEach((metadata) => {
          internalAddFiles([metadata.file] as any);
        });

        if (onUploadSuccess) {
          onUploadSuccess(uploadedFiles);
        }
      }
    } catch (error) {
      console.error("Error in upload process:", error);
    } finally {
      setIsUploading(false);
      processingFilesRef.current = false;
    }
  };

  // Handle file removal with safe state updates
  const removeFile = async (id: string) => {
    if (isUploading || disabled) return;

    const fileToRemove = files.find((file) => file.id === id);
    if (!fileToRemove) return;

    try {
      processingFilesRef.current = true;

      // If it's a real file (not just a File object), delete it from storage
      if (!(fileToRemove.file instanceof File)) {
        const metadata = fileToRemove.file as any;
        const objectName = metadata.objectName || metadata.id;

        if (objectName) {
          await deleteDocument(objectName, documentType, metadata.name);
        }
      }

      // Remove from UI
      internalRemoveFile(id);
    } catch (error) {
      console.error("Error removing file:", error);
    } finally {
      processingFilesRef.current = false;
    }
  };

  // Custom handlers for file operations to avoid infinite loops
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processNewFiles(Array.from(e.target.files));
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processNewFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <FormItem>
      {label && (
        <FormLabel htmlFor={name} id={`${name}-label`}>
          <span>{label}</span>
          {required && <span className="ml-1 text-destructive">*</span>}
        </FormLabel>
      )}

      <div className="flex flex-col gap-2">
        {/* Drop area */}
        <div
          role="button"
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleFileDrop}
          data-dragging={isDragging || undefined}
          className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
          aria-disabled={isUploading || disabled}
        >
          <input
            type="file"
            className="sr-only"
            aria-label="Upload files"
            disabled={isUploading || disabled}
            id={name}
            onChange={handleFileChange}
            accept={accept}
            multiple={maxFiles > 1}
          />

          <div className="flex flex-col items-center justify-center text-center">
            <div
              className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <FileUpIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">
              {isUploading ? "Uploading..." : "Upload files"}
            </p>
            <p className="text-muted-foreground mb-2 text-xs">
              {isUploading
                ? "Please wait..."
                : "Drag & drop or click to browse"}
            </p>
            <div className="text-muted-foreground/70 flex flex-wrap justify-center gap-1 text-xs">
              <span>All files</span>
              <span>∙</span>
              <span>Max {maxFiles} files</span>
              <span>∙</span>
              <span>Up to {formatBytes(maxSize)}</span>
            </div>
          </div>
        </div>

        {(errors.length > 0 || fieldState.error) && (
          <div
            className="text-destructive flex items-center gap-1 text-xs"
            role="alert"
          >
            <AlertCircleIcon className="size-3 shrink-0" />
            <span>{errors[0] || fieldState.error?.message}</span>
          </div>
        )}

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                    {getFileIcon(file)}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate text-[13px] font-medium">
                      {file.file instanceof File
                        ? file.file.name
                        : file.file.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatBytes(
                        file.file instanceof File
                          ? file.file.size
                          : file.file.size
                      )}
                    </p>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                  onClick={() => removeFile(file.id)}
                  aria-label="Remove file"
                  disabled={isUploading || disabled}
                >
                  <XIcon className="size-4" aria-hidden="true" />
                </Button>
              </div>
            ))}

            {/* Remove all files button */}
            {files.length > 1 && (
              <div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Clear all files safely
                    const fileIds = [...files.map((f) => f.id)];
                    fileIds.forEach((id) => removeFile(id));
                  }}
                  disabled={isUploading || disabled}
                >
                  Remove all files
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
