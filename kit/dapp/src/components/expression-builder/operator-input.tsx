import { Button } from "@/components/ui/button";
import {
  createAndExpressionNode,
  createOrExpressionNode,
  type ExpressionNode,
} from "@/lib/zod/validators/expression-node";
import { useTranslation } from "react-i18next";

export interface OperatorInputProps {
  onAddOperator: (node: ExpressionNode) => void;
  onEndGroup: () => void;
  canEndGroup: boolean;
}

export function OperatorInput({
  onAddOperator,
  onEndGroup,
  canEndGroup,
}: OperatorInputProps) {
  const { t } = useTranslation("components");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">
          {t("expressionBuilder.operatorInput.chooseOperatorLabel")}
        </span>
        <Button
          onClick={() => {
            onAddOperator(createAndExpressionNode());
          }}
          className="bg-chart-4 hover:bg-chart-4/90"
        >
          {t("expressionBuilder.operatorInput.andButton")}
        </Button>
        <Button
          onClick={() => {
            onAddOperator(createOrExpressionNode());
          }}
          className="bg-chart-2 hover:bg-chart-2/90"
        >
          {t("expressionBuilder.operatorInput.orButton")}
        </Button>
      </div>
      {canEndGroup && (
        <Button
          variant="link"
          onClick={onEndGroup}
          className="press-effect -ml-4 -mt-4"
        >
          {t("expressionBuilder.operatorInput.endGroupButton")}
        </Button>
      )}
    </div>
  );
}
