import {
  deleteFileFromMinio,
  uploadFileToMinio,
} from "@/app/actions/minio-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  UploadCloudIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  type FieldPath,
  type FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";

type UploadStatus = "pending" | "uploading" | "success" | "error" | "deleting";

interface ManagedFile {
  id: string;
  file: File;
  status: UploadStatus;
  progress?: number;
  error?: string;
  url?: string;
  objectName?: string;
}

interface UploadFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: any;
  name: TName;
  label: string;
  multiple?: boolean;
  maxSizeMB?: number;
  accept?: string;
  uploadPathPrefix?: string;
  className?: string;
  disabled?: boolean;
}

let fileCounter = 0;
const generateId = () => `managed-file-${fileCounter++}`;

export function UploadField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  multiple = false,
  maxSizeMB = 5,
  accept,
  uploadPathPrefix,
  className,
  disabled = false,
}: UploadFieldProps<TFieldValues, TName>) {
  const { field } = useController({ name, control });
  const { setError, clearErrors, getValues } = useFormContext();
  const [managedFiles, setManagedFiles] = useState<ManagedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploadingGlobal, setIsUploadingGlobal] = useState(false);
  const [isDeletingGlobal, setIsDeletingGlobal] = useState(false);

  const updateFileStatus = (
    id: string,
    status: UploadStatus,
    updates: Partial<ManagedFile> = {}
  ) => {
    setManagedFiles((prevFiles) =>
      prevFiles.map((mf) => (mf.id === id ? { ...mf, status, ...updates } : mf))
    );
    if (status === "success" || status === "error") {
      const stillProcessing = managedFiles.some(
        (mf) =>
          mf.id !== id &&
          (mf.status === "uploading" || mf.status === "deleting")
      );
      setIsUploadingGlobal(
        managedFiles.some((mf) => mf.id !== id && mf.status === "uploading")
      );
      setIsDeletingGlobal(
        managedFiles.some((mf) => mf.id !== id && mf.status === "deleting")
      );
    }
  };

  const addFilesToState = (files: File[]) => {
    const newManagedFiles: ManagedFile[] = files.map((file) => ({
      id: generateId(),
      file,
      status: "pending",
    }));

    if (multiple) {
      setManagedFiles((prev) => [...prev, ...newManagedFiles]);
    } else {
      const existingUrls = managedFiles.filter((f) => f.url).map((f) => f.url);
      existingUrls.forEach((url) => updateFormFieldValue(url, true));
      setManagedFiles(newManagedFiles);
    }
    return newManagedFiles;
  };

  const removeFileFromState = (id: string, updateForm: boolean = false) => {
    let removedFileUrl: string | undefined;
    setManagedFiles((prevFiles) => {
      const fileToRemove = prevFiles.find((f) => f.id === id);
      removedFileUrl = fileToRemove?.url;
      return prevFiles.filter((mf) => mf.id !== id);
    });

    if (updateForm && removedFileUrl) {
      updateFormFieldValue(removedFileUrl, true);
    }
    if (!managedFiles.some((mf) => mf.id !== id && mf.status === "deleting")) {
      setIsDeletingGlobal(false);
    }
  };

  const updateFormFieldValue = (
    newUrl: string | undefined,
    isRemoval: boolean = false
  ) => {
    const currentVal = getValues(name);
    if (multiple) {
      const currentValues = Array.isArray(currentVal) ? currentVal : [];
      let updatedValues;
      if (isRemoval) {
        updatedValues = currentValues.filter((url) => url !== newUrl);
      } else if (newUrl) {
        updatedValues = [...currentValues, newUrl];
      } else {
        updatedValues = currentValues;
      }
      field.onChange(updatedValues);
    } else {
      field.onChange(isRemoval ? undefined : newUrl);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;

    clearErrors(name);

    let validationError = false;

    if (!multiple && files.length > 1) {
      setError(name, {
        type: "manual",
        message: "Only one file can be uploaded.",
      });
      validationError = true;
    }
    if (
      !multiple &&
      managedFiles.some(
        (f) => f.status === "success" || f.status === "uploading"
      )
    ) {
      setError(name, {
        type: "manual",
        message: "Please remove the existing file before uploading a new one.",
      });
      validationError = true;
    }

    const validFiles = files.filter((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(name, {
          type: "manual",
          message: `File "${file.name}" exceeds the size limit of ${maxSizeMB}MB.`,
        });
        validationError = true;
        return false;
      }
      return true;
    });

    if (validationError) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const newManagedFiles = addFilesToState(validFiles);
    if (newManagedFiles.length > 0) {
      setIsUploadingGlobal(true);
    }

    await Promise.all(
      newManagedFiles.map(async (mf) => {
        if (mf.status === "pending") {
          updateFileStatus(mf.id, "uploading");
          try {
            const args = {
              file: mf.file,
              maxSizeMB: maxSizeMB,
              uploadPathPrefix: uploadPathPrefix,
            };

            const result = await uploadFileToMinio(args);

            if (result.success) {
              console.log(`Upload success for ${mf.file.name}:`, result);
              updateFileStatus(mf.id, "success", {
                url: result.fileUrl,
                objectName: result.objectName,
                error: undefined,
              });
              updateFormFieldValue(result.fileUrl);
            } else {
              console.error(`Upload error for ${mf.file.name}:`, result.error);
              updateFileStatus(mf.id, "error", {
                error: result.error || "Upload failed.",
              });
            }
          } catch (error) {
            console.error(`Upload execution error for ${mf.file.name}:`, error);
            const message =
              error instanceof Error ? error.message : "Unknown upload error";
            updateFileStatus(mf.id, "error", { error: message });
          }
        }
      })
    );

    if (inputRef.current) inputRef.current.value = "";
    if (!managedFiles.some((mf) => mf.status === "uploading")) {
      setIsUploadingGlobal(false);
    }
  };

  const handleRemoveFile = async (id: string) => {
    const fileToRemove = managedFiles.find((f) => f.id === id);
    if (!fileToRemove || fileToRemove.status === "deleting") return;

    if (fileToRemove.status === "success" && fileToRemove.objectName) {
      setIsDeletingGlobal(true);
      updateFileStatus(id, "deleting");
      try {
        const args = { objectName: fileToRemove.objectName };
        const result = await deleteFileFromMinio(args);

        if (result.success) {
          console.log("Delete success:", result.message);
          removeFileFromState(id, true);
        } else {
          console.error("Delete error:", result.error);
          updateFileStatus(fileToRemove.id, "success", {
            error: result.error || "Failed to delete file.",
          });
          setIsDeletingGlobal(false);
        }
      } catch (error) {
        console.error("Delete execution error:", error);
        const message =
          error instanceof Error ? error.message : "Unknown delete error";
        updateFileStatus(fileToRemove.id, "success", { error: message });
        setIsDeletingGlobal(false);
      }
    } else {
      removeFileFromState(id, false);
    }
  };

  useEffect(() => {
    return () => {
      clearErrors(name);
    };
  }, [name, clearErrors]);

  const isLoading = isUploadingGlobal || isDeletingGlobal;
  const canAddNewFile =
    !disabled &&
    !isLoading &&
    (multiple ||
      !managedFiles.some(
        (f) => f.status === "success" || f.status === "uploading"
      ));

  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={name}
        className={cn({
          "text-destructive": !!control._formState.errors[name],
        })}
      >
        {label}
      </Label>
      <div className="flex items-center space-x-2">
        <Input
          id={name}
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={!canAddNewFile}
          className="flex-grow"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => inputRef.current?.click()}
          disabled={!canAddNewFile}
          aria-label="Select file"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UploadCloudIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
      {control._formState.errors[name] &&
        typeof control._formState.errors[name]?.message === "string" && (
          <p className="text-sm text-destructive">
            {control._formState.errors[name]?.message}
          </p>
        )}

      {managedFiles.length > 0 && (
        <div className="mt-2 space-y-2">
          {managedFiles.map((mf) => (
            <div
              key={mf.id}
              className="flex items-center justify-between space-x-2 rounded-md border p-2"
            >
              <div className="flex items-center space-x-2 overflow-hidden">
                {mf.status === "success" && (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                )}
                {mf.status === "error" && (
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
                )}
                {(mf.status === "uploading" || mf.status === "deleting") && (
                  <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin" />
                )}
                {mf.status === "pending" && (
                  <UploadCloudIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                )}

                <div className="flex-grow overflow-hidden">
                  <p className="truncate text-sm font-medium">{mf.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(mf.file.size / 1024 / 1024).toFixed(2)} MB - {mf.status}
                  </p>
                  {mf.status === "error" && mf.error && (
                    <p className="text-xs text-destructive">{mf.error}</p>
                  )}
                  {mf.status === "uploading" && (
                    <Progress value={50} className="h-1 w-full" />
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFile(mf.id)}
                disabled={mf.status === "deleting" || mf.status === "uploading"}
                aria-label="Remove file"
              >
                {mf.status === "deleting" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
