import { cn } from "@/lib/utils";
import type { AssetExtension } from "@/lib/zod/validators/asset-extensions";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AssetExtensionsListProps {
  extensions: AssetExtension[];
  className?: string;
}

/**
 * Displays a list of asset extensions with checkmarks and user-friendly descriptions.
 * Each extension is shown with a check icon and a benefit-focused description
 * that explains the value to users in clear, non-technical language.
 *
 * @param extensions - Array of asset extensions to display
 * @param className - Optional CSS classes for styling
 */
export function AssetExtensionsList({
  extensions,
  className,
}: AssetExtensionsListProps) {
  const { t } = useTranslation("asset-extensions");

  if (extensions.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {extensions.map((extension) => (
        <div key={extension} className="flex items-start gap-3 text-sm">
          <Check
            className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <span className="font-medium text-foreground">
              {t(`capabilities.${extension}.label`)}
            </span>
            <span className="text-muted-foreground leading-relaxed">
              {t(`capabilities.${extension}.description`)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
