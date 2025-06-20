"use client";

import { useState } from "react";
import { toast } from "sonner";

interface DocumentUploadProps {
  onSelect: (file: File) => void;
  acceptedFileTypes: ("application/pdf" | "text/csv")[];
}

export function DocumentUpload({
  onSelect,
  acceptedFileTypes,
}: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      if (
        !acceptedFileTypes.includes(file.type as "application/pdf" | "text/csv")
      ) {
        toast.error(`Only ${acceptedFileTypes.join(", ")} files are accepted.`);
        return;
      }

      setSelectedFile(file);
      onSelect(file);
    }
  };

  return (
    <div className="grid w-full items-center gap-1.5">
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
          accept={acceptedFileTypes.join(",")}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Accepted format:{" "}
        {acceptedFileTypes.length > 1
          ? acceptedFileTypes.map((type) => type.split("/")[1]).join(", ")
          : acceptedFileTypes}{" "}
        (Max: 10MB)
      </p>
    </div>
  );
}
