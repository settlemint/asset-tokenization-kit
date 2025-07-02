import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

interface Event {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
}

// Mock data for demonstration
const mockEvents: Event[] = [
  {
    id: "1",
    type: "Token Created",
    description: "New bond token created",
    timestamp: "2024-01-15T10:30:00Z",
    status: "completed",
  },
  {
    id: "2",
    type: "Transaction",
    description: "Token transfer completed",
    timestamp: "2024-01-15T09:15:00Z",
    status: "completed",
  },
  {
    id: "3",
    type: "Compliance Check",
    description: "KYC verification pending",
    timestamp: "2024-01-15T08:45:00Z",
    status: "pending",
  },
];

const columnHelper = createColumnHelper<Event>();

const createEventsColumns = () => [
  columnHelper.accessor("type", {
    header: "Event Type",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("description", {
    header: "Description",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("timestamp", {
    header: "Time",
    cell: (info) => {
      const date = new Date(info.getValue());
      return date.toLocaleString();
    },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue();
      const variant = status === "completed" ? "default" :
                    status === "pending" ? "secondary" : "destructive";
      return <Badge variant={variant}>{status}</Badge>;
    },
  }),
];

/**
 * Latest Events Table Component
 *
 * Displays recent platform events in a table format.
 * Currently shows mock data for demonstration purposes.
 */
export function LatestEventsTable() {
  const { t } = useTranslation("general");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.tables.latestEvents")}</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          name="events"
          data={mockEvents}
          columns={createEventsColumns}
          toolbar={{ enableToolbar: false }}
        />
      </CardContent>
    </Card>
  );
}