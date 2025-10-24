import {
  getExpressionColor,
  getParenthesesColor,
} from "@/components/expression-builder/expression-colors";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ExpressionWithGroups } from "@atk/zod/expression-node";
import { ExpressionTypeEnum } from "@atk/zod/expression-type";
import { getTopicNameFromId } from "@atk/zod/topics";
import { X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export type ExpressionItem = {
  removeIndexes: number | [number, number];
  className: string;
  label: string;
};

export function ExpressionDisplayItem({
  expressionItem,
  onRemove,
}: {
  expressionItem: ExpressionItem;
  onRemove?: (index: number | [number, number]) => void;
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
        {hover && typeof onRemove === "function" && (
          <button
            onClick={() => {
              onRemove(expressionItem.removeIndexes);
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

export const useGetExpressionItems = (
  expressionWithGroups: ExpressionWithGroups
) => {
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

    if (currentItem.nodeType === ExpressionTypeEnum.NOT) {
      const nextItem = expressionWithGroups[index + 1];

      // Only for type safety, the next item will always be a topic
      if (nextItem === undefined || nextItem === "(" || nextItem === ")") {
        continue;
      }

      const topicName = getTopicNameFromId(nextItem.value);
      items.push({
        removeIndexes: [index, index + 1],
        className: getExpressionColor(ExpressionTypeEnum.NOT),
        label: `${t("expressionBuilder.topicInput.notLabel")} ${t(`expressionBuilder.topics.${topicName}`)}`,
      });

      // Skip next item, already handled
      index++;
      continue;
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
