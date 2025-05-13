import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser } from "@/lib/auth/utils";
import { getActionsList } from "@/lib/queries/actions/actions-list";
import type {
  ActionStatus,
  ActionType,
} from "@/lib/queries/actions/actions-schema";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import type { LucideIcon } from "lucide-react";
import {
  AlarmClockCheck,
  ArrowBigRightDash,
  CircleDashed,
  ListCheck,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { DataTable } from "../data-table/data-table";
import { Columns } from "./actions-columns";

interface ActionsTableProps {
  status: ActionStatus;
  actionType: ActionType;
}

/**
 * Server component that fetches data and passes it to the client component
 */
export async function ActionsTable({ status, actionType }: ActionsTableProps) {
  const user = await getUser();
  const t = await getTranslations("actions");
  const actions = await getActionsList({
    userAddress: user.wallet,
    status,
    type: actionType,
  });

  let emptyState;
  switch (status) {
    case "PENDING": {
      emptyState = (
        <EmptyState
          icon={ListCheck}
          title={t("tabs.empty-state.title.pending")}
          description={t("tabs.empty-state.description.pending")}
        />
      );
      break;
    }
    case "UPCOMING": {
      emptyState = (
        <EmptyState
          icon={ArrowBigRightDash}
          title={t("tabs.empty-state.title.upcoming")}
          description={t("tabs.empty-state.description.upcoming")}
        />
      );
      break;
    }
    case "COMPLETED": {
      emptyState = (
        <EmptyState
          icon={CircleDashed}
          title={t("tabs.empty-state.title.completed")}
          description={t("tabs.empty-state.description.completed")}
        />
      );
      break;
    }
    case "EXPIRED": {
      emptyState = (
        <EmptyState
          icon={AlarmClockCheck}
          title={t("tabs.empty-state.title.expired")}
          description={t("tabs.empty-state.description.expired")}
        />
      );
      break;
    }
    default:
      exhaustiveGuard(status);
  }

  if (actions.length === 0) {
    return emptyState;
  }

  return (
    <DataTable
      columns={Columns}
      columnParams={{ status }}
      data={actions}
      name="Actions"
    />
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 mb-2">
          <Icon className="size-5" />
          <div>{title}</div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
