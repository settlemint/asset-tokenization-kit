"use client";

import { testMinioDelete, testMinioList } from "@/app/actions/test-minio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function TestMinioPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletePath, setDeletePath] = useState("");

  const listFiles = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await testMinioList();

      if (result.success) {
        setFiles(result.objects || []);
        setSuccess(`Found ${result.count} files in bucket: ${result.bucket}`);
      } else {
        setError(`Failed to list files: ${result.error}`);
      }
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (path: string) => {
    if (!path) {
      setError("Please enter a path to delete");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await testMinioDelete(path);

      if (result.success) {
        setSuccess(`Successfully deleted: ${path}`);
        // Refresh the file list
        listFiles();
      } else {
        setError(`Failed to delete file: ${result.error}`);
      }
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteByAPI = async (path: string) => {
    if (!path) {
      setError("Please enter a path to delete");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/test-minio-delete?path=${encodeURIComponent(path)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess(`Successfully deleted via API: ${path}`);
        // Refresh the file list
        listFiles();
      } else {
        setError(`Failed to delete file via API: ${result.error}`);
      }
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MinIO Test Page</h1>

      <div className="space-y-4">
        <Button onClick={listFiles} disabled={loading}>
          {loading ? "Loading..." : "List Files"}
        </Button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded">
            {success}
          </div>
        )}

        <div className="flex space-x-2">
          <Input
            placeholder="Path to delete (e.g., regulations/mica/file.pdf)"
            value={deletePath}
            onChange={(e) => setDeletePath(e.target.value)}
          />
          <Button
            variant="destructive"
            onClick={() => deleteFile(deletePath)}
            disabled={loading || !deletePath}
          >
            Delete (Server Action)
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDeleteByAPI(deletePath)}
            disabled={loading || !deletePath}
          >
            Delete (API)
          </Button>
        </div>

        <div className="border rounded p-4 max-h-96 overflow-auto">
          <h2 className="text-lg font-semibold mb-2">
            Files in MinIO ({files.length})
          </h2>
          {files.length === 0 ? (
            <p>No files found or not loaded yet.</p>
          ) : (
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span>{file}</span>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteFile(file)}
                      disabled={loading}
                    >
                      Delete (Server)
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteByAPI(file)}
                      disabled={loading}
                    >
                      Delete (API)
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
