"use client";

import { deleteDocumentAction } from "@/app/actions/delete-document";
import { PDFViewer } from "@/components/blocks/pdf-viewer";
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
  Eye,
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
function formatDocumentType(
  type: string,
  fileName: string,
  category?: string
): string {
  // Create a mapping of document types to proper display names
  const typeMapping: Record<string, string> = {
    audit: "Audit Report",
    whitepaper: "White Paper",
    mica: "MiCA Compliance",
    compliance: "Compliance Document",
    legal: "Legal Document",
    governance: "Governance Document",
    policy: "Policy Document",
    procedure: "Procedure Document",
    general: "General Document",
    // Add more specific types
    financial: "Financial Report",
    risk: "Risk Assessment",
    technical: "Technical Documentation",
    regulatory: "Regulatory Document",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    security: "Security Document",
    operational: "Operational Document",
    business: "Business Document",
  };

  const lowerType = type.toLowerCase();
  const lowerFileName = fileName.toLowerCase();
  const lowerCategory = category?.toLowerCase() || "";

  // First check the category field if available
  if (category && typeMapping[lowerCategory]) {
    return typeMapping[lowerCategory];
  }

  // Check if we have a direct mapping for the type (only for meaningful types)
  if (typeMapping[lowerType]) {
    return typeMapping[lowerType];
  }

  // Always try to infer from filename first, regardless of the type field
  // Check for specific patterns in filename
  if (lowerFileName.includes("audit")) return "Audit Report";
  if (
    lowerFileName.includes("whitepaper") ||
    lowerFileName.includes("white_paper") ||
    lowerFileName.includes("white-paper")
  )
    return "White Paper";
  if (lowerFileName.includes("compliance")) return "Compliance Document";
  if (lowerFileName.includes("legal")) return "Legal Document";
  if (lowerFileName.includes("governance")) return "Governance Document";
  if (lowerFileName.includes("policy")) return "Policy Document";
  if (lowerFileName.includes("procedure")) return "Procedure Document";
  if (lowerFileName.includes("financial") || lowerFileName.includes("finance"))
    return "Financial Report";
  if (lowerFileName.includes("risk")) return "Risk Assessment";
  if (lowerFileName.includes("technical") || lowerFileName.includes("tech"))
    return "Technical Documentation";
  if (
    lowerFileName.includes("regulatory") ||
    lowerFileName.includes("regulation")
  )
    return "Regulatory Document";
  if (
    lowerFileName.includes("terms") ||
    lowerFileName.includes("t&c") ||
    lowerFileName.includes("tos")
  )
    return "Terms & Conditions";
  if (lowerFileName.includes("privacy")) return "Privacy Policy";
  if (lowerFileName.includes("security")) return "Security Document";
  if (
    lowerFileName.includes("operational") ||
    lowerFileName.includes("operations")
  )
    return "Operational Document";
  if (lowerFileName.includes("business")) return "Business Document";
  if (lowerFileName.includes("mica")) return "MiCA Compliance";

  // Check category even if not in mapping - format it nicely
  if (
    category &&
    lowerCategory !== "general" &&
    lowerCategory !== "pdf" &&
    lowerCategory !== "document" &&
    lowerCategory !== "docx" &&
    lowerCategory !== "doc" &&
    lowerCategory !== "file"
  ) {
    return (
      category.charAt(0).toUpperCase() + category.slice(1).replace(/[_-]/g, " ")
    );
  }

  // If the type is meaningful but not in our mapping, format it nicely
  if (
    lowerType !== "pdf" &&
    lowerType !== "document" &&
    lowerType !== "docx" &&
    lowerType !== "doc" &&
    lowerType !== "file" &&
    lowerType !== "xlsx" &&
    lowerType !== "xls" &&
    lowerType !== "pptx" &&
    lowerType !== "ppt" &&
    lowerType !== "other"
  ) {
    // This is likely a meaningful document type, format it nicely
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/[_-]/g, " ");
  }

  // Only use file extension as absolute last resort
  if (lowerFileName.endsWith(".pdf")) return "PDF Document";
  if (lowerFileName.endsWith(".docx") || lowerFileName.endsWith(".doc"))
    return "Word Document";
  if (lowerFileName.endsWith(".xlsx") || lowerFileName.endsWith(".xls"))
    return "Spreadsheet";
  if (lowerFileName.endsWith(".pptx") || lowerFileName.endsWith(".ppt"))
    return "Presentation";

  // Final fallback
  return "Document";
}

