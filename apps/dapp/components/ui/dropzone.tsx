"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import {
  CheckIcon,
  CloudUploadIcon,
  FileIcon,
  FileSymlinkIcon,
  FileTextIcon,
  ImageIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import ReactDropzone from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "./../hooks/use-toast";
import { Badge } from "./badge";

interface DropzoneProps {
  label: string;
  name: string;
  uploadDir?: string;
  accept?: {
    images: Array<".jpg" | ".jpeg" | ".png" | ".webp">;
    text: Array<".pdf" | ".docx" | ".doc" | ".txt" | ".md" | ".csv" | ".xls" | ".xlsx">;
  };
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
}

type Action = {
  file: File;
  file_name: string;
  file_size: number;
  from: string;
  to: string | null;
  file_type: string;
  isUploading?: boolean;
  isUploaded?: boolean;
  is_error?: boolean;
  url?: string;
  output?: File;
};

function bytesToSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / 1024 ** i).toFixed(2);
  return `${size} ${sizes[i]}`;
}

function truncateFileName(fileName: string): string {
  const maxSubstrLength = 18;
  if (fileName.length > maxSubstrLength) {
    const fileNameWithoutExtension = fileName.split(".").slice(0, -1).join(".");
    const fileExtension = fileName.split(".").pop() ?? "";
    const charsToKeep = maxSubstrLength - (fileNameWithoutExtension.length + fileExtension.length + 3);
    const compressedFileName = `${fileNameWithoutExtension.substring(
      0,
      maxSubstrLength - fileExtension.length - 3,
    )}...${fileNameWithoutExtension.slice(-charsToKeep)}.${fileExtension}`;
    return compressedFileName;
  }
  return fileName.trim();
}

function fileToIcon(file_type: string): React.ReactNode {
  if (file_type.includes("application")) return <FileTextIcon />;
  if (file_type.includes("text")) return <FileTextIcon />;
  if (file_type.includes("image")) return <ImageIcon />;
  return <FileIcon />;
}

