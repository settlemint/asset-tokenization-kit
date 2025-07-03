import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createColumnHelper } from "@tanstack/react-table";
import { CheckCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Action {
  id: string;
  type: string;
  description: string;
  requester: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
}

// Mock data for demonstration
const mockActions: Action[] = [
  {
    id: "1",
    type: "Token Approval",
    description: "Bond token awaiting compliance approval",
    requester: "0x1234...5678",
    priority: "high",
    createdAt: "2024-01-15T08:30:00Z",
  },
  {
    id: "2",
    type: "KYC Review",
    description: "User verification pending review",
    requester: "0x9876...4321",
    priority: "medium",
    createdAt: "2024-01-15T07:15:00Z",
  },
  {
    id: "3",
    type: "System Update",
    description: "Factory upgrade request",
    requester: "System",
    priority: "low",
    createdAt: "2024-01-15T06:45:00Z",
  },
];

const columnHelper = createColumnHelper<Action>();

const createActionsColumns = () => [
  columnHelper.accessor("type", {
    header: "Action Type",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("description", {
    header: "Description",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("requester", {
    header: "Requester",
    cell: (info) => (
      <span className="font-mono text-sm">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("priority", {
    header: "Priority",
    cell: (info) => {
      const priority = info.getValue();
      const variant =
        priority === "high"
          ? "destructive"
          : priority === "medium"
            ? "default"
            : "secondary";
      return <Badge variant={variant}>{priority}</Badge>;
    },
  }),
  columnHelper.accessor("createdAt", {
    header: "Created",
    cell: (info) => {
      const date = new Date(info.getValue());
      return date.toLocaleDateString();
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: () => (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <CheckCircle className="h-4 w-4" />
          Approve
        </Button>
        <Button variant="ghost" size="sm">
          <Clock className="h-4 w-4" />
          Review
        </Button>
      </div>
    ),
  }),
];

/**
 * Pending Actions Table Component
 *
 * Displays pending actions requiring admin attention in a table format.
 * Currently shows mock data for demonstration purposes.
 */
export function PendingActionsTable() {
  const { t } = useTranslation("general");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.tables.actions")}</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          name="actions"
          data={mockActions}
          columns={createActionsColumns}
          toolbar={{ enableToolbar: false }}
        />
      </CardContent>
    </Card>
  );
}
