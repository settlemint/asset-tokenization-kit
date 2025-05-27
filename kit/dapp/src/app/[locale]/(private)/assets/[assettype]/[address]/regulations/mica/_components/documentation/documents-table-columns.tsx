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
import { defineMeta, filterFn } from "@/lib/filters";
import type { MicaDocument } from "@/lib/queries/regulations/mica-documents";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
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

const columnHelper = createColumnHelper<MicaDocument>();

/**
 * Formats file size in bytes to human readable format
 */
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
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

// Get the appropriate icon based on document type
function getDocumentIcon(type: string, fileName: string) {
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
}

// Get the appropriate status icon and color
function getStatusIndicator(status: string) {
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
}

// Document actions component
interface DocumentActionsProps {
  document: MicaDocument;
  onRefresh: () => void;
}

function DocumentActions({ document, onRefresh }: DocumentActionsProps) {
  const t = useTranslations("regulations.mica.documents");
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle document download
  const handleDownload = () => {
    if (!document.url) return;
    window.open(document.url, "_blank");
  };

  // Handle document deletion
  const handleDelete = async () => {
    setIsDeleting(true);

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
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={handleDownload}
        title={t("table.download")}
      >
        <Download className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" title={t("table.more_options")}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? t("table.deleting") : t("table.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function DocumentsTableColumns(onRefresh: () => void) {
  const t = useTranslations("regulations.mica.documents");

  return [
    columnHelper.accessor("title", {
      header: t("table.document"),
      cell: ({ row }) => {
        const document = row.original;
        return (
          <div className="flex items-center gap-2">
            {getDocumentIcon(document.type, document.fileName)}
            <div>
              <div className="font-medium">{document.title}</div>
              <div className="text-xs text-muted-foreground">
                {formatBytes(document.size)}
              </div>
            </div>
          </div>
        );
      },
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.title, {
        displayName: t("table.document"),
        icon: FileText,
        type: "text",
      }),
    }),

    columnHelper.accessor("type", {
      header: t("table.type"),
      cell: ({ row }) => {
        const document = row.original;
        return (
          <Badge variant="outline">
            {formatDocumentType(document.type, document.fileName)}
          </Badge>
        );
      },
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => formatDocumentType(row.type, row.fileName), {
        displayName: t("table.type"),
        icon: FileText,
        type: "text",
      }),
    }),

    columnHelper.accessor("uploadDate", {
      header: t("table.date"),
      cell: ({ getValue }) => {
        return formatDate(new Date(getValue()), { type: "absolute" });
      },
      enableColumnFilter: true,
      filterFn: filterFn("date"),
      meta: defineMeta((row) => row.uploadDate, {
        displayName: t("table.date"),
        icon: Clock,
        type: "date",
      }),
    }),

    columnHelper.accessor("status", {
      header: t("table.status"),
      cell: ({ getValue }) => {
        return getStatusIndicator(getValue());
      },
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => row.status, {
        displayName: t("table.status"),
        icon: Check,
        type: "option",
        options: [
          { label: "Approved", value: "approved" },
          { label: "Pending", value: "pending" },
          { label: "Rejected", value: "rejected" },
        ],
      }),
    }),

    columnHelper.display({
      id: "actions",
      header: t("table.actions"),
      cell: ({ row }) => {
        return (
          <DocumentActions document={row.original} onRefresh={onRefresh} />
        );
      },
      meta: {
        displayName: t("table.actions"),
        icon: MoreHorizontal,
        type: "text",
        enableCsvExport: false,
      },
    }),
  ];
}
