import { DataTable } from "@/components/data-table/data-table";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { getAddonIcon } from "@/components/onboarding/system-addons/addon-icons";
import { getAddonTypeFromTypeId } from "@/components/onboarding/system-addons/addon-types-mapping";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Web3Address } from "@/components/web3/web3-address";
import { orpc } from "@/orpc/orpc-client";
import type { SystemAddon } from "@/orpc/routes/system/addon/routes/addon.list.schema";
import {
  getAddonCategoryFromFactoryTypeId,
  type AddonFactoryTypeId,
} from "@atk/zod/addon-types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { AddAddonDialog } from "./add-addon-dialog";
import { AddonActionsMenu } from "./addon-actions-menu";

const columnHelper = createColumnHelper<SystemAddon>();

/**
 * Addons table component for displaying and managing system addons
 * Shows addon name, type, category, and actions
 */
export function AddonsTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch addons data using ORPC with default parameters
  const { data: addons } = useSuspenseQuery(
    orpc.system.addonList.queryOptions({
      input: {
        offset: 0,
        orderBy: "name",
        orderDirection: "asc",
      },
    })
  );

  // Get current user data with roles
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  const getAddonTypeName = (typeId: string) => {
    const typeNames: Record<string, string> = {
      ATKPushAirdropFactory: "Push Airdrop",
      ATKVestingAirdropFactory: "Vesting Airdrop",
      ATKTimeBoundAirdropFactory: "Time-bound Airdrop",
      ATKFixedYieldScheduleFactory: "Fixed Yield Schedule",
      ATKXvPSettlementFactory: "XvP Settlement",
      ATKVaultFactory: "Vault",
      unknown: "Unknown",
    };
    return typeNames[typeId] || typeId;
  };

  const getCategoryBadgeVariant = (
    category: string
  ): "default" | "secondary" | "outline" | "destructive" => {
    switch (category) {
      case "distribution":
        return "default";
      case "exchange":
        return "secondary";
      case "custody":
        return "outline";
      case "income":
        return "destructive";
      default:
        return "default";
    }
  };

  /**
   * Defines the column configuration for the addons table
   */
  const columns = useMemo<ColumnDef<SystemAddon>[]>(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: ({ getValue, row }) => {
          const name = getValue();
          const addonType = getAddonTypeFromTypeId(row.original.typeId);
          const Icon = getAddonIcon(addonType);

          return (
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{name}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("typeId", {
        header: "Type",
        cell: ({ getValue }) => {
          const typeId = getValue();
          return <Badge variant="outline">{getAddonTypeName(typeId)}</Badge>;
        },
      }),
      columnHelper.accessor("typeId", {
        id: "category",
        header: "Category",
        cell: ({ getValue }) => {
          const category = getAddonCategoryFromFactoryTypeId(
            getValue() as AddonFactoryTypeId
          );
          return (
            <Badge variant={getCategoryBadgeVariant(category)}>
              {category}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("id", {
        header: "Contract Address",
        cell: ({ getValue }) => {
          const address = getValue();
          return (
            <Web3Address
              address={address}
              size="tiny"
              copyToClipboard={true}
              showPrettyName={false}
              showBadge={false}
            />
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <AddonActionsMenu
              addon={row.original}
              userRoles={user?.role ? [user.role] : []}
            />
          );
        },
      }),
    ],
    [user?.role]
  );

  return (
    <ComponentErrorBoundary>
      <div className="space-y-4">
        <DataTable
          data={addons}
          columns={columns}
          emptyMessage="No addons configured"
          actionBar={
            <Button
              onClick={() => {
                setIsAddDialogOpen(true);
              }}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Addon
            </Button>
          }
        />

        <AddAddonDialog
          isOpen={isAddDialogOpen}
          onClose={() => {
            setIsAddDialogOpen(false);
          }}
        />
      </div>
    </ComponentErrorBoundary>
  );
}
