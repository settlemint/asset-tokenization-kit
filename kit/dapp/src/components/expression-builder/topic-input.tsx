import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createNotExpressionNode,
  createTopicExpressionNode,
  type ExpressionNode,
} from "@/lib/zod/validators/expression-node";
import type { ATKTopic } from "@/lib/zod/validators/topics";
import { atkTopics } from "@/lib/zod/validators/topics";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export interface TopicInputProps {
  onAddTopic: (expressionNodes: ExpressionNode[]) => void;
  onStartGroup: () => void;
}

export function TopicInput({ onAddTopic, onStartGroup }: TopicInputProps) {
  const { t } = useTranslation("components");

  const [selectedTopic, setSelectedTopic] = useState<ATKTopic | "">("");
  const [negateSelected, setNegateSelected] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select
          value={selectedTopic}
          onValueChange={(v) => {
            setSelectedTopic(v as ATKTopic);
          }}
        >
          <SelectTrigger>
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
          onClick={() => {
            if (!selectedTopic) return;

            const nodes: ExpressionNode[] = [
              createTopicExpressionNode(selectedTopic),
            ];
            if (negateSelected) {
              nodes.push(createNotExpressionNode());
            }

            onAddTopic(nodes);
          }}
          disabled={!selectedTopic}
          className="bg-chart-1 hover:bg-chart-1/90"
        >
          + Add
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Or start a group:</span>
        <Button
          variant="outline"
          onClick={onStartGroup}
          className="text-chart-4 border-chart-4 hover:bg-chart-4/10 dark:hover:bg-chart-4/10"
        >
          ( ) ( Start Group
        </Button>
      </div>
    </div>
  );
}
