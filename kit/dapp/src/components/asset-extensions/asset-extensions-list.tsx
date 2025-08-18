import { cn } from "@/lib/utils";
import {
  type AssetExtension,
  AssetExtensionEnum,
  type AssetExtensionSet,
} from "@atk/zod/validators/asset-extensions";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AssetExtensionsListProps {
  extensions: AssetExtension[];
  className?: string;
}

/**
 * Extensions to exclude from display as they are baseline features
 * that don't provide meaningful differentiation to users
 */
const HIDDEN_EXTENSIONS: AssetExtensionSet = new Set([
  AssetExtensionEnum.PAUSABLE,
  AssetExtensionEnum.BURNABLE,
  AssetExtensionEnum.HISTORICAL_BALANCES,
]);

/**
 * Displays a list of asset extensions with checkmarks and user-friendly descriptions.
 * Each extension is shown with a check icon and a benefit-focused description
 * that explains the value to users in clear, non-technical language.
 *
 * Filters out baseline extensions (PAUSABLE, BURNABLE, HISTORICAL_BALANCES)
 * to focus on meaningful differentiators.
 *
 * @param extensions - Array of asset extensions to display
 * @param className - Optional CSS classes for styling
 */
export function AssetExtensionsList({
  extensions,
  className,
}: AssetExtensionsListProps) {
  const { t } = useTranslation("asset-extensions");

  // Filter out non-essential extensions that don't provide meaningful differentiation
  const visibleExtensions = extensions.filter(
    (extension) => !HIDDEN_EXTENSIONS.has(extension)
  );

  if (visibleExtensions.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {visibleExtensions.map((extension) => (
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
