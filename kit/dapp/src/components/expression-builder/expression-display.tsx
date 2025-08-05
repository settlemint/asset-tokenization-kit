import { validateUIExpression } from "@/components/expression-builder/expression-builder.utils";
import {
  getExpressionColor,
  getParenthesesColor,
} from "@/components/expression-builder/expression-colors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExpressionWithGroups } from "@/lib/zod/validators/expression-node";
import { ExpressionTypeEnum } from "@/lib/zod/validators/expression-type";
import { getTopicNameFromId } from "@/lib/zod/validators/topics";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export interface ExpressionDisplayProps {
  expressionWithGroups: ExpressionWithGroups;
  onRemove: (index: number) => void;

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
              <ExpressionItem
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

type ExpressionItem = {
  removeIndexes: number | [number, number];
  className: string;
  label: string;
};

const useGetExpressionItems = (expressionWithGroups: ExpressionWithGroups) => {
  const { t } = useTranslation("components");
  const items: ExpressionItem[] = [];

  for (let index = 0; index < expressionWithGroups.length; index++) {
    const currentItem = expressionWithGroups[index];
    if (currentItem === undefined) {
      continue;
    }

    if (currentItem === "(" || currentItem === ")") {
      items.push({
        removeIndexes: index,
        className: getParenthesesColor(),
        label: currentItem,
      });
      continue;
    }

    if (index < expressionWithGroups.length - 1) {
      const nextItem = expressionWithGroups[index + 1];
      const hasNotNext =
        typeof nextItem === "object" &&
        nextItem.nodeType === ExpressionTypeEnum.NOT;

      if (hasNotNext) {
        const topicName = getTopicNameFromId(currentItem.value);
        items.push({
          removeIndexes: [index, index + 1],
          className: getExpressionColor(ExpressionTypeEnum.NOT),
          label: `${t("expressionBuilder.topicInput.notLabel")} ${t(`expressionBuilder.topics.${topicName}`)}`,
        });
        // Skip next item, already handled
        index++;
        continue;
      }
    }

    items.push({
      removeIndexes: index,
      className: getExpressionColor(currentItem.nodeType),
      label:
        currentItem.nodeType === ExpressionTypeEnum.AND
          ? t("expressionBuilder.operatorInput.andButton")
          : currentItem.nodeType === ExpressionTypeEnum.OR
            ? t("expressionBuilder.operatorInput.orButton")
            : t(
                `expressionBuilder.topics.${getTopicNameFromId(currentItem.value)}`
              ),
    });
  }
  return items;
};

function ExpressionItem({
  expressionItem,
  onRemove,
}: {
  expressionItem: ExpressionItem;
  onRemove: (index: number) => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div className="flex flex-wrap gap-2">
      <div
        className="relative group"
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        <Badge
          variant="default"
          className={cn(
            "px-3 py-1 text-sm cursor-pointer transition-all",
            expressionItem.className
          )}
        >
          {expressionItem.label}
        </Badge>
        {hover && (
          <button
            onClick={() => {
              if (typeof expressionItem.removeIndexes === "number") {
                onRemove(expressionItem.removeIndexes);
              } else {
                onRemove(expressionItem.removeIndexes[0]);
                onRemove(expressionItem.removeIndexes[1]);
              }
            }}
            className="absolute -top-1 -right-1 text-white bg-gray-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
