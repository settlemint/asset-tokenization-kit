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
            <SelectValue
              placeholder={t("expressionBuilder.topicInput.selectPlaceholder")}
            />
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
            {t("expressionBuilder.topicInput.notLabel")}
          </label>
        </div>
      </div>

      <Button
        onClick={() => {
          if (!selectedTopic) return;

          const nodes: ExpressionNode[] = [];
          if (negateSelected) {
            nodes.push(createNotExpressionNode());
          }
          nodes.push(createTopicExpressionNode(selectedTopic));

          onAddTopic(nodes);
        }}
        disabled={!selectedTopic}
        variant="outline"
        className="block press-effect"
      >
        {t("expressionBuilder.topicInput.addButton")}
      </Button>
      <Button
        onClick={onStartGroup}
        className="block press-effect -ml-4 -mt-3"
        variant="link"
      >
        {t("expressionBuilder.topicInput.orStartGroup")}
      </Button>
    </div>
  );
}
