import { validateUIExpression } from "@/components/expression-builder/expression-builder.utils";
import {
  getExpressionColor,
  getParenthesesColor,
} from "@/components/expression-builder/expression-colors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExpressionWithGroups } from "@/lib/zod/validators/expression-node";
import {
  ExpressionTypeEnum,
  getPrettyName,
} from "@/lib/zod/validators/expression-type";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export interface ExpressionDisplayProps {
  expressionWithGroups: ExpressionWithGroups;
  onRemoveItem: (index: number) => void;
  onClearAll: () => void;

  openGroups: number;
}

export function ExpressionDisplay({
  expressionWithGroups,
  onRemoveItem,
  onClearAll,
  openGroups,
}: ExpressionDisplayProps) {
  const { t } = useTranslation("components");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getItemDisplayProps = (item: ExpressionWithGroups[number]) => {
    if (item === "(" || item === ")") {
      return {
        className: cn(getParenthesesColor(), "text-white border-0"),
        children: item,
      };
    }

    const nodeType = item.nodeType;
    const nodeName = getPrettyName(
      nodeType,
      nodeType === ExpressionTypeEnum.TOPIC ? item.value : undefined
    );

    const className = cn(getExpressionColor(nodeType), "text-white border-0");

    switch (nodeType) {
      case ExpressionTypeEnum.TOPIC:
        return {
          className,
          children: nodeName,
        };
      case ExpressionTypeEnum.AND:
        return {
          className,
          children: t("expressionBuilder.operatorInput.andButton"),
        };
      case ExpressionTypeEnum.OR:
        return {
          className,
          children: t("expressionBuilder.operatorInput.orButton"),
        };
      case ExpressionTypeEnum.NOT:
        return {
          className,
          children: t("expressionBuilder.topicInput.notLabel"),
        };
      default: {
        const _exhaustiveCheck: never = nodeType;
        throw new Error(`Unhandled expression type: ${_exhaustiveCheck}`);
      }
    }
  };

  if (expressionWithGroups.length === 0) {
    return null;
  }

  const isValid = validateUIExpression(expressionWithGroups);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {expressionWithGroups.map((item, index) => {
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
                    className="absolute -top-1 -right-1 text-white bg-gray-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <Button variant="link" onClick={onClearAll} className="press-effect">
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
