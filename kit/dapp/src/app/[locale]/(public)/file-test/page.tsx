"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export default function FileTestPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletePath, setDeletePath] = useState("");
  const [message, setMessage] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("regulations");

  // Fetch files on load
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/diagnostics/minio-files");
      const data = await response.json();

      if (data.success) {
        setFiles(data.files || []);
      } else {
        setMessage(`Error fetching files: ${data.error}`);
      }
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteByPath = async () => {
    if (!deletePath) {
      setMessage("Please enter a path to delete");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/diagnostics/delete-file-by-path?path=${encodeURIComponent(deletePath)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      setMessage(`Delete result: ${JSON.stringify(data)}`);

      // Refresh the file list
      fetchFiles();
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadFile) {
      setMessage("Please select a file to upload");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadFile.name);
      formData.append("description", "Test upload");
      formData.append("type", uploadType);

      const response = await fetch("/api/diagnostics/upload-test", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setMessage(`Upload result: ${JSON.stringify(data)}`);

      // Refresh the file list
      fetchFiles();
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
      setUploadFile(null);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">File Upload and Deletion Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  File Type
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                >
                  <option value="regulations">Regulations</option>
                  <option value="mica">MICA</option>
                  <option value="legal">Legal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Select File
                </label>
                <Input
                  type="file"
                  onChange={(e) =>
                    e.target.files && setUploadFile(e.target.files[0])
                  }
                />
              </div>

              <Button type="submit" disabled={loading || !uploadFile}>
                Upload File
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* File Deletion Section */}
        <Card>
          <CardHeader>
            <CardTitle>Delete File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  File Path
                </label>
                <Input
                  value={deletePath}
                  onChange={(e) => setDeletePath(e.target.value)}
                  placeholder="e.g., regulations/mica/file.pdf"
                />
              </div>

              <Button
                onClick={handleDeleteByPath}
                disabled={loading || !deletePath}
                variant="destructive"
              >
                Delete File
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Message */}
      {message && (
        <div className="p-4 border rounded bg-gray-50">
          <pre className="whitespace-pre-wrap">{message}</pre>
        </div>
      )}

      {/* File List */}
      <Card>
        <CardHeader>
          <CardTitle>Files in Storage ({files.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : files.length > 0 ? (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="p-2 border rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      Size: {Math.round(file.size / 1024)} KB | Modified:{" "}
                      {new Date(file.lastModified).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setDeletePath(file.name);
                      handleDeleteByPath();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p>No files found</p>
          )}

          <div className="mt-4">
            <Button onClick={fetchFiles} variant="outline">
              Refresh File List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
