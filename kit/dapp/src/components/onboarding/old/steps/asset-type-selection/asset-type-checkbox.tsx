import { useCallback } from "react";
import { BadgeCheck, Link } from "lucide-react";

export function AssetTypeCheckbox({
  assetType,
  isSelected,
  onToggle,
}: {
  assetType: {
    value: string;
    label: string;
    description: string;
  };
  isSelected: boolean;
  onToggle: (value: string) => void;
}) {
  const handleToggle = useCallback(() => {
    onToggle(assetType.value);
  }, [onToggle, assetType.value]);

  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
      onClick={handleToggle}
    >
      <div>
        <h4 className="font-medium text-foreground flex items-center gap-2">
          {assetType.label}
          {assetType.value === "bond" && (
            <>
              <BadgeCheck className="h-4 w-4 text-muted-foreground" />
              <Link className="h-4 w-4 text-muted-foreground" />
            </>
          )}
          {(assetType.value === "stablecoin" ||
            assetType.value === "deposit") && (
            <Link className="h-4 w-4 text-muted-foreground" />
          )}
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          {assetType.description}
        </p>
      </div>
    </div>
  );
}
