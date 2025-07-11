import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type ActionStatus,
  type ActionType,
} from "@/orpc/routes/token/routes/token.actions.schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { formatDistance } from "date-fns";
import { CalendarIcon, UserIcon, AlertCircleIcon } from "lucide-react";
import { orpc } from "@/orpc";

interface ActionsListProps {
  tokenAddress: string;
  status?: ActionStatus;
  type?: ActionType;
  assignedTo?: string;
  limit?: number;
  offset?: number;
}

export function ActionsList({
  tokenAddress,
  status,
  type,
  assignedTo,
  limit = 50,
  offset = 0,
}: ActionsListProps) {
  const { t } = useTranslation(["actions", "common"]);

  const actionsQuery = useSuspenseQuery(
    orpc.token.actions.queryOptions({
      input: {
        tokenAddress,
        status,
        type,
        assignedTo,
        limit,
        offset,
      },
    })
  );

  const { actions, total } = actionsQuery.data;

  if (actions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircleIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {status === "PENDING"
            ? t("empty.pending")
            : status === "UPCOMING"
              ? t("empty.upcoming")
              : status === "COMPLETED"
                ? t("empty.completed")
                : t("empty.default")}
        </h3>
        <p className="text-muted-foreground">
          {status === "PENDING"
            ? t("status.pending")
            : status === "UPCOMING"
              ? t("status.upcoming")
              : status === "COMPLETED"
                ? t("status.completed")
                : t("empty.default")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("results", { count: total })}
        </p>
      </div>

      <div className="grid gap-4">
        {actions.map((action) => (
          <ActionCard key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
}

interface ActionCardProps {
  action: {
    id: string;
    type: ActionType;
    status: ActionStatus;
    title: string;
    description: string | null;
    dueDate: number | null;
    createdAt: number;
    updatedAt: number;
    createdBy: string;
    assignedTo: string | null;
    token: string | null;
    metadata?: { key: string; value: string }[];
  };
}

function ActionCard({ action }: ActionCardProps) {
  const { t } = useTranslation(["actions", "common"]);

  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "UPCOMING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: ActionType) => {
    switch (type) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "USER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDueDate = (dueDate: number | null) => {
    if (!dueDate) return null;

    const date = new Date(dueDate * 1000);
    return formatDistance(date, new Date(), { addSuffix: true });
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{action.title}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className={getStatusColor(action.status)}
              >
                {action.status === "PENDING"
                  ? t("tabs.name.pending")
                  : action.status === "UPCOMING"
                    ? t("tabs.name.upcoming")
                    : t("tabs.name.completed")}
              </Badge>
              <Badge variant="outline" className={getTypeColor(action.type)}>
                {action.type}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {action.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {action.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <UserIcon className="h-3 w-3" />
            <span>
              {action.assignedTo
                ? `${t("assignedTo")}: ${action.assignedTo.slice(0, 8)}...`
                : `${t("createdBy")}: ${action.createdBy.slice(0, 8)}...`}
            </span>
          </div>

          {action.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span>
                {t("dueDate")}: {formatDueDate(action.dueDate)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ActionsListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-32" />
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
