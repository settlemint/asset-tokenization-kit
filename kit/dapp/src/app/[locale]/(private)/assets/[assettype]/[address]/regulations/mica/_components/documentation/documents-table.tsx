"use client";

import { deleteDocumentAction } from "@/app/actions/delete-document";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MicaDocument } from "@/lib/queries/regulations/mica-documents";
import { format } from "date-fns";
import {
  Check,
  Clock,
  Download,
  FileIcon,
  FileText,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DocumentsTableProps {
  documents: MicaDocument[];
  onRefresh: () => void;
}

/**
 * Formats a number of bytes into a human-readable string
 */
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function DocumentsTable({ documents, onRefresh }: DocumentsTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Get the appropriate icon based on document type
  const getDocumentIcon = (type: string, status: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-5 w-5 text-destructive" />;
      case "document":
      case "docx":
        return <FileText className="h-5 w-5 text-primary" />;
      default:
        return <FileIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Get the appropriate status icon and color
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-success text-success-foreground">
            <Check className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  // Handle document download
  const handleDownload = (document: MicaDocument) => {
    if (!document.url) return;

    // Create an anchor element and click it to trigger download
    const link = document.url;
    window.open(link, "_blank");
  };

  // Handle document deletion
  const handleDelete = async (document: MicaDocument) => {
    setIsDeleting(document.id);

    try {
      const result = await deleteDocumentAction({
        objectName: document.id,
        documentType: "mica",
      });

      if (result?.data) {
        toast.success("Document deleted successfully");
        onRefresh(); // Refresh the documents list
      } else {
        toast.error(`Failed to delete document`);
      }
    } catch (error: any) {
      toast.error(`Error deleting document: ${error.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  // If there are no documents, show a message
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No documents found. Upload documents for MiCA compliance verification.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell className="flex items-center gap-2">
                {getDocumentIcon(document.type, document.status)}
                <div>
                  <div className="font-medium">{document.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatBytes(document.size)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{document.type}</Badge>
              </TableCell>
              <TableCell>
                {format(new Date(document.uploadDate), "MMM d, yyyy")}
              </TableCell>
              <TableCell>{getStatusIndicator(document.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDownload(document)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" title="More options">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(document)}
                        disabled={isDeleting === document.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting === document.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