export function Dropzone({
  label,
  name,
  uploadDir,
  accept = { images: [".jpg", ".jpeg", ".png", ".webp"], text: [".pdf"] },
  maxSize,
  maxFiles,
  multiple = true,
}: DropzoneProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isHover, setIsHover] = useState<boolean>(false);
  const [_multiple, setMultiple] = useState<boolean>(Boolean(multiple));
  const [actions, setActions] = useState<Action[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [files, setFiles] = useState<Array<File>>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [uploadIds, setUploadIds] = useState<Record<string, string>>({});

  const reset = () => {
    setIsDone(false);
    setActions([]);
    setFiles([]);
    setIsReady(false);
  };

  const handleUpload = (files: Array<File>): void => {
    handleExitHover();
    setFiles(files);
    const temp: Action[] = [];
    for (const file of files) {
      temp.push({
        file_name: file.name,
        file_size: file.size,
        from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
        to: null,
        file_type: file.type,
        file,
        isUploaded: false,
        isUploading: true,
        is_error: false,
      });
    }
    setActions(temp);

    for (const file of files) {
      const formData = new FormData();
      formData.append(name, file);
      const id = uuidv4();
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/upload?id=${id}&name=${name}&uploadDir=${uploadDir ?? "uploads"}`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: progress,
          }));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setActions((prev) =>
            prev.map((action) =>
              action.file_name === file.name ? { ...action, isUploaded: true, isUploading: false } : action,
            ),
          );
          toast({
            title: "Success",
            description: `Upload file ${file.name} successfully`,
          });
        } else {
          setActions((prev) =>
            prev.map((action) =>
              action.file_name === file.name ? { ...action, is_error: true, isUploading: false } : action,
            ),
          );
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to upload ${file.name}`,
          });
        }
      };

      xhr.onerror = () => {
        setActions((prev) =>
          prev.map((action) =>
            action.file_name === file.name ? { ...action, is_error: true, isUploading: false } : action,
          ),
        );
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to upload ${file.name}`,
        });
      };

      xhr.send(formData);
    }
  };

  const handleHover = (): void => setIsHover(true);

  const handleExitHover = (): void => setIsHover(false);

  const updateAction = (file_name: string, to: string) => {
    setActions(
      actions.map((action): Action => {
        if (action.file_name === file_name) {
          console.log("FOUND");
          return {
            ...action,
            to,
          };
        }
        return action;
      }),
    );
  };

  const checkIsReady = useCallback((): void => {
    const tempIsReady = actions.every((action) => action.to);
    setIsReady(tempIsReady);
  }, [actions]);

  const deleteAction = (action: Action): void => {
    setActions(actions.filter((elt) => elt !== action));
    setFiles(files.filter((elt) => elt.name !== action.file_name));
  };

  useEffect(() => {
    if (!actions.length) {
      setIsDone(false);
      setFiles([]);
      setIsReady(false);
    } else {
      checkIsReady();
    }
  }, [actions, checkIsReady]);

  if (actions.length) {
    return (
      <div className="space-y-6">
        {actions.map((action: Action) => (
          <div
            key={action.file_name}
            className="overflow-hidden w-full py-4 space-y-2 lg:py-0 relative cursor-pointer rounded-xl border h-fit lg:h-20 px-4 lg:px-10 flex flex-wrap lg:flex-nowrap items-center justify-between"
          >
            {!isLoaded && <div className="h-full w-full -ml-10 cursor-pointer absolute rounded-xl" />}
            <div className="flex gap-4 items-center">
              <span className="text-2xl">{fileToIcon(action.file_type)}</span>
              <div className="flex items-center gap-1 w-96">
                <span className="text-md font-medium overflow-x-hidden">{truncateFileName(action.file_name)}</span>
                <span className="text-muted-foreground text-sm">({bytesToSize(action.file_size)})</span>
              </div>
            </div>

            {action.is_error ? (
              <Badge variant="destructive" className="flex gap-2">
                <span>Error Uploading File</span>
                <TriangleAlertIcon />
              </Badge>
            ) : action.isUploaded ? (
              <div>
                <CheckIcon />
              </div>
            ) : action.isUploading ? (
              <Badge variant="default" className="flex gap-2 bg-transparent">
                <span className="text-xs">{uploadProgress[action.file_name]}%</span>
              </Badge>
            ) : (
              <></>
            )}

            <button
              onClick={() => deleteAction(action)}
              className="ml-2 cursor-pointer hover:bg-muted rounded-full h-10 w-10 flex items-center justify-center text-2xl text-foreground"
              aria-label="Delete file"
              type="button"
            >
              <Cross2Icon />
            </button>
            {action.isUploading && (
              <span
                className="absolute bottom-0 left-0 inline-block h-1 bg-white"
                style={{ width: `${uploadProgress[action.file_name]}%` }}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <ReactDropzone
        onDrop={handleUpload}
        onDragEnter={handleHover}
        onDragLeave={handleExitHover}
        accept={{
          "image/*": accept.images,
          "text/*": accept.text,
        }}
        maxSize={maxSize}
        maxFiles={maxFiles}
        multiple={_multiple}
        onDropRejected={() => {
          handleExitHover();
          toast({
            variant: "destructive",
            title: "Error uploading your file(s)",
            description: "Allowed Files: Audio, Video and Images.",
            duration: 5000,
          });
        }}
        onError={() => {
          handleExitHover();
          toast({
            variant: "destructive",
            title: "Error uploading your file(s)",
            description: "Allowed Files: Audio, Video and Images.",
            duration: 5000,
          });
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            className=" bg-background h-72 lg:h-80 xl:h-40 rounded-3xl shadow-sm border-secondary border-2 border-dashed cursor-pointer flex items-center justify-center"
          >
            <input {...getInputProps()} name={name} multiple={_multiple} />
            <div className="space-y-4 text-foreground">
              {isHover ? (
                <>
                  <div className="justify-center flex text-6xl">
                    <FileSymlinkIcon />
                  </div>
                  <h3 className="text-center font-medium text-md">Yes, right here</h3>
                </>
              ) : (
                <>
                  <div className="justify-center flex text-6xl">
                    <CloudUploadIcon />
                  </div>
                  <h3 className="text-center font-medium text-md">{label}</h3>
                </>
              )}
            </div>
          </div>
        )}
      </ReactDropzone>
    </>
  );
}
