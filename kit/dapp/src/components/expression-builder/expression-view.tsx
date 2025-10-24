import { useGetExpressionItems } from "@/components/expression-builder/expression-display-item";
import type { ExpressionWithGroups } from "@atk/zod/expression-node";
import { ExpressionDisplayItem } from "./expression-display-item";

export interface ExpressionViewProps {
  expressionWithGroups: ExpressionWithGroups;
}

export function ExpressionView({ expressionWithGroups }: ExpressionViewProps) {
  const expressionItems = useGetExpressionItems(expressionWithGroups);

  if (expressionWithGroups.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {expressionItems.map((item, index) => {
            return <ExpressionDisplayItem key={index} expressionItem={item} />;
          })}
        </div>
      </div>
    </div>
  );
}
