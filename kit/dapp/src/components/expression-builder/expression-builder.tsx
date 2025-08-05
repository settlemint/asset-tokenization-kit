import {
  type ExpressionNode,
  type ExpressionWithGroups,
} from "@/lib/zod/validators/expression-node";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  canAddEndGroup,
  getOpenGroupCount,
  removeItemAtIndex,
  validateUIExpression,
} from "./expression-builder.utils";
import { ExpressionDisplay } from "./expression-display";
import { OperatorInput } from "./operator-input";
import { TopicInput } from "./topic-input";

export interface ExpressionBuilderProps {
  value?: ExpressionWithGroups;
  onChange?: (expression: ExpressionWithGroups) => void;
  onValidityChange?: (isValid: boolean) => void;
}

export function ExpressionBuilder({
  value = [],
  onChange,
  onValidityChange,
}: ExpressionBuilderProps) {
  const { t } = useTranslation("components");
  const [expression, setExpression] = useState<ExpressionWithGroups>(value);
  const [inputMode, setInputMode] = useState<"topic" | "operator">("topic");

  const isValid = validateUIExpression(expression);
  const openGroups = getOpenGroupCount(expression);
  const canEndGroup = canAddEndGroup(expression);

  useEffect(() => {
    onChange?.(expression);
    onValidityChange?.(isValid);
  }, [expression, isValid, onChange, onValidityChange]);

  const handleAddTopic = (nodes: ExpressionNode[]) => {
    const newExpression = [...expression, ...nodes];

    setExpression(newExpression);
    setInputMode("operator");
  };

  const handleStartGroup = () => {
    const newExpression = [...expression, "(" as const];
    setExpression(newExpression);
  };

  const handleOperatorSelect = (node: ExpressionNode) => {
    const newExpression = [...expression, node];

    setExpression(newExpression);
    setInputMode("topic");
  };

  const handleEndGroup = () => {
    if (!canEndGroup) return;

    const newExpression = [...expression, ")" as const];
    setExpression(newExpression);
  };

  const handleRemoveItem = (index: number) => {
    const newExpression = removeItemAtIndex(expression, index);
    setExpression(newExpression);
  };

  const handleClearAll = () => {
    setExpression([]);
    setInputMode("topic");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {t("expressionBuilder.title")}
        </h3>

        <ExpressionDisplay
          expression={expression}
          onRemoveItem={handleRemoveItem}
          onClearAll={handleClearAll}
          isValid={isValid}
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
              onSelect={handleOperatorSelect}
              onEndGroup={handleEndGroup}
              canEndGroup={canEndGroup}
              openGroups={openGroups}
            />
          )}
        </div>
      </div>
    </div>
  );
}
