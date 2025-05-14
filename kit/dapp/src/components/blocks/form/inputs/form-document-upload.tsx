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
import { useEffect, useRef, useState } from "react";
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

// Type for tracking upload progress
type UploadProgress = {
  fileName: string;
  progress: number;
  error?: string;
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

  // Track currently uploading files with progress
  const [uploadingFiles, setUploadingFiles] = useState<UploadProgress[]>([]);

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
    onFilesChange: () => {
      /* This callback is now handled by the useEffect below */
    },
  });

  // Effect to sync successfully uploaded files back to the React Hook Form field
  useEffect(() => {
    // Only update the form if files are not currently being processed (e.g., uploading)
    if (!processingFilesRef.current) {
      const uploadedDocs = files // 'files' is the current state from useFileUpload
        .filter(
          (fileWithPreview) =>
            !(fileWithPreview.file instanceof File) && fileWithPreview.file // Ensure it's uploaded metadata
        )
        .map((fileWithPreview) => {
          const fileData = fileWithPreview.file as UploadedDocument; // Type assertion for clarity
          return {
            id: fileData.id || fileWithPreview.id, // Fallback to fileWithPreview.id if needed
            name: fileData.name,
            url: fileData.url,
            size: fileData.size,
            type: fileData.type,
            objectName: fileData.objectName, // Assumes objectName is on fileData
            uploadedAt: fileData.uploadedAt || new Date().toISOString(),
            title: fileData.title || fileData.name,
            description: fileData.description || "",
          } as UploadedDocument;
        });

      // To prevent unnecessary re-renders or potential loops,
      // compare current field value with the new docs before calling onChange.
      // JSON.stringify is a simple way for deep comparison of simple objects/arrays.
      if (JSON.stringify(field.value) !== JSON.stringify(uploadedDocs)) {
        field.onChange(uploadedDocs);
      }
    }
  }, [files, field.onChange]); // Rerun when files from useFileUpload or field.onChange changes
  // processingFilesRef.current is a ref, its change doesn't trigger useEffect directly,
  // but its value is checked inside. This is a common pattern.

  // Process newly added files
  const processNewFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0 || isUploading || disabled) return;

    try {
      processingFilesRef.current = true;
      setIsUploading(true);

      // Add files to the UI first, which gives them IDs
      const fileObjects = newFiles.map((file) => ({ file }));
      internalAddFiles(newFiles);

      // Initialize progress tracking for the files being uploaded
      const initialProgress: UploadProgress[] = newFiles.map((file) => ({
        fileName: file.name,
        progress: 0,
      }));

      setUploadingFiles(initialProgress);

      const uploadedFiles: UploadedDocument[] = [];

      for (const file of newFiles) {
        // Update progress to show upload starting
        setUploadingFiles((prev) =>
          prev.map((item) =>
            item.fileName === file.name ? { ...item, progress: 10 } : item
          )
        );

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name);
        formData.append("type", documentType);

        try {
          // Simulate progress updates while waiting for the server response
          let currentProgress = 10;
          const progressInterval = setInterval(() => {
            if (currentProgress < 90) {
              currentProgress += Math.floor(Math.random() * 10) + 5;
              currentProgress = Math.min(currentProgress, 90);

              setUploadingFiles((prev) =>
                prev.map((item) =>
                  item.fileName === file.name
                    ? { ...item, progress: currentProgress }
                    : item
                )
              );
            }
          }, 300);

          const uploadedFile = await uploadDocument(formData);

          // Clear the interval once the upload is complete
          clearInterval(progressInterval);

          if (uploadedFile) {
            uploadedFiles.push(uploadedFile);

            // Mark as completed with 100% progress
            setUploadingFiles((prev) =>
              prev.map((item) =>
                item.fileName === file.name ? { ...item, progress: 100 } : item
              )
            );
          } else {
            // Handle failure case
            setUploadingFiles((prev) =>
              prev.map((item) =>
                item.fileName === file.name
                  ? { ...item, error: "Upload failed" }
                  : item
              )
            );
          }
        } catch (error) {
          console.error("Error uploading file:", error);

          // Update progress with error
          setUploadingFiles((prev) =>
            prev.map((item) =>
              item.fileName === file.name
                ? {
                    ...item,
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : item
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

        // Find and remove the original File objects that were added at the beginning
        const filesToRemove = files.filter(
          (f) =>
            f.file instanceof File &&
            uploadedFiles.some((u) => u.name === (f.file as File).name)
        );

        // Remove the temporary file objects
        filesToRemove.forEach((f) => internalRemoveFile(f.id));

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

      // Remove upload progress indicators after a short delay
      setTimeout(() => {
        setUploadingFiles([]);
      }, 2000);
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
          console.log(`Deleting file from storage: ${objectName}`);
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
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => {
              // For File objects (being uploaded), check if there's progress info
              const fileName =
                file.file instanceof File ? file.file.name : file.file.name;
              const fileProgress = uploadingFiles.find(
                (p) => p.fileName === fileName
              );
              const isUploading = fileProgress !== undefined;

              return (
                <div
                  key={file.id}
                  className="bg-background flex flex-col gap-1 rounded-lg border p-2 pe-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                        {getFileIcon(file)}
                      </div>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <p className="truncate text-[13px] font-medium">
                          {fileName}
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

                  {/* Show progress bar or error directly in the file item */}
                  {fileProgress && (
                    <>
                      {fileProgress.error ? (
                        <div className="text-destructive mt-1 flex items-center gap-1 text-xs">
                          <AlertCircleIcon className="size-3 shrink-0" />
                          <span>{fileProgress.error}</span>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                            <div
                              className="bg-primary h-full transition-all duration-300 ease-out"
                              style={{ width: `${fileProgress.progress}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground w-10 text-xs tabular-nums">
                            {fileProgress.progress}%
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

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
