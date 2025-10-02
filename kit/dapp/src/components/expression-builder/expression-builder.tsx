import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ExpressionNode,
  ExpressionWithGroups,
} from "@atk/zod/expression-node";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
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
  const { t } = useTranslation(["components", "compliance-modules"]);
  const helperCopy = t(
    "compliance-modules:modules.SMARTIdentityVerificationComplianceModule.helper",
    {
      returnObjects: true,
    }
  );

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

  const handleRemoveItem = (index: number | number[]) => {
    const newExpression = removeItemAtIndex(expressionWithGroups, index);
    onChange(newExpression);
  };

  const handleClearAll = () => {
    onChange([]);
    setInputMode("topic");
  };

  const openGroups = getOpenGroupCount(expressionWithGroups);
  const showEndGroup = openGroups > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("expressionBuilder.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTitle>{helperCopy.howToTitle}</AlertTitle>
          <AlertDescription className="space-y-3">
            <div className="space-y-2">
              <ul className="mt-2 space-y-1 list-disc pl-5">
                {helperCopy.howToItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p>{helperCopy.examplesTitle}</p>
              <div className="space-y-2">
                <ul className="mt-2 space-y-1 list-disc pl-5">
                  {helperCopy.examples.map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <ExpressionDisplay
          expressionWithGroups={expressionWithGroups}
          onRemove={handleRemoveItem}
          onClear={handleClearAll}
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
              showEndGroup={showEndGroup}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
