"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import { FileUploader } from "./uploader";

type FileItem = {
  id: string;
  name: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  etag: string;
  url?: string;
};

export function StorageDemo() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setError(message);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(message);
      setError(null);
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setError(null);
      setSuccessMessage(null);
    }, 3000);
  };

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching files with prefix: "${prefix}"`);

      // Add skipCache=true to always get fresh data
      const response = await fetch(
        `/api/storage${prefix ? `?prefix=${prefix}` : ""}${prefix ? "&skipCache=true" : "?skipCache=true"}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }

      const data = await response.json();
      console.log(`Received ${data.files?.length || 0} files from API`);

      setFiles(data.files || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      showMessage("Failed to fetch files", true);
    } finally {
      setLoading(false);
    }
  }, [prefix]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    setError(null);

    try {
      // Track upload results
      const uploadResults = [];
      let failedCount = 0;

      // Process each file sequentially
      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("path", prefix);

          const response = await fetch("/api/storage", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            failedCount++;
            console.error(`Failed to upload file: ${file.name}`);
            continue;
          }

          // Get response data
          const uploadResult = await response.json();
          uploadResults.push(uploadResult);
          console.log("Upload result:", uploadResult); // Debug logging
        } catch (error) {
          failedCount++;
          console.error(`Error uploading file ${file.name}:`, error);
        }
      }

      // Display appropriate message based on results
      if (failedCount === 0) {
        showMessage(
          `Successfully uploaded ${files.length} file${files.length !== 1 ? "s" : ""}`
        );
      } else if (failedCount < files.length) {
        showMessage(
          `Uploaded ${files.length - failedCount} file${files.length - failedCount !== 1 ? "s" : ""}, but ${failedCount} failed`,
          true
        );
      } else {
        showMessage("Failed to upload all files", true);
      }

      // Always do a fresh fetch instead of trying to merge state
      fetchFiles();
    } catch (error) {
      console.error("Error in batch upload:", error);
      showMessage("Failed to process file uploads", true);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(
        `/api/storage?fileId=${encodeURIComponent(fileId)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      showMessage("File deleted successfully");

      // Remove from local state immediately
      setFiles(files.filter((file) => file.id !== fileId));

      // Refresh the entire list after a delay to get any other changes
      setTimeout(() => {
        fetchFiles();
      }, 500);
    } catch (error) {
      console.error("Error deleting file:", error);
      showMessage("Failed to delete file", true);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
    else return (bytes / 1073741824).toFixed(2) + " GB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>File Storage</CardTitle>
          <CardDescription>
            Upload and manage files using the Minio storage integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {successMessage}
              </div>
            )}

            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label
                  htmlFor="prefix"
                  className="text-sm font-medium mb-2 block"
                >
                  Folder Path (optional)
                </label>
                <Input
                  id="prefix"
                  placeholder="e.g., images/"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={fetchFiles} disabled={loading}>
                Refresh
              </Button>
            </div>

            <FileUploader onUpload={handleUpload} disabled={uploading} />

            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-6"
                        >
                          No files found
                        </TableCell>
                      </TableRow>
                    ) : (
                      files.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">
                            {file.url ? (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {file.name}
                              </a>
                            ) : (
                              file.name
                            )}
                          </TableCell>
                          <TableCell>{file.contentType}</TableCell>
                          <TableCell>{formatFileSize(file.size)}</TableCell>
                          <TableCell>{formatDate(file.uploadedAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(file.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {files.length} file{files.length !== 1 ? "s" : ""}
            {prefix && ` in ${prefix}`}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
