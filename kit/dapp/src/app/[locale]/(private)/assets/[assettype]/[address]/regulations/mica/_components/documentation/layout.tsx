"use client";

import { uploadDocumentAction } from "@/app/actions/upload-document";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MicaDocument } from "@/lib/queries/regulations/mica-documents";
import { Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DocumentsTable } from "./documents-table";

export function DocumentationLayout() {
  const params = useParams();
  const assetAddress = params.address as string;
  const [documents, setDocuments] = useState<MicaDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch documents
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents/mica/${assetAddress}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        toast.error("Failed to fetch documents");
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to fetch documents");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleUpload = async (formData: FormData) => {
    setIsUploading(true);
    try {
      // Add asset address to the form data
      formData.append("assetAddress", assetAddress);

      // Set document type to mica
      formData.append("type", "mica");

      const result = await uploadDocumentAction(formData);

      if (result?.data) {
        toast.success("Document uploaded successfully");
        setIsDialogOpen(false);
        fetchDocuments(); // Refresh the documents list
      } else {
        toast.error("Failed to upload document");
      }
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(`Failed to upload document: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Upload form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    handleUpload(formData);
  };

  // Fetch documents on initial load
  useEffect(() => {
    fetchDocuments();
  }, [assetAddress]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documentation</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload MiCA Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter document title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="E.g., White Paper, Audit Report"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Document File</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading documents...</div>
        ) : (
          <DocumentsTable documents={documents} onRefresh={fetchDocuments} />
        )}
      </CardContent>
    </Card>
  );
}
