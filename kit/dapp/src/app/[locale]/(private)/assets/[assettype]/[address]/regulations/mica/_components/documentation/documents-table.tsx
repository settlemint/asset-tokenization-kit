"use client";

import { DataTable } from "@/components/blocks/data-table/data-table";
import type { MicaDocument } from "@/lib/queries/regulations/mica-documents";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { DocumentsTableColumns } from "./documents-table-columns";

interface DocumentsTableProps {
  documents: MicaDocument[];
  onRefresh: () => void;
  regulationId?: string;
}

export function DocumentsTable({
  documents,
  onRefresh,
  regulationId = "",
}: DocumentsTableProps) {
  const t = useTranslations("regulations.mica.documents");

  return (
    <DataTable
      columns={() => DocumentsTableColumns(onRefresh, regulationId)}
      data={documents}
      name="documents"
      initialSorting={[{ id: "uploadDate", desc: true }]}
      initialPageSize={5}
      toolbar={{
        enableToolbar: true,
      }}
      pagination={{
        enablePagination: true,
      }}
      customEmptyState={{
        icon: FileText,
        title: "No documents found",
        description: "Upload documents to get started with MiCA compliance.",
      }}
    />
  );
}
