/**
 * Visual Expression Builder for Compliance Rules
 *
 * @remarks
 * This component provides a user-friendly interface for building complex compliance
 * expressions that define business rules for token operations. It implements a
 * state machine pattern that guides users through valid expression construction.
 *
 * ARCHITECTURAL PATTERN:
 * - State machine with "topic" and "operator" modes for guided input
 * - Immutable state updates prevent UI corruption and enable undo/redo
 * - Real-time validation feedback with visual group balance indicators
 * - Modular sub-components for topic selection, operator input, and display
 *
 * BUSINESS CONTEXT:
 * - Compliance expressions define who can perform token operations
 * - Rules like "country IS US AND age GREATER_THAN 18" become smart contract logic
 * - Visual builder prevents syntax errors and guides non-technical users
 * - Generated expressions are encoded for on-chain deployment
 *
 * STATE MANAGEMENT:
 * - inputMode alternates between "topic" and "operator" for valid sequences
 * - Expression state is lifted up to parent for form integration
 * - Group counting enables real-time parentheses balance feedback
 *
 * @see {@link ExpressionDisplay} Visual representation of built expression
 * @see {@link TopicInput} Component for selecting compliance topics (country, age, etc.)
 * @see {@link OperatorInput} Component for selecting comparison and logical operators
 */

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
  /** Current expression state from parent component */
  expressionWithGroups: ExpressionWithGroups;
  /** Callback to update expression state in parent */
  onChange: (expression: ExpressionWithGroups) => void;
}

