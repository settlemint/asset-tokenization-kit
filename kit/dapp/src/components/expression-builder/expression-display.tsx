import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExpressionWithGroups } from "@/lib/zod/validators/expression-node";
import { getPrettyName } from "@/lib/zod/validators/expression-type";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export interface ExpressionDisplayProps {
  expression: ExpressionWithGroups;
  onRemoveItem: (index: number) => void;
  onClearAll: () => void;
  isValid: boolean;
  openGroups: number;
}

export function ExpressionDisplay({
  expression,
  onRemoveItem,
  onClearAll,
  isValid,
  openGroups,
}: ExpressionDisplayProps) {
  const { t } = useTranslation("components");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getItemDisplayProps = (item: ExpressionWithGroups[number]) => {
    if (typeof item === "string") {
      // Parentheses
      return {
        className: "bg-secondary hover:bg-secondary/90 text-white border-0",
        children: item,
      };
    }

    // ExpressionNode
    const nodeName = getPrettyName(
      item.nodeType,
      item.nodeType === 0 ? item.value : undefined
    );

    switch (item.nodeType) {
      case 0: // TOPIC
        return {
          className: "bg-chart-1 hover:bg-chart-1/90 text-white border-0",
          children: nodeName,
        };
      case 1: // AND
        return {
          className: "bg-chart-3 hover:bg-chart-3/90 text-white border-0",
          children: t("expressionBuilder.operatorInput.andButton"),
        };
      case 2: // OR
        return {
          className: "bg-chart-4 hover:bg-chart-4/90 text-white border-0",
          children: t("expressionBuilder.operatorInput.orButton"),
        };
      case 3: // NOT
        return {
          className: "bg-chart-5 hover:bg-chart-5/90 text-white border-0",
          children: t("expressionBuilder.topicInput.notLabel"),
        };
      default:
        return {
          className: "bg-secondary hover:bg-secondary/90 text-white border-0",
          children: t("expressionBuilder.display.unknownNode"),
        };
    }
  };

  if (expression.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {expression.map((item, index) => {
            const displayProps = getItemDisplayProps(item);
            return (
              <div
                key={index}
                className="relative group"
                onMouseEnter={() => {
                  setHoveredIndex(index);
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                }}
              >
                <Badge
                  variant="default"
                  className={cn(
                    "px-3 py-1 text-sm cursor-pointer transition-all",
                    displayProps.className
                  )}
                >
                  {displayProps.children}
                </Badge>
                {hoveredIndex === index && (
                  <button
                    onClick={() => {
                      onRemoveItem(index);
                    }}
                    className="absolute -top-1 -right-1 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <Button variant="outline" size="sm" onClick={onClearAll}>
          {t("expressionBuilder.display.clearAllButton")}
        </Button>
      </div>

      {/* Validation Status */}
      <div className="flex items-center gap-2">
        {isValid ? (
          <>
            <Check className="w-4 h-4 text-chart-1" />
            <span className="text-sm text-chart-1 font-medium">
              {t("expressionBuilder.display.validExpression")}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            {openGroups > 0
              ? t("expressionBuilder.display.closeGroupsPrompt", {
                  count: openGroups,
                  plural: openGroups > 1 ? "s" : "",
                })
              : t("expressionBuilder.display.addTopicPrompt")}
          </span>
        )}
      </div>
    </div>
  );
}
