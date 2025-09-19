import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
  ComplianceModuleParameters,
  ExpressionNode,
} from "../../../generated/schema";
import { getEncodedTypeId } from "../../type-identifier/type-identifier";
import {
  DecodedExpressionNode,
  clearExpressionNodeEntities,
  createExpressionNodeEntities,
} from "../shared/expression-nodes";

export function isIdentityVerificationComplianceModule(typeId: Bytes): boolean {
  return typeId.equals(
    getEncodedTypeId("SMARTIdentityVerificationComplianceModule")
  );
}

export function decodeExpressionParams(
  complianceModuleParameters: ComplianceModuleParameters,
  data: Bytes,
  topicSchemeRegistry: Bytes
): void {
  // Clear existing expression nodes using shared utility
  clearExpressionNodeEntities(complianceModuleParameters.id);

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

  // Decode each expression node into DecodedExpressionNode array
  const nodes: DecodedExpressionNode[] = [];
  for (let i = 0; i < arrayLength; i++) {
    // Each expression node is a tuple (uint8 nodeType, uint256 value)
    const nodeTypeBytes = Bytes.fromUint8Array(
      data.subarray(offset, offset + 32)
    );
    const nodeTypeVal = ethereum.decode("uint8", nodeTypeBytes);

    if (nodeTypeVal === null) {
      offset += 64; // Skip both type and value
      continue;
    }

    const nodeType = nodeTypeVal.toI32();
    offset += 32;

    const valueBytes = Bytes.fromUint8Array(data.subarray(offset, offset + 32));
    const valueVal = ethereum.decode("uint256", valueBytes);

    if (valueVal === null) {
      offset += 32;
      continue;
    }

    const value = valueVal.toBigInt();
    offset += 32;

    nodes.push(new DecodedExpressionNode(nodeType, value));
  }

  // Create ExpressionNode entities using shared utility
  createExpressionNodeEntities(
    complianceModuleParameters.id,
    nodes,
    (node: ExpressionNode, baseId: Bytes) => {
      node.parameters = baseId;
    },
    topicSchemeRegistry
  );
}
