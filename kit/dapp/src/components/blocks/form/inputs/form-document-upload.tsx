"use client";

import { deleteDocument } from "@/lib/actions/delete-document";
import { uploadDocument } from "@/lib/actions/upload-document";
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
import { useEffect, useRef, useState } from "react";
import { useController, type Control, type FieldValues } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormDescription, FormItem, FormLabel } from "@/components/ui/form";
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

// Simple progress tracking type
type UploadProgress = {
  fileName: string;
  progress: number;
  error?: string;
};

// Type for tracking files during upload
type UploadingFile = {
  id: string;
  file: File;
  progress: number;
  error?: string;
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

  // Track files that are currently being uploaded
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  // Current file being processed
  const [currentUpload, setCurrentUpload] = useState<UploadProgress | null>(
    null
  );

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
    // Empty callback here to prevent immediate state updates during render
    onFilesChange: () => {},
  });

  // Use useEffect to synchronize the file state with the form
  useEffect(() => {
    // Skip synchronization if we're actively processing files
    if (processingFilesRef.current) return;

    const uploadedDocs = files
      .filter((file) => !(file.file instanceof File))
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

    // Only update form state if the values are different
    const currentValue = (
      Array.isArray(field.value) ? field.value : []
    ) as UploadedDocument[];
    const hasChanges =
      uploadedDocs.length !== currentValue.length ||
      uploadedDocs.some((doc, i) => doc.id !== (currentValue[i]?.id || ""));

    if (hasChanges) {
      field.onChange(uploadedDocs);
    }
  }, [field, files]);

  // Process newly added files
  const processNewFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0 || isUploading || disabled) return;

    try {
      processingFilesRef.current = true;
      setIsUploading(true);

      // Add files to our uploading state to show progress
      const newUploadingFiles = newFiles.map((file) => ({
        id: `temp-${file.name}-${Date.now()}`,
        file,
        progress: 0,
      }));

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      const uploadedFiles: UploadedDocument[] = [];

      for (const uploadingFile of newUploadingFiles) {
        const file = uploadingFile.file;

        // Start showing progress for this file
        setCurrentUpload({
          fileName: file.name,
          progress: 0,
        });

        // Update progress in uploading files state
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadingFile.id ? { ...f, progress: 0 } : f
          )
        );

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name);
        formData.append("type", documentType);

        try {
          // Update initial progress
          setCurrentUpload({
            fileName: file.name,
            progress: 10,
          });

          // Update progress in uploading files state
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadingFile.id ? { ...f, progress: 10 } : f
            )
          );

          // Simulate progress updates
          let currentProgress = 10;
          const progressInterval = setInterval(() => {
            if (currentProgress < 90) {
              currentProgress += Math.floor(Math.random() * 10) + 5;
              currentProgress = Math.min(currentProgress, 90);

              setCurrentUpload({
                fileName: file.name,
                progress: currentProgress,
              });

              // Update progress in uploading files state
              setUploadingFiles((prev) =>
                prev.map((f) =>
                  f.id === uploadingFile.id
                    ? { ...f, progress: currentProgress }
                    : f
                )
              );
            }
          }, 300);

          const uploadedFile = await uploadDocument(formData);

          // Clear the interval once the upload is complete
          clearInterval(progressInterval);

          if (uploadedFile) {
            uploadedFiles.push(uploadedFile);

            // Mark as completed
            setCurrentUpload({
              fileName: file.name,
              progress: 100,
            });

            // Update progress in uploading files state
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === uploadingFile.id ? { ...f, progress: 100 } : f
              )
            );
          } else {
            // Handle failure case
            setCurrentUpload({
              fileName: file.name,
              progress: 0,
              error: "Upload failed",
            });

            // Update error in uploading files state
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === uploadingFile.id
                  ? { ...f, progress: 0, error: "Upload failed" }
                  : f
              )
            );
          }
        } catch (error) {
          console.error("Error uploading file:", error);

          // Update with error
          setCurrentUpload({
            fileName: file.name,
            progress: 0,
            error: error instanceof Error ? error.message : "Upload failed",
          });

          // Update error in uploading files state
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadingFile.id
                ? {
                    ...f,
                    progress: 0,
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : f
            )
          );

          if (onUploadError) {
            onUploadError(
              error instanceof Error
                ? error
                : new Error(`Failed to upload ${file.name}`)
            );
          }
        }
      }

      // After all uploads are done, add all successfully uploaded files to the UI
      if (uploadedFiles.length > 0) {
        // Add the uploaded files with their proper metadata
        const fileMetadataList = uploadedFiles.map((doc) => ({
          name: doc.name,
          size: doc.size,
          type: doc.type,
          url: doc.url,
          id: doc.id,
          objectName: doc.objectName,
          uploadedAt: doc.uploadedAt,
          title: doc.title || doc.name,
          description: doc.description || "",
        }));

        // Add the uploaded files to useFileUpload
        internalAddFiles(fileMetadataList as any);

        if (onUploadSuccess) {
          onUploadSuccess(uploadedFiles);
        }
      }

      // Clear uploading files after upload
      setUploadingFiles([]);

      // Clear progress indicator after upload
      setTimeout(() => {
        setCurrentUpload(null);
      }, 1000);
    } catch (error) {
      console.error("Error in upload process:", error);
    } finally {
      setIsUploading(false);
      processingFilesRef.current = false;
    }
  };

  // Handle file removal
  const removeFile = async (id: string) => {
    if (isUploading || disabled) return;

    // Check if it's an uploading file or a completed file
    const uploadingFile = uploadingFiles.find((f) => f.id === id);
    if (uploadingFile) {
      // Just remove from uploading files state
      setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
      return;
    }

    const fileToRemove = files.find((file) => file.id === id);
    if (!fileToRemove) return;

    try {
      processingFilesRef.current = true;

      // If it's a real file (not just a File object), delete it from storage
      if (!(fileToRemove.file instanceof File)) {
        const metadata = fileToRemove.file as any;
        const objectName = metadata.objectName || metadata.id;

        if (objectName) {
          console.log(`Deleting file from storage: ${objectName}`);
          await deleteDocument(objectName, documentType, metadata.name);
        }
      }

      // Remove from useFileUpload - will trigger onFilesChange
      internalRemoveFile(id);
    } catch (error) {
      console.error("Error removing file:", error);
    } finally {
      processingFilesRef.current = false;
    }
  };

  // Custom handlers for file operations
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

  // Combine both uploading files and completed files for display
  const allFiles = [
    ...uploadingFiles.map((uf) => ({
      id: uf.id,
      file: uf.file,
      isUploading: true,
      progress: uf.progress,
      error: uf.error,
    })),
    ...files.map((f) => ({
      id: f.id,
      file: f.file,
      isUploading: false,
      progress: 100,
      error: undefined,
    })),
  ];

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
            {...getInputProps()}
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

        {/* File list with integrated progress */}
        {allFiles.length > 0 && (
          <div className="space-y-2">
            {allFiles.map((file) => {
              const fileName =
                file.file instanceof File ? file.file.name : file.file.name;
              const fileSize =
                file.file instanceof File ? file.file.size : file.file.size;

              return (
                <div
                  key={file.id}
                  className="bg-background flex flex-col gap-1 rounded-lg border p-2 pe-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                        {getFileIcon({ file: file.file })}
                      </div>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <p className="truncate text-[13px] font-medium">
                          {fileName}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatBytes(fileSize)}
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

                  {/* Show progress bar inside file box when this file is uploading */}
                  {file.isUploading && (
                    <div className="mt-2 mb-1">
                      {file.error ? (
                        <div className="text-destructive flex items-center gap-1 text-xs">
                          <AlertCircleIcon className="size-3 shrink-0" />
                          <span>{file.error}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-muted-foreground">
                              Uploading...
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">
                              {file.progress}%
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full transition-all duration-300 ease-out"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Remove all files button */}
            {allFiles.length > 1 && (
              <div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Clear all files safely
                    const fileIds = [
                      ...uploadingFiles.map((f) => f.id),
                      ...files.map((f) => f.id),
                    ];
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
    </FormItem>
  );
}
