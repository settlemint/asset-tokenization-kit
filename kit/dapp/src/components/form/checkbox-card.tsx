import { Checkbox } from "@/components/ui/checkbox";
import type { LucideIcon } from "lucide-react";
import { memo } from "react";

interface CheckboxCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isChecked: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  disabledLabel?: string;
  onToggle: (checked: boolean) => void;
}

const CheckboxWrapper = memo(
  ({
    onClick,
    children,
  }: {
    onClick: (e: React.MouseEvent) => void;
    children: React.ReactNode;
  }) => <div onClick={onClick}>{children}</div>
);
CheckboxWrapper.displayName = "CheckboxWrapper";

export const CheckboxCard = memo(
  ({
    title,
    description,
    icon: Icon,
    isChecked,
    isDisabled = false,
    isRequired = false,
    disabledLabel,
    onToggle,
  }: CheckboxCardProps) => {
    // Event handlers are automatically optimized by React Compiler - no manual memoization needed
    const handleItemClick = () => {
      if (isDisabled || isRequired) return;
      onToggle(!isChecked);
    };

    const handleCheckboxClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    const handleCheckboxChange = (checked: boolean) => {
      if (isDisabled || isRequired) return;
      onToggle(checked);
    };

    return (
      <div
        className={`flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 transition-colors ${
          isDisabled
            ? "opacity-50 cursor-not-allowed bg-muted/50"
            : isRequired
              ? "cursor-not-allowed"
              : "hover:bg-accent/10 cursor-pointer"
        }`}
        onClick={handleItemClick}
      >
        <CheckboxWrapper onClick={handleCheckboxClick}>
          <Checkbox
            checked={isChecked}
            onCheckedChange={handleCheckboxChange}
            disabled={isDisabled || isRequired}
          />
        </CheckboxWrapper>
        <div className="flex-1 space-y-1 leading-none">
          <div className="flex items-center gap-2">
            <Icon
              className={`h-4 w-4 ${isDisabled ? "text-muted-foreground/50" : "text-muted-foreground"}`}
            />
            <label
              className={`text-sm font-medium ${isDisabled || isRequired ? "" : "cursor-pointer"}`}
            >
              {title}
            </label>
            {(isDisabled || isRequired) && disabledLabel && (
              <span className="text-xs text-muted-foreground">
                {disabledLabel}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    );
  }
);

CheckboxCard.displayName = "CheckboxCard";
