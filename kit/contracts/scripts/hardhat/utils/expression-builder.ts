import { encodeAbiParameters, parseAbiParameters } from "viem";
import { ATKTopic } from "../constants/topics";
import { topicManager } from "../services/topic-manager";

/// @notice Enum matching ExpressionType from Solidity
export enum ExpressionType {
  TOPIC = 0,
  AND = 1,
  OR = 2,
  NOT = 3,
}

/// @notice Interface matching ExpressionNode struct from Solidity
export interface ExpressionNode {
  nodeType: ExpressionType;
  value: bigint;
}

/// @notice Encodes an array of ExpressionNode objects for use with SMARTIdentityVerificationComplianceModule
/// @param expressions Array of expression nodes representing the logical expression
/// @returns Encoded bytes suitable for passing as compliance module parameters
export const encodeExpressionParams = (expressions: ExpressionNode[]) => {
  return encodeAbiParameters(parseAbiParameters("(uint8,uint256)[]"), [
    expressions.map((expr) => [expr.nodeType as number, expr.value] as const),
  ]);
};

/// @notice Expression builder class for creating logical expressions with fluent API
export class ExpressionBuilder {
  private nodes: ExpressionNode[] = [];

  /// @notice Add a topic node to the expression
  /// @param topic ATK topic enum, custom topic name, or raw topic ID
  /// @returns Builder instance for chaining
  topic(topic: ATKTopic | string | number | bigint): ExpressionBuilder {
    this.nodes.push(createTopicNode(topic));
    return this;
  }

  /// @notice Add a topic and immediately apply AND operation with previous operand
  /// @param topic ATK topic enum, custom topic name, or raw topic ID
  /// @returns Builder instance for chaining
  and(topic: ATKTopic | string | number | bigint): ExpressionBuilder {
    this.nodes.push(createTopicNode(topic));
    this.nodes.push(AND_NODE);
    return this;
  }

  /// @notice Add a topic and immediately apply OR operation with previous operand
  /// @param topic ATK topic enum, custom topic name, or raw topic ID
  /// @returns Builder instance for chaining
  or(topic: ATKTopic | string | number | bigint): ExpressionBuilder {
    this.nodes.push(createTopicNode(topic));
    this.nodes.push(OR_NODE);
    return this;
  }

  /// @notice Apply AND operation to the two most recent operands
  /// @returns Builder instance for chaining
  get AND(): ExpressionBuilder {
    this.nodes.push(AND_NODE);
    return this;
  }

  /// @notice Apply OR operation to the two most recent operands
  /// @returns Builder instance for chaining
  get OR(): ExpressionBuilder {
    this.nodes.push(OR_NODE);
    return this;
  }

  /// @notice Apply NOT operation to the most recent operand
  /// @returns Builder instance for chaining
  get NOT(): ExpressionBuilder {
    this.nodes.push(NOT_NODE);
    return this;
  }

  /// @notice Build the expression array
  /// @returns Array of ExpressionNode objects
  build(): ExpressionNode[] {
    return [...this.nodes];
  }

  /// @notice Build and encode the expression in one step
  /// @returns Encoded bytes suitable for compliance module parameters
  encode(): `0x${string}` {
    return encodeExpressionParams(this.nodes);
  }

  /// @notice Reset the builder to start a new expression
  /// @returns Builder instance for chaining
  reset(): ExpressionBuilder {
    this.nodes = [];
    return this;
  }

  /// @notice Get the current number of nodes in the expression
  /// @returns Number of nodes
  get length(): number {
    return this.nodes.length;
  }

  /// @notice Check if the expression is empty
  /// @returns True if no nodes have been added
  get isEmpty(): boolean {
    return this.nodes.length === 0;
  }

  /// @notice Convert the expression to a human-readable string representation
  /// @returns String representation of the logical expression in infix notation
  toString(): string {
    if (this.nodes.length === 0) {
      return "EMPTY";
    }

    return expressionToString(this.nodes);
  }
}

/// @notice Create a new expression builder instance
/// @returns New ExpressionBuilder instance
export const expressionBuilder = (): ExpressionBuilder =>
  new ExpressionBuilder();

