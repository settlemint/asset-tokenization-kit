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
import { useTranslations } from "next-intl";
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
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Formats the document type for display, ensuring we show meaningful
 * documentation types rather than file extensions
 */
function formatDocumentType(type: string, fileName: string): string {
  // If type is already a meaningful documentation type, return it
  const meaningfulTypes = [
    "audit",
    "whitepaper",
    "mica",
    "compliance",
    "legal",
    "governance",
    "policy",
    "procedure",
    "general",
  ];

  if (meaningfulTypes.includes(type.toLowerCase())) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  // If type appears to be a file extension, try to infer from fileName or provide a generic fallback
  if (
    type.toLowerCase() === "pdf" ||
    type.toLowerCase() === "document" ||
    type.toLowerCase() === "docx"
  ) {
    // Try to infer from file name patterns
    const lowerFileName = fileName.toLowerCase();
    if (lowerFileName.includes("audit")) return "Audit";
    if (
      lowerFileName.includes("whitepaper") ||
      lowerFileName.includes("white_paper")
    )
      return "Whitepaper";
    if (lowerFileName.includes("compliance")) return "Compliance";
    if (lowerFileName.includes("legal")) return "Legal";
    if (lowerFileName.includes("governance")) return "Governance";
    if (lowerFileName.includes("policy")) return "Policy";
    if (lowerFileName.includes("procedure")) return "Procedure";

    // Fallback to generic document type
    return "Document";
  }

  // For any other case, capitalize the first letter
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function DocumentsTable({ documents, onRefresh }: DocumentsTableProps) {
  const t = useTranslations("regulations.mica.documents");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Get the appropriate icon based on document type
  const getDocumentIcon = (type: string, fileName: string) => {
    // Check document category first
    switch (type.toLowerCase()) {
      case "audit":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "whitepaper":
        return <FileText className="h-5 w-5 text-green-600" />;
      case "mica":
      case "compliance":
      case "legal":
        return <FileText className="h-5 w-5 text-purple-600" />;
      case "governance":
      case "policy":
      case "procedure":
        return <FileText className="h-5 w-5 text-orange-600" />;
      default:
        // Fallback to file extension for icon only
        if (fileName.toLowerCase().endsWith(".pdf")) {
          return <FileText className="h-5 w-5 text-destructive" />;
        }
        if (
          fileName.toLowerCase().endsWith(".docx") ||
          fileName.toLowerCase().endsWith(".doc")
        ) {
          return <FileText className="h-5 w-5 text-primary" />;
        }
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
        toast.success(t("delete_success"));
        onRefresh(); // Refresh the documents list
      } else {
        toast.error(t("delete_error"));
      }
    } catch (error: any) {
      toast.error(`${t("delete_error")}: ${error.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  // If there are no documents, show a message
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("table.empty_state")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>{t("table.document")}</TableHead>
            <TableHead>{t("table.type")}</TableHead>
            <TableHead>{t("table.date")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead className="text-right">{t("table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell className="flex items-center gap-2">
                {getDocumentIcon(document.type, document.fileName)}
                <div>
                  <div className="font-medium">{document.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatBytes(document.size)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {formatDocumentType(document.type, document.fileName)}
                </Badge>
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
                    title={t("table.download")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        title={t("table.more_options")}
                      >
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
                        {isDeleting === document.id
                          ? t("table.deleting")
                          : t("table.delete")}
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
