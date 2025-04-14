"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRef, useState } from "react";

interface FileUploaderProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

export function FileUploader({
  onUpload,
  disabled = false,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Drag and drop a file here, or click to select
          </p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={disabled}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            Select File
          </Button>
        </div>
      </div>

      {selectedFile && (
        <Card className="p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(selectedFile.size)} -{" "}
              {selectedFile.type || "Unknown type"}
            </p>
          </div>
          <Button onClick={handleUploadClick} disabled={disabled}>
            Upload
          </Button>
        </Card>
      )}
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
  else return (bytes / 1073741824).toFixed(2) + " GB";
}
