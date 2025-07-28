import { Bytes, ethereum, store } from "@graphprotocol/graph-ts";
import {
  ExpressionNode,
  TokenComplianceModule,
} from "../../../generated/schema";
import { fetchTopicScheme } from "../../topic-scheme-registry/fetch/topic-scheme";
import { getEncodedTypeId } from "../../type-identifier/type-identifier";

export function isIdentityVerificationComplianceModule(typeId: Bytes): boolean {
  return typeId.equals(
    getEncodedTypeId("SMARTIdentityVerificationComplianceModule")
  );
}

export function decodeExpressionParams(
  data: Bytes,
  tokenComplianceModule: TokenComplianceModule
): void {
  // Remove existing expression nodes for this compliance module
  clearExpressionNodes(tokenComplianceModule);

  if (data.length === 0) {
    return;
  }

  // Check minimum data length for array offset and length
  if (data.length < 64) {
    return;
  }

  // Skip the first 32 bytes (offset to array)
  let offset = 32;

  // Get array length
  const lenBytes = Bytes.fromUint8Array(data.subarray(offset, offset + 32));
  const lenVal = ethereum.decode("uint256", lenBytes);

  if (lenVal === null) {
    return;
  }

  const arrayLength = lenVal.toBigInt().toI32();
  offset += 32;

  // Check if we have enough data for all elements
  const requiredLength = offset + arrayLength * 64; // Each element needs 64 bytes (32 for type + 32 for value)
  if (data.length < requiredLength) {
    return;
  }

  // Decode each expression node
  for (let i = 0; i < arrayLength; i++) {
    // Each expression node is a tuple (uint8 nodeType, uint256 value)
    const nodeTypeBytes = Bytes.fromUint8Array(
      data.subarray(offset, offset + 32)
    );
    const nodeTypeVal = ethereum.decode("uint8", nodeTypeBytes);

    if (nodeTypeVal === null) {
      continue;
    }

    const nodeType = nodeTypeVal.toI32();
    offset += 32;

    const valueBytes = Bytes.fromUint8Array(data.subarray(offset, offset + 32));
    const valueVal = ethereum.decode("uint256", valueBytes);

    if (valueVal === null) {
      continue;
    }

    const value = valueVal.toBigInt();
    offset += 32;

    // Create ExpressionNode entity
    const nodeId = tokenComplianceModule.id.concat(Bytes.fromI32(i));

    const expressionNode = new ExpressionNode(nodeId);
    expressionNode.complianceModule = tokenComplianceModule.id;
    expressionNode.index = i;

    // Set node type and link to TopicScheme for TOPIC nodes
    if (nodeType === 0) {
      expressionNode.nodeType = "TOPIC";
      // For TOPIC nodes, link to TopicScheme
      const topicScheme = fetchTopicScheme(value);
      expressionNode.topicScheme = topicScheme.id;
    } else if (nodeType === 1) {
      expressionNode.nodeType = "AND";
    } else if (nodeType === 2) {
      expressionNode.nodeType = "OR";
    } else if (nodeType === 3) {
      expressionNode.nodeType = "NOT";
    }

    expressionNode.save();
  }
}

function clearExpressionNodes(
  tokenComplianceModule: TokenComplianceModule
): void {
  // Load and remove existing expression nodes
  // This is a simplified approach - in a real implementation, you might want to
  // track expression nodes more efficiently

  // Since we can't easily query derived fields in mappings, we'll rely on
  // the index-based IDs to remove old nodes
  for (let i = 0; i < 100; i++) {
    // Assume max 100 nodes
    const nodeId = tokenComplianceModule.id.concat(Bytes.fromI32(i));
    const nodeIdHex = nodeId.toHexString();

    if (ExpressionNode.load(nodeId) !== null) {
      store.remove("ExpressionNode", nodeIdHex);
    } else {
      break; // No more nodes found
    }
  }
}