/// @notice Convert an expression array to a human-readable string representation
/// @param nodes Array of expression nodes in postfix notation
/// @returns String representation of the logical expression in infix notation
export const expressionToString = (nodes: ExpressionNode[]): string => {
  if (nodes.length === 0) {
    return "EMPTY";
  }

  const stack: string[] = [];

  for (const node of nodes) {
    if (node.nodeType === ExpressionType.TOPIC) {
      // Try to get topic name from topic manager, fallback to topic ID
      const topicName = getTopicNameFromId(node.value);
      stack.push(topicName);
    } else if (node.nodeType === ExpressionType.AND) {
      if (stack.length < 2) {
        throw new Error("Invalid expression: AND requires two operands");
      }
      const right = stack.pop()!;
      const left = stack.pop()!;
      stack.push(`(${left} AND ${right})`);
    } else if (node.nodeType === ExpressionType.OR) {
      if (stack.length < 2) {
        throw new Error("Invalid expression: OR requires two operands");
      }
      const right = stack.pop()!;
      const left = stack.pop()!;
      stack.push(`(${left} OR ${right})`);
    } else if (node.nodeType === ExpressionType.NOT) {
      if (stack.length < 1) {
        throw new Error("Invalid expression: NOT requires one operand");
      }
      const operand = stack.pop()!;
      stack.push(`NOT ${operand}`);
    }
  }

  if (stack.length !== 1) {
    throw new Error("Invalid expression: must evaluate to exactly one result");
  }

  return stack[0];
};

/// @notice Helper function to get topic name from topic ID
/// @param topicId The topic ID to look up
/// @returns Topic name if found, otherwise formatted topic ID
const getTopicNameFromId = (topicId: bigint): string => {
  // Try to find the topic name from the topic manager
  const topicName = topicManager.getTopicName(topicId);
  if (topicName) {
    return topicName.toUpperCase();
  }

  // Check if it's a known ATKTopic
  for (const [key, value] of Object.entries(ATKTopic)) {
    if (topicManager.getTopicId(value) === topicId) {
      return key.toUpperCase();
    }
  }

  // Fallback to topic ID
  return `TOPIC_${topicId.toString()}`;
};

/// @notice Helper function to create a TOPIC expression node from a raw topic ID
/// @param topicId The claim topic ID (must be > 0)
/// @returns ExpressionNode representing a topic requirement
export function createTopicNode(topicId: number | bigint): ExpressionNode;
/// @notice Helper function to create a TOPIC expression node using ATKTopic enum
/// @param topic The ATK topic enum value
/// @returns ExpressionNode representing a topic requirement
export function createTopicNode(topic: ATKTopic): ExpressionNode;
/// @notice Helper function to create a TOPIC expression node using topic name
/// @param topicName The topic name string
/// @returns ExpressionNode representing a topic requirement
export function createTopicNode(topicName: string): ExpressionNode;
/// @notice Helper function to create a TOPIC expression node from any valid input
/// @param input The topic identifier (ATK enum, custom name, or raw ID)
/// @returns ExpressionNode representing a topic requirement
export function createTopicNode(
  input: ATKTopic | string | number | bigint
): ExpressionNode;
export function createTopicNode(
  topicIdOrName: number | bigint | ATKTopic | string
): ExpressionNode {
  let topicId: bigint;

  if (typeof topicIdOrName === "string") {
    // Using topic name (ATKTopic enum value or custom name)
    topicId = topicManager.getTopicId(topicIdOrName);
  } else if (
    typeof topicIdOrName === "number" ||
    typeof topicIdOrName === "bigint"
  ) {
    // Using raw topic ID
    topicId = BigInt(topicIdOrName);
    if (topicId <= 0n) {
      throw new Error("Topic ID must be greater than 0");
    }
  } else {
    throw new Error("Invalid topic parameter type");
  }

  return {
    nodeType: ExpressionType.TOPIC,
    value: topicId,
  };
}

/// @notice Constant AND expression node
export const AND_NODE: ExpressionNode = {
  nodeType: ExpressionType.AND,
  value: 0n,
} as const;

/// @notice Constant OR expression node
export const OR_NODE: ExpressionNode = {
  nodeType: ExpressionType.OR,
  value: 0n,
} as const;

/// @notice Constant NOT expression node
export const NOT_NODE: ExpressionNode = {
  nodeType: ExpressionType.NOT,
  value: 0n,
} as const;

/// @notice Helper function to build complex expressions (legacy API)
/// @example
/// // Using builder pattern (recommended)
/// const encoded = expressionBuilder()
///   .topic(ATKTopic.kyc)
///   .and(ATKTopic.aml)
///   .or("vaultAccess")
///   .encode();
///
/// // Using fluent style
/// const expression = expressionBuilder()
///   .topic(ATKTopic.kyc)
///   .topic(ATKTopic.aml)
///   .AND
///   .topic("vaultAccess")
///   .OR
///   .build();
///
/// // Legacy array-based approach
/// const expression3 = buildExpression([
///   createTopicNode(ATKTopic.kyc),
///   createTopicNode(ATKTopic.aml),
///   AND_NODE,
/// ]);
export const buildExpression = (nodes: ExpressionNode[]): ExpressionNode[] =>
  nodes;
