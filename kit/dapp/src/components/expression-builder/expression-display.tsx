import { validateUIExpression } from "@/components/expression-builder/expression-builder.utils";
import {
  ExpressionDisplayItem,
  useGetExpressionItems,
} from "@/components/expression-builder/expression-display-item";
import { Button } from "@/components/ui/button";
import type { ExpressionWithGroups } from "@atk/zod/expression-node";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface ExpressionDisplayProps {
  expressionWithGroups: ExpressionWithGroups;
  onRemove: (index: number | [number, number]) => void;
  onClear: () => void;

  openGroups: number;
}

export function ExpressionDisplay({
  expressionWithGroups,
  onRemove,
  onClear,
  openGroups,
}: ExpressionDisplayProps) {
  const { t } = useTranslation("components");
  const expressionItems = useGetExpressionItems(expressionWithGroups);

  if (expressionWithGroups.length === 0) {
    return null;
  }

  const isValid = validateUIExpression(expressionWithGroups);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {expressionItems.map((item, index) => {
            return (
              <ExpressionDisplayItem
                key={index}
                expressionItem={item}
                onRemove={onRemove}
              />
            );
          })}
        </div>

        <Button variant="link" onClick={onClear} className="press-effect">
          {t("expressionBuilder.display.clearAllButton")}
        </Button>
      </div>

      {/* Validation Status */}
      <div className="flex items-center gap-2">
        {isValid && (
          <>
            <Check className="w-4 h-4 text-sm-state-success" />
            <span className="text-sm text-sm-state-success">
              {t("expressionBuilder.display.validExpression")}
            </span>
          </>
        )}
        {openGroups > 0 &&
          t("expressionBuilder.display.closeGroupsPrompt", {
            count: openGroups,
            plural: openGroups > 1 ? "s" : "",
          })}
      </div>
    </div>
  );
}
