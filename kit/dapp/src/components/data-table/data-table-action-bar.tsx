import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { CheckIcon, ChevronDownIcon, LoaderIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type {
  BulkAction,
  BulkActionBarProps,
  BulkActionContext,
} from "./types/bulk-actions";

const logger = createLogger();

export function DataTableActionBar<TData>({
  selectedRowIds,
  selectedRows,
  table,
  actions = [],
  actionGroups = [],
  onSelectionClear,
  position = "bottom",
  className,
  showSelectionCount = true,
  enableSelectAll = true,
  maxHeight = "80px",
}: BulkActionBarProps<TData>) {
  const { t } = useTranslation("data-table");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedCount = selectedRowIds.length;
  const isVisible = selectedCount > 0;

  // Create action context
  const actionContext: BulkActionContext<TData> = useMemo(
    () => ({
      selectedRows,
      selectedRowIds,
      table,
      onComplete: () => {
        setLoadingAction(null);
        onSelectionClear();
      },
      onError: (error: Error) => {
        setLoadingAction(null);
        logger.error("Bulk action failed", error);
        toast.error(
          t("bulkActions.error", {
            error: error.message,
          })
        );
      },
    }),
    [selectedRows, selectedRowIds, table, onSelectionClear, t]
  );

  // Combine individual actions and grouped actions
  const allActions = useMemo(
    () => [...actions, ...actionGroups],
    [actions, actionGroups]
  );

  // Filter actions based on visibility and disabled state
  const visibleActions = useMemo(() => {
    return allActions.filter((actionOrGroup) => {
      if ("actions" in actionOrGroup) {
        // It's a group - check if any actions in the group are visible
        return actionOrGroup.actions.some((action) => {
          const isHidden =
            typeof action.hidden === "function"
              ? action.hidden(actionContext)
              : action.hidden;
          return !isHidden;
        });
      } else {
        // It's an individual action
        const isHidden =
          typeof actionOrGroup.hidden === "function"
            ? actionOrGroup.hidden(actionContext)
            : actionOrGroup.hidden;
        return !isHidden;
      }
    });
  }, [allActions, actionContext]);

  const executeAction = useCallback(
    async (action: BulkAction<TData>) => {
      const isDisabled =
        typeof action.disabled === "function"
          ? action.disabled(actionContext)
          : action.disabled;

      if (isDisabled || loadingAction) return;

      setLoadingAction(action.id);
      setIsOpen(false);

      try {
        await action.execute(actionContext);
        // Show success message if provided
        if (action.successMessage) {
          toast.success(action.successMessage);
        }
        // Complete the action (this will clear selection)
        actionContext.onComplete();
      } catch (error) {
        // Show error message if provided
        const errorMessage =
          action.errorMessage ??
          t("bulkActions.error", {
            action: action.label,
          });
        logger.error(errorMessage, error);
        toast.error(errorMessage);
        actionContext.onError(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    },
    [actionContext, loadingAction, t]
  );

  const executeActionHandler = useCallback(
    (action: BulkAction<TData>) => () => {
      void executeAction(action);
    },
    [executeAction]
  );

  const handleSelectAll = useCallback(() => {
    if (
      table &&
      typeof table === "object" &&
      "toggleAllRowsSelected" in table
    ) {
      (
        table as { toggleAllRowsSelected: (value: boolean) => void }
      ).toggleAllRowsSelected(true);
    }
  }, [table]);

  const renderActionButton = useCallback(
    (action: BulkAction<TData>) => {
      const isDisabled =
        typeof action.disabled === "function"
          ? action.disabled(actionContext)
          : (action.disabled ?? false);
      const isLoading = loadingAction === action.id;
      const Icon = action.icon;

      return (
        <DropdownMenuItem
          key={action.id}
          onSelect={executeActionHandler(action)}
          disabled={isDisabled || isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <LoaderIcon className="size-4 animate-spin" />
          ) : Icon ? (
            <Icon className="size-4" />
          ) : null}
          <span>{action.label}</span>
          {isLoading && action.loadingMessage && (
            <span className="text-xs text-muted-foreground ml-auto">
              {action.loadingMessage}
            </span>
          )}
        </DropdownMenuItem>
      );
    },
    [actionContext, loadingAction, executeActionHandler]
  );

  const memoizedVisibleActions = useMemo(
    () => visibleActions,
    [visibleActions]
  );

  const renderContent = () => (
    <div className="flex items-center justify-between gap-4 w-full">
      {/* Selection info */}
      <div className="flex items-center gap-3">
        {showSelectionCount && (
          <div className="flex items-center gap-2">
            <CheckIcon className="size-4 text-primary" />
            <span className="font-medium text-sm">
              {t("bulkActions.selectedCount", {
                count: selectedCount,
              })}
            </span>
          </div>
        )}

        {enableSelectAll && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs h-7"
            >
              {t("bulkActions.selectAll")}
            </Button>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {memoizedVisibleActions.length > 0 && (
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-primary/20 hover:border-primary/40"
                disabled={loadingAction !== null}
              >
                {loadingAction ? (
                  <>
                    <LoaderIcon className="size-3 animate-spin mr-1" />
                    {t("bulkActions.processing")}
                  </>
                ) : (
                  <>
                    {t("bulkActions.actions")}
                    <ChevronDownIcon className="size-3 ml-1" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {memoizedVisibleActions.map((actionOrGroup, index) => {
                if ("actions" in actionOrGroup) {
                  // Render group
                  const group = actionOrGroup;
                  const visibleGroupActions = group.actions.filter((action) => {
                    const isHidden =
                      typeof action.hidden === "function"
                        ? action.hidden(actionContext)
                        : action.hidden;
                    return !isHidden;
                  });

                  if (visibleGroupActions.length === 0) return null;

                  return (
                    <div key={group.id}>
                      {group.label && (
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                          {group.label}
                        </div>
                      )}
                      <DropdownMenuGroup>
                        {visibleGroupActions.map((action) =>
                          renderActionButton(action)
                        )}
                      </DropdownMenuGroup>
                      {group.separator &&
                        index < memoizedVisibleActions.length - 1 && (
                          <DropdownMenuSeparator />
                        )}
                    </div>
                  );
                } else {
                  // Render individual action
                  return renderActionButton(actionOrGroup);
                }
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onSelectionClear}
          className="h-8 w-8 p-0 hover:bg-destructive/10"
          aria-label={t("bulkActions.clearSelection")}
        >
          <XIcon className="size-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{
            opacity: 0,
            y: position === "bottom" ? 20 : -20,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: position === "bottom" ? 20 : -20,
            scale: 0.95,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            duration: 0.2,
          }}
          className={cn(
            "fixed left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl mx-auto px-4",
            position === "bottom" ? "bottom-6" : "top-6",
            className
          )}
          style={{ maxHeight }}
        >
          <div className="border rounded-lg shadow-lg backdrop-blur-sm bg-card/95 p-4">
            {renderContent()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Export a simplified version for basic use cases
const EMPTY_ARRAY: never[] = [];
const EMPTY_SELECTED_ROWS: never[] = [];

export function SimpleDataTableActionBar<TData>({
  selectedRowIds,
  onSelectionClear,
  actions = EMPTY_ARRAY as BulkAction<TData>[],
  className,
}: {
  selectedRowIds: string[];
  onSelectionClear: () => void;
  actions?: BulkAction<TData>[];
  className?: string;
}) {
  return (
    <DataTableActionBar
      selectedRowIds={selectedRowIds}
      selectedRows={EMPTY_SELECTED_ROWS as TData[]}
      table={null}
      actions={actions}
      onSelectionClear={onSelectionClear}
      className={className}
      showSelectionCount={true}
      enableSelectAll={false}
    />
  );
}
