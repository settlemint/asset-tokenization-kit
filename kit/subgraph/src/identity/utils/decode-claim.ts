import { BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { IdentityClaim } from "../../../generated/schema";
import { convertEthereumValue } from "../../event/fetch/event";
import { fetchTopicScheme } from "../../topic-scheme-registry/fetch/topic-scheme";
import { fetchIdentityClaimValue } from "../fetch/identity-claim-value";

export function decodeClaimValues(
  claim: IdentityClaim,
  topicId: BigInt,
  data: Bytes
): void {
  const topicScheme = fetchTopicScheme(topicId);

  // Set the claim name from the topic scheme
  claim.name = topicScheme.name;
  claim.save();

  // Parse the signature to extract parameter names and types
  const signatureWithNames = topicScheme.signature;

  // Split by comma to get individual parameters
  const params = signatureWithNames.split(",");
  const paramNames = new Array<string>();
  const paramTypes = new Array<string>();

  for (let i = 0; i < params.length; i++) {
    const param = params[i].trim();
    const spaceIndex = param.indexOf(" ");

    if (spaceIndex > 0) {
      // Has both type and name
      const type = param.substring(0, spaceIndex);
      const name = param.substring(spaceIndex + 1);
      paramTypes.push(type);
      paramNames.push(name);
    } else {
      // Only type, no name
      paramTypes.push(param);
      paramNames.push("param" + i.toString());
    }
  }

  // Check if the data needs tuple wrapping for The Graph compatibility
  let processedData = data;

  // Detect if data is missing tuple wrapper by checking if it starts with 0x0000...0020
  // Standard ABI-encoded data won't have this offset pointer, tuple-wrapped data will
  const dataHex = data.toHexString();
  const hasTupleWrapper = dataHex.startsWith(
    "0x0000000000000000000000000000000000000000000000000000000000000020"
  );

  log.info("Decoding claim for topic {} - Original data: {} (length: {}), Has tuple wrapper: {}", [
    topicScheme.name,
    dataHex,
    dataHex.length.toString(),
    hasTupleWrapper.toString()
  ]);

  if (!hasTupleWrapper) {
    // Data is standard ABI-encoded, prepend tuple wrapper (32-byte offset pointer)
    const offsetPointer =
      "0000000000000000000000000000000000000000000000000000000000000020";
    const wrappedDataHex = "0x" + offsetPointer + dataHex.slice(2);
    processedData = Bytes.fromHexString(wrappedDataHex);
    log.info("Wrapped data for tuple decoding: {} (length: {})", [
      processedData.toHexString(),
      processedData.toHexString().length.toString()
    ]);
  }

  // Create signature based on whether data is already tuple-wrapped
  let decodingSignature = "";
  if (hasTupleWrapper) {
    // Data is already tuple-wrapped, use standard signature
    if (paramTypes.length == 1) {
      decodingSignature = paramTypes[0];
    } else {
      decodingSignature = paramTypes.join(",");
    }
  } else {
    // Data was just wrapped by us, use tuple signature
    if (paramTypes.length == 1) {
      decodingSignature = "(" + paramTypes[0] + ")";
    } else {
      decodingSignature = "(" + paramTypes.join(",") + ")";
    }
  }

  log.info("Attempting to decode with signature: {} using data: {}", [
    decodingSignature,
    processedData.toHexString()
  ]);

  let decoded = ethereum.decode(decodingSignature, processedData);
  if (decoded == null) {
    log.warning("Decoding claim values for topic {} with signature {} failed. Original data: {}, Processed data: {}, Param types: {}", [
      topicScheme.name,
      decodingSignature,
      dataHex,
      processedData.toHexString(),
      paramTypes.join(",")
    ]);
    const claimValue = fetchIdentityClaimValue(claim, "rawData");
    claimValue.value = data.toHexString();
    claimValue.save();
    return;
  }

  // Handle both single values and tuples based on the data format
  if (paramTypes.length == 1 && hasTupleWrapper) {
    // Single parameter with tuple-wrapped data - decoded directly as the value
    let value = convertEthereumValue(decoded);
    let claimValue = fetchIdentityClaimValue(claim, paramNames[0]);
    claimValue.value = value;
    claimValue.save();
  } else {
    // Multiple parameters or newly wrapped data - should be a tuple
    let decodedTuple = decoded.toTuple();
    for (let i = 0; i < paramNames.length; i++) {
      let value = convertEthereumValue(decodedTuple[i]);
      let claimValue = fetchIdentityClaimValue(claim, paramNames[i]);
      claimValue.value = value;
      claimValue.save();
    }
  }
}
