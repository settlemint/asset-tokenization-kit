import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  createAndExpressionNode,
  createNotExpressionNode,
  createOrExpressionNode,
  createTopicExpressionNode,
  type ExpressionWithGroups,
} from "@/lib/zod/validators/expression-node";
import { getPrettyName } from "@/lib/zod/validators/expression-type";
import type { ATKTopic } from "@/lib/zod/validators/topics";
import { atkTopics } from "@/lib/zod/validators/topics";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  canAddEndGroup,
  getOpenGroupCount,
  removeItemAtIndex,
  validateUIExpression,
} from "./expression-builder.utils";

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
  const [selectedTopic, setSelectedTopic] = useState<ATKTopic | "">("");
  const [negateSelected, setNegateSelected] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isValid = validateUIExpression(expression);
  const openGroups = getOpenGroupCount(expression);
  const canEndGroup = canAddEndGroup(expression);

  useEffect(() => {
    onChange?.(expression);
    onValidityChange?.(isValid);
  }, [expression, isValid, onChange, onValidityChange]);

  const handleAddTopic = () => {
    if (!selectedTopic) return;

    const newExpression = [...expression];

    if (negateSelected) {
      newExpression.push(createNotExpressionNode());
    }

    newExpression.push(createTopicExpressionNode(selectedTopic));

    setExpression(newExpression);
    setSelectedTopic("");
    setNegateSelected(false);
    setInputMode("operator");
  };

  const handleStartGroup = () => {
    const newExpression = [...expression, "(" as const];
    setExpression(newExpression);
  };

  const handleAddOperator = (operator: "AND" | "OR") => {
    const newExpression = [...expression];

    if (operator === "AND") {
      newExpression.push(createAndExpressionNode());
    } else {
      newExpression.push(createOrExpressionNode());
    }

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
    setSelectedTopic("");
    setNegateSelected(false);
  };

  const getItemDisplayProps = (item: ExpressionWithGroups[number]) => {
    if (typeof item === "string") {
      // Parentheses
      return {
        className: "bg-gray-600 hover:bg-gray-700 text-white border-0",
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
          className: "bg-green-600 hover:bg-green-700 text-white border-0",
          children: nodeName,
        };
      case 1: // AND
        return {
          className: "bg-blue-600 hover:bg-blue-700 text-white border-0",
          children: "AND",
        };
      case 2: // OR
        return {
          className: "bg-pink-600 hover:bg-pink-700 text-white border-0",
          children: "OR",
        };
      case 3: // NOT
        return {
          className: "bg-purple-600 hover:bg-purple-700 text-white border-0",
          children: "NOT",
        };
      default:
        return {
          className: "bg-gray-600 hover:bg-gray-700 text-white border-0",
          children: "UNKNOWN",
        };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Expression Builder</h3>

        {/* Expression Display */}
        {expression.length > 0 && (
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
                            handleRemoveItem(index);
                          }}
                          className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button variant="outline" size="sm" onClick={handleClearAll}>
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Input Controls */}
        <div className="space-y-4">
          {inputMode === "topic" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Select
                  value={selectedTopic}
                  onValueChange={(v) => {
                    setSelectedTopic(v as ATKTopic);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a topic..." />
                  </SelectTrigger>
                  <SelectContent>
                    {atkTopics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {t(`expressionBuilder.topics.${topic}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="negate"
                    checked={negateSelected}
                    onCheckedChange={(checked) => {
                      setNegateSelected(!!checked);
                    }}
                  />
                  <label
                    htmlFor="negate"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    NOT
                  </label>
                </div>

                <Button
                  onClick={handleAddTopic}
                  disabled={!selectedTopic}
                  className="bg-green-600 hover:bg-green-700"
                >
                  + Add
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Or start a group:
                </span>
                <Button
                  variant="outline"
                  onClick={handleStartGroup}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  ( ) ( Start Group
                </Button>
              </div>

              {expression.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Start by adding a topic or creating a group
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Add Operator:</span>
                <Button
                  onClick={() => {
                    handleAddOperator("AND");
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  AND
                </Button>
                <Button
                  onClick={() => {
                    handleAddOperator("OR");
                  }}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  OR
                </Button>
                {canEndGroup && (
                  <>
                    <div className="w-px h-6 bg-border" />
                    <Button
                      variant="outline"
                      onClick={handleEndGroup}
                      className="text-gray-600 border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950"
                    >
                      ) End Group
                    </Button>
                  </>
                )}
              </div>

              {openGroups > 0 && (
                <p className="text-sm text-muted-foreground">
                  {openGroups} open group{openGroups > 1 ? "s" : ""} to close
                </p>
              )}
            </div>
          )}
        </div>

        {/* Validation Status */}
        <div className="mt-6">
          {expression.length > 0 && (
            <div className="flex items-center gap-2">
              {isValid ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    Expression is complete and valid
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {openGroups > 0
                    ? `Close ${openGroups} group${openGroups > 1 ? "s" : ""} to complete`
                    : "Add a topic or start a group"}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
