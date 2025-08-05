import {
  type ExpressionNode,
  type ExpressionWithGroups,
} from "@/lib/zod/validators/expression-node";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  canAddEndGroup,
  getOpenGroupCount,
  removeItemAtIndex,
} from "./expression-builder.utils";
import { ExpressionDisplay } from "./expression-display";
import { OperatorInput } from "./operator-input";
import { TopicInput } from "./topic-input";

export interface ExpressionBuilderProps {
  expressionWithGroups: ExpressionWithGroups;
  onChange: (expression: ExpressionWithGroups) => void;
}

export function ExpressionBuilder({
  expressionWithGroups,
  onChange,
}: ExpressionBuilderProps) {
  const { t } = useTranslation("components");

  const [inputMode, setInputMode] = useState<"topic" | "operator">(
    expressionWithGroups.length > 0 ? "operator" : "topic"
  );

  const handleAddTopic = (nodes: ExpressionNode[]) => {
    const newExpression = [...expressionWithGroups, ...nodes];

    onChange(newExpression);
    setInputMode("operator");
  };

  const handleAddOperator = (node: ExpressionNode) => {
    const newExpression = [...expressionWithGroups, node];

    onChange(newExpression);
    setInputMode("topic");
  };

  const handleStartGroup = () => {
    const newExpression = [...expressionWithGroups, "(" as const];
    onChange(newExpression);
  };

  const handleEndGroup = () => {
    const newExpression = [...expressionWithGroups, ")" as const];
    onChange(newExpression);
  };

  const handleRemoveItem = (index: number) => {
    const newExpression = removeItemAtIndex(expressionWithGroups, index);
    onChange(newExpression);
  };

  const handleClearAll = () => {
    onChange([]);
    setInputMode("topic");
  };

  const openGroups = getOpenGroupCount(expressionWithGroups);
  const canEndGroup = canAddEndGroup(expressionWithGroups);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {t("expressionBuilder.title")}
        </h3>

        <ExpressionDisplay
          expressionWithGroups={expressionWithGroups}
          onRemoveItem={handleRemoveItem}
          onClearAll={handleClearAll}
          openGroups={openGroups}
        />

        <div className="space-y-4">
          {inputMode === "topic" ? (
            <TopicInput
              onAddTopic={handleAddTopic}
              onStartGroup={handleStartGroup}
            />
          ) : (
            <OperatorInput
              onAddOperator={handleAddOperator}
              onEndGroup={handleEndGroup}
              canEndGroup={canEndGroup}
            />
          )}
        </div>
      </div>
    </div>
  );
}