// Get the appropriate icon based on document type
function getDocumentIcon(type: string, fileName: string, category?: string) {
  // Check category first since it's likely more meaningful
  if (category) {
    switch (category.toLowerCase()) {
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
      case "financial":
        return <FileText className="h-5 w-5 text-emerald-600" />;
      case "risk":
        return <FileText className="h-5 w-5 text-red-600" />;
      case "technical":
        return <FileText className="h-5 w-5 text-indigo-600" />;
    }
  }

  // Then check document type
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
  regulationId: string;
  canEdit: boolean;
}

function DocumentActions({
  document,
  regulationId,
  canEdit,
}: DocumentActionsProps) {
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useTranslations("regulations.mica.documents");

  // Check if the document is a PDF
  const isPDF =
    document.url?.toLowerCase().includes(".pdf") ||
    document.fileName?.toLowerCase().endsWith(".pdf");

  const handleViewPDF = () => {
    if (!document.url || !isPDF) return;
    setIsPDFViewerOpen(true);
  };

  // Handle document download
  const handleDownload = () => {
    if (!document.url) return;
    window.open(document.url, "_blank");
  };

  // Handle document deletion - both from MinIO and database
  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteDocumentAction({
        objectName: document.id,
        documentType: "mica",
        fileName: document.fileName,
      });

      if (result?.data?.success) {
        toast.success("Document deleted successfully", {
          description: `${document.fileName} has been deleted successfully.`,
        });
        // Note: The parent component should handle refreshing the data
        // through its own state management or data fetching
      } else {
        toast.error("Failed to delete document", {
          description: result?.data?.error || "Failed to delete the document.",
        });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document", {
        description:
          "An unexpected error occurred while deleting the document.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        {/* PDF Viewer Button - only show for PDF files */}
        {isPDF && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleViewPDF}
            title="View PDF"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}

        <Button
          size="icon"
          variant="ghost"
          onClick={handleDownload}
          title={t("table.download")}
        >
          <Download className="h-4 w-4" />
        </Button>

        {canEdit && (
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
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? t("table.deleting") : t("table.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* PDF Viewer Dialog */}
      {isPDF && (
        <PDFViewer
          isOpen={isPDFViewerOpen}
          onClose={() => setIsPDFViewerOpen(false)}
          fileUrl={document.url}
          fileName={document.fileName}
        />
      )}
    </>
  );
}

export function DocumentsTableColumns(regulationId: string, canEdit: boolean) {
  const t = useTranslations("regulations.mica.documents");

  return [
    columnHelper.accessor("title", {
      header: t("table.document"),
      cell: ({ row }) => {
        const document = row.original;
        return (
          <div className="flex items-center gap-2">
            {getDocumentIcon(
              document.type,
              document.fileName,
              document.category
            )}
            <div>
              <div className="font-medium">{document.title}</div>
              <div className="text-xs text-muted-foreground">
                {formatBytes(document.size)}
              </div>
              {document.description && (
                <div className="text-xs text-muted-foreground mt-1">
                  {document.description}
                </div>
              )}
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
            {formatDocumentType(
              document.type,
              document.fileName,
              document.category
            )}
          </Badge>
        );
      },
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta(
        (row) => formatDocumentType(row.type, row.fileName, row.category),
        {
          displayName: t("table.type"),
          icon: FileText,
          type: "text",
        }
      ),
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
          <DocumentActions
            document={row.original}
            regulationId={regulationId}
            canEdit={canEdit}
          />
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
