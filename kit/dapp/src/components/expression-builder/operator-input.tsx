import { Button } from "@/components/ui/button";
import {
  createAndExpressionNode,
  createOrExpressionNode,
  type ExpressionNode,
} from "@/lib/zod/validators/expression-node";
import { useTranslation } from "react-i18next";

export interface OperatorInputProps {
  onSelect: (node: ExpressionNode) => void;
  onEndGroup: () => void;
  canEndGroup: boolean;
  openGroups: number;
}

export function OperatorInput({
  onSelect,
  onEndGroup,
  canEndGroup,
  openGroups,
}: OperatorInputProps) {
  const { t } = useTranslation("components");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">
          {t("expressionBuilder.operatorInput.addOperatorLabel")}
        </span>
        <Button
          onClick={() => {
            onSelect(createAndExpressionNode());
          }}
          className="bg-chart-4 hover:bg-chart-4/90"
        >
          {t("expressionBuilder.operatorInput.andButton")}
        </Button>
        <Button
          onClick={() => {
            onSelect(createOrExpressionNode());
          }}
          className="bg-chart-2 hover:bg-chart-2/90"
        >
          {t("expressionBuilder.operatorInput.orButton")}
        </Button>
        {canEndGroup && (
          <>
            <div className="w-px h-6 bg-border" />
            <Button
              variant="outline"
              onClick={onEndGroup}
              className="text-secondary border-secondary hover:bg-secondary/10 dark:hover:bg-secondary/10"
            >
              {t("expressionBuilder.operatorInput.endGroupButton")}
            </Button>
          </>
        )}
      </div>

      {openGroups > 0 && (
        <p className="text-sm text-muted-foreground">
          {t("expressionBuilder.operatorInput.openGroupsText", {
            count: openGroups,
            plural: openGroups > 1 ? "s" : "",
          })}
        </p>
      )}
    </div>
  );
}
