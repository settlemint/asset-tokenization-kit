import { getExpressionColor } from "@/components/expression-builder/expression-colors";
import { Button } from "@/components/ui/button";
import {
  createAndExpressionNode,
  createOrExpressionNode,
  type ExpressionNode,
} from "@atk/zod/validators/expression-node";
import { ExpressionTypeEnum } from "@atk/zod/validators/expression-type";
import { useTranslation } from "react-i18next";

export interface OperatorInputProps {
  onAddOperator: (node: ExpressionNode) => void;
  onEndGroup: () => void;
  showEndGroup: boolean;
}

export function OperatorInput({
  onAddOperator,
  onEndGroup,
  showEndGroup,
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
          className={getExpressionColor(ExpressionTypeEnum.AND)}
        >
          {t("expressionBuilder.operatorInput.andButton")}
        </Button>
        <Button
          onClick={() => {
            onAddOperator(createOrExpressionNode());
          }}
          className={getExpressionColor(ExpressionTypeEnum.OR)}
        >
          {t("expressionBuilder.operatorInput.orButton")}
        </Button>
      </div>
      {showEndGroup && (
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
