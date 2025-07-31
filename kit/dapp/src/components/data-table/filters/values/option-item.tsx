import { CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Circle, CircleCheck } from "lucide-react";
import { isValidElement, useCallback } from "react";
import type { ColumnOption } from "../types/column-types";

interface OptionItemProps {
  option: ColumnOption;
  checked: boolean;
  count: number;
  onSelect: (value: string, checked: boolean) => void;
}

export function OptionItem({
  option,
  checked,
  count,
  onSelect,
}: OptionItemProps) {
  const handleSelect = useCallback(() => {
    onSelect(option.value, !checked);
  }, [onSelect, option.value, checked]);

  return (
    <CommandItem
      onSelect={handleSelect}
      className="group flex items-center justify-between gap-1.5"
    >
      <div className="flex items-center gap-1.5">
        {checked ? (
          <CircleCheck className="size-4 text-primary group-hover:text-foreground" />
        ) : (
          <Circle className="size-4 opacity-0 group-hover:opacity-100" />
        )}
        {option.icon &&
          (isValidElement(option.icon) ? (
            option.icon
          ) : (
            <option.icon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          ))}
        <span>
          {option.label}
          <span
            className={cn(
              "ml-2 tabular-nums tracking-tight text-muted-foreground text-xs",
              count === 0 && "slashed-zero"
            )}
          >
            {count < 100 ? count : "100+"}
          </span>
        </span>
      </div>
    </CommandItem>
  );
}