/**
 * Main expression builder component with guided input state machine.
 *
 * @remarks
 * STATE MACHINE DESIGN: The component alternates between "topic" and "operator" modes
 * to ensure users build syntactically valid expressions. This prevents common errors
 * like consecutive operators or missing operands.
 *
 * INITIALIZATION LOGIC: Empty expressions start in "topic" mode (need a subject),
 * while existing expressions start in "operator" mode (need to continue the logic).
 * This provides intuitive continuation when editing existing rules.
 *
 * IMMUTABLE UPDATES: All state changes create new arrays to prevent React state
 * corruption and enable features like undo/redo in parent components.
 *
 * @param props - Component props with expression state and change handler
 * @example
 * ```typescript
 * // Usage in a compliance form
 * function ComplianceRuleForm() {
 *   const [expression, setExpression] = useState<ExpressionWithGroups>([]);
 *
 *   return (
 *     <form>
 *       <ExpressionBuilder
 *         expressionWithGroups={expression}
 *         onChange={setExpression}
 *       />
 *       <button onClick={() => deployRule(expression)}>
 *         Deploy Rule
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function ExpressionBuilder({
  expressionWithGroups,
  onChange,
}: ExpressionBuilderProps) {
  const { t } = useTranslation("components");

  // STATE MACHINE: Alternates between topic and operator input modes
  // WHY: Ensures valid expression sequences and prevents syntax errors
  // INITIALIZATION: Empty expressions need topics first, existing ones need operators
  const [inputMode, setInputMode] = useState<"topic" | "operator">(
    expressionWithGroups.length > 0 ? "operator" : "topic"
  );

  /**
   * Handles adding topic nodes to the expression.
   *
   * @remarks
   * TOPIC COMPLETION: Topics typically come in groups (topic + operator + value),
   * so after adding topics, we switch to operator mode to continue the expression.
   *
   * BATCH ADDITION: Topics can add multiple nodes at once (e.g., "country IS US"
   * adds three nodes), so we spread the nodes array into the expression.
   */
  const handleAddTopic = (nodes: ExpressionNode[]) => {
    // IMMUTABLE UPDATE: Create new array to prevent state corruption
    const newExpression = [...expressionWithGroups, ...nodes];

    onChange(newExpression);
    // STATE TRANSITION: After adding topic(s), user needs to add logical operators
    setInputMode("operator");
  };

  /**
   * Handles adding operator nodes to the expression.
   *
   * @remarks
   * OPERATOR COMPLETION: Logical operators (AND, OR) connect topics, so after
   * adding an operator, we switch to topic mode to add the next condition.
   *
   * SINGLE ADDITION: Operators are always single nodes, unlike topics which
   * can be multi-node sequences.
   */
  const handleAddOperator = (node: ExpressionNode) => {
    // IMMUTABLE UPDATE: Create new array with added operator
    const newExpression = [...expressionWithGroups, node];

    onChange(newExpression);
    // STATE TRANSITION: After adding operator, user needs to add next topic
    setInputMode("topic");
  };

  /**
   * Handles starting a new grouping with opening parenthesis.
   *
   * @remarks
   * GROUPING LOGIC: Opening parentheses don't change the input mode because
   * they're just grouping markers. The next input should still follow the
   * current mode (topic or operator).
   *
   * UI FEEDBACK: Group counting will update to show unbalanced parentheses.
   */
  const handleStartGroup = () => {
    // GROUP MARKER: Add opening parenthesis without changing input mode
    const newExpression = [...expressionWithGroups, "(" as const];
    onChange(newExpression);
    // NOTE: inputMode stays the same - grouping doesn't affect sequence logic
  };

  /**
   * Handles ending a group with closing parenthesis.
   *
   * @remarks
   * GROUP COMPLETION: Closing parentheses complete a logical group but don't
   * change the input mode. The next input should still follow the current
   * expression state (likely needs an operator to continue).
   */
  const handleEndGroup = () => {
    // GROUP MARKER: Add closing parenthesis without changing input mode
    const newExpression = [...expressionWithGroups, ")" as const];
    onChange(newExpression);
    // NOTE: inputMode stays the same - grouping doesn't affect sequence logic
  };

  /**
   * Handles removing items from the expression.
   *
   * @remarks
   * FLEXIBLE REMOVAL: Supports both single item removal (clicking X on one item)
   * and bulk removal (selecting multiple items). The utility function handles
   * both cases efficiently.
   *
   * STATE CONSISTENCY: After removal, the input mode might need adjustment
   * based on the remaining expression structure.
   */
  const handleRemoveItem = (index: number | number[]) => {
    const newExpression = removeItemAtIndex(expressionWithGroups, index);
    onChange(newExpression);
    // TODO: Consider adjusting inputMode based on remaining expression structure
  };

  /**
   * Handles clearing the entire expression.
   *
   * @remarks
   * RESET STATE: Clearing returns to initial state with empty expression
   * and topic input mode (ready to start building a new rule).
   *
   * USER EXPERIENCE: Provides quick way to start over without individual deletions.
   */
  const handleClearAll = () => {
    onChange([]); // Empty expression
    setInputMode("topic"); // Reset to initial state
  };

  // REAL-TIME VALIDATION: Calculate group balance for UI feedback
  const openGroups = getOpenGroupCount(expressionWithGroups);
  const showEndGroup = openGroups > 0; // Show "End Group" button when groups are open

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {t("expressionBuilder.title")}
        </h3>

        {/* EXPRESSION DISPLAY: Visual representation with edit capabilities */}
        <ExpressionDisplay
          expressionWithGroups={expressionWithGroups}
          onRemove={handleRemoveItem}
          onClear={handleClearAll}
          openGroups={openGroups} // For visual balance feedback
        />

        {/* INPUT COMPONENTS: State machine determines which input to show */}
        <div className="space-y-4">
          {inputMode === "topic" ? (
            // TOPIC MODE: User needs to add compliance topics (country, age, etc.)
            <TopicInput
              onAddTopic={handleAddTopic}
              onStartGroup={handleStartGroup} // Allow grouping at topic level
            />
          ) : (
            // OPERATOR MODE: User needs to add logical operators (AND, OR)
            <OperatorInput
              onAddOperator={handleAddOperator}
              onEndGroup={handleEndGroup}
              showEndGroup={showEndGroup} // Only show if groups are open
            />
          )}
        </div>
      </div>
    </div>
  );
}
