import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldGroup } from "./types";

interface WizardGroupFilterProps {
  groups: FieldGroup[];
  selectedGroupIds: string[];
  onGroupChange: (groupIds: string[]) => void;
  groupCounts: Record<string, number>;
}

export function WizardGroupFilter({
  groups,
  selectedGroupIds,
  onGroupChange,
  groupCounts,
}: WizardGroupFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleGroup = useCallback(
    (groupId: string) => {
      if (selectedGroupIds.includes(groupId)) {
        // If the group is already selected, remove it
        onGroupChange(selectedGroupIds.filter((id) => id !== groupId));
      } else {
        // If the group is not selected, add it
        onGroupChange([...selectedGroupIds, groupId]);
      }
    },
    [selectedGroupIds, onGroupChange]
  );

  const handleClearFilter = useCallback(
    (groupId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      onGroupChange(selectedGroupIds.filter((id) => id !== groupId));
    },
    [selectedGroupIds, onGroupChange]
  );

  const handleClearAll = useCallback(() => {
    onGroupChange([]);
  }, [onGroupChange]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleBadgeRemove = useCallback(
    (groupId: string) => {
      return (e: React.MouseEvent) => {
        handleClearFilter(groupId, e);
      };
    },
    [handleClearFilter]
  );

  const handleButtonClick = useCallback(
    (groupId: string) => {
      return () => {
        handleToggleGroup(groupId);
      };
    },
    [handleToggleGroup]
  );

  const selectedGroups = groups.filter((group) =>
    selectedGroupIds.includes(group.id)
  );
  const isAllSelected = selectedGroupIds.length === 0;

  return (
    <div className="flex items-center gap-2">
      {/* Selected filters display */}
      {selectedGroups.length > 0 && (
        <div className="flex items-center gap-1.5">
          {selectedGroups.map((group) => (
            <Badge
              key={group.id}
              variant="outline"
              className="h-9 gap-1 pr-1.5 text-sm font-normal"
            >
              {group.label}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBadgeRemove(group.id)}
                className="h-5 w-5 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {group.label} filter</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className={cn(
            "h-9 gap-2 px-3 text-sm font-normal",
            "border-none shadow-none hover:bg-accent",
            "focus-visible:ring-1 focus-visible:ring-ring",
            isOpen && "bg-accent"
          )}
        >
          <span className="text-muted-foreground">
            {isAllSelected ? "All groups" : `${selectedGroups.length} selected`}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border bg-popover p-1 shadow-md">
            {/* All Groups option */}
            <button
              onClick={handleClearAll}
              className={cn(
                "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                "focus:bg-accent focus:outline-none",
                isAllSelected && "bg-accent"
              )}
            >
              <span>All groups</span>
              {isAllSelected && <Check className="h-4 w-4" />}
            </button>

            <div className="my-1 h-px bg-border" />

            {/* Group options */}
            {groups.map((group) => {
              const count = groupCounts[group.id] ?? 0;
              const isSelected = selectedGroupIds.includes(group.id);

              return (
                <button
                  key={group.id}
                  onClick={handleButtonClick(group.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                    "focus:bg-accent focus:outline-none",
                    isSelected && "bg-accent"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {group.icon && (
                      <span className="text-muted-foreground">
                        {group.icon}
                      </span>
                    )}
                    <span>{group.label}</span>
                    <span className="text-xs text-muted-foreground">
                      ({count})
                    </span>
                  </span>
                  {isSelected && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
