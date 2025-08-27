import { BigInt, Bytes, ethereum, store } from "@graphprotocol/graph-ts";
import { ExpressionNode } from "../../../generated/schema";
import { fetchTopicScheme } from "../../topic-scheme-registry/fetch/topic-scheme";

// Shared ExpressionNode struct as defined in contracts/smart/interface/structs/ExpressionNode.sol
// struct ExpressionNode {
//   ExpressionType nodeType; // uint8 enum (TOPIC=0, AND=1, OR=2, NOT=3)
//   uint256 value;           // Topic ID for TOPIC nodes, ignored for operators
// }
export class DecodedExpressionNode {
  nodeType: i32; // 0=TOPIC, 1=AND, 2=OR, 3=NOT
  value: BigInt;

  constructor(nodeType: i32, value: BigInt) {
    this.nodeType = nodeType;
    this.value = value;
  }
}

/**
 * Decode an array of ExpressionNode structs from ABI-encoded data
 * @param encodedArray The ABI-encoded (uint8,uint256)[] array
 * @returns Array of decoded expression nodes
 */
export function decodeExpressionNodeArray(
  encodedArray: ethereum.Value
): Array<DecodedExpressionNode> {
  const array = encodedArray.toArray();
  const nodes: DecodedExpressionNode[] = [];

  for (let i = 0; i < array.length; i++) {
    const nodeTuple = array[i].toTuple();
    if (nodeTuple.length >= 2) {
      const nodeType = nodeTuple[0].toI32(); // ExpressionType enum as uint8
      const value = nodeTuple[1].toBigInt();
      nodes.push(new DecodedExpressionNode(nodeType, value));
    }
    // Skip malformed tuples - they won't be added to the result array
    // This prevents undefined entries while maintaining array integrity
  }

  return nodes;
}

/**
 * Create ExpressionNode entities from decoded nodes with specific parent reference
 * @param baseId The base ID to generate unique node IDs from
 * @param nodes Array of decoded expression nodes
 * @param setParent Function to set the appropriate parent reference on the ExpressionNode
 */
export function createExpressionNodeEntities(
  baseId: Bytes,
  nodes: Array<DecodedExpressionNode>,
  setParent: (node: ExpressionNode, baseId: Bytes) => void
): void {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodeId = baseId.concat(Bytes.fromI32(i));

    const expressionNode = new ExpressionNode(nodeId);
    expressionNode.index = i;

    // Set the appropriate parent reference using the provided function
    setParent(expressionNode, baseId);

    // Set node type based on the enum value
    if (node.nodeType === 0) {
      expressionNode.nodeType = "TOPIC";
      // For TOPIC nodes, link to TopicScheme if needed
      const topicScheme = fetchTopicScheme(node.value);
      expressionNode.topicScheme = topicScheme.id;
    } else if (node.nodeType === 1) {
      expressionNode.nodeType = "AND";
    } else if (node.nodeType === 2) {
      expressionNode.nodeType = "OR";
    } else if (node.nodeType === 3) {
      expressionNode.nodeType = "NOT";
    }

    expressionNode.save();
  }
}

/**
 * Clear existing expression nodes by iterating sequentially
 * More efficient than trying to query all related nodes
 * @param baseId The base ID used to generate node IDs
 */
export function clearExpressionNodeEntities(baseId: Bytes): void {
  let i = 0;
  while (true) {
    const nodeId = baseId.concat(Bytes.fromI32(i));
    const existingNode = ExpressionNode.load(nodeId);

    if (existingNode !== null) {
      store.remove("ExpressionNode", nodeId.toHexString());
      i++;
    } else {
      // No more sequential nodes found - we're done
      break;
    }
  }
}