import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";
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

  const handleClearFilter = useCallback(
    (groupId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      onGroupChange(selectedGroupIds.filter((id) => id !== groupId));
    },
    [selectedGroupIds, onGroupChange]
  );

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

  const handleOptionClick = useCallback(
    (groupId: string) => {
      return () => {
        onGroupChange([...selectedGroupIds, groupId]);
        setIsOpen(false);
      };
    },
    [onGroupChange, selectedGroupIds]
  );

  const handleCheckboxChange = useCallback(
    (groupId: string) => {
      return (checked: boolean) => {
        if (checked) {
          onGroupChange([...selectedGroupIds, groupId]);
        } else {
          onGroupChange(selectedGroupIds.filter((id) => id !== groupId));
        }
      };
    },
    [onGroupChange, selectedGroupIds]
  );

  const handleCheckboxContainerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  const selectedGroups = groups.filter((group) =>
    selectedGroupIds.includes(group.id)
  );

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
            "h-9 gap-2 px-3",
            isOpen && "bg-accent text-accent-foreground"
          )}
        >
          <Filter className="h-4 w-4 text-muted-foreground" />
          {selectedGroupIds.length > 0 && (
            <span className="text-sm">{selectedGroupIds.length}</span>
          )}
        </Button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border bg-popover p-1 shadow-md">
            {groups.map((group) => {
              const count = groupCounts[group.id] ?? 0;
              const isSelected = selectedGroupIds.includes(group.id);
              return (
                <div
                  key={group.id}
                  onClick={handleOptionClick(group.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent/50 group cursor-pointer",
                    "focus:bg-accent/50 focus:outline-none"
                  )}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 flex items-center justify-center"
                      onClick={handleCheckboxContainerClick}
                    >
                      <Checkbox
                        checked={isSelected}
                        className={cn(
                          "h-4 w-4 transition-opacity",
                          isSelected
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        )}
                        onCheckedChange={handleCheckboxChange(group.id)}
                      />
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {group.icon && (
                        <span className="text-muted-foreground">
                          {group.icon}
                        </span>
                      )}
                      <span>{group.label}</span>
                      <span className="text-xs text-muted-foreground">
                        ({count})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
