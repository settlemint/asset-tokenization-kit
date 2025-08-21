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

  // Create signature based on data format and parameter count
  let decodingSignature = "";
  
  if (hasTupleWrapper) {
    // Data is already tuple-wrapped, use standard signature
    if (paramTypes.length == 1) {
      decodingSignature = paramTypes[0];
    } else {
      decodingSignature = paramTypes.join(",");
    }
  } else {
    // Data is standard ABI-encoded
    if (paramTypes.length == 1) {
      // Single parameter: add tuple wrapper for consistency
      const offsetPointer =
        "0000000000000000000000000000000000000000000000000000000000000020";
      const wrappedDataHex = "0x" + offsetPointer + dataHex.slice(2);
      processedData = Bytes.fromHexString(wrappedDataHex);
      decodingSignature = "(" + paramTypes[0] + ")";
      log.info("Wrapped single param data: {} (length: {})", [
        processedData.toHexString(),
        processedData.toHexString().length.toString()
      ]);
    } else {
      // Multiple parameters: The Graph seems to require tuple signatures
      // but the data format varies based on whether it contains dynamic types
      decodingSignature = "(" + paramTypes.join(",") + ")";
      log.info("Using tuple signature for standard multi-param data: {}", [
        processedData.toHexString()
      ]);
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
    
    // For debugging: try to understand why collateral is failing
    if (topicScheme.name == "collateral" && paramTypes.length == 2) {
      // The data should be exactly 64 bytes (2 * 32)
      log.warning("Collateral claim debug - data length: {}, expected: 64 bytes (130 hex chars with 0x)", [
        dataHex.length.toString()
      ]);
      
      // Try manual extraction to verify the data is correct
      if (data.length == 64) {
        const amount = data.toHexString().substring(2, 66); // First 32 bytes
        const expiry = data.toHexString().substring(66, 130); // Second 32 bytes
        log.warning("Manual extraction - amount hex: {}, expiry hex: {}", [amount, expiry]);
      }
    }
    
    const claimValue = fetchIdentityClaimValue(claim, "rawData");
    claimValue.value = data.toHexString();
    claimValue.save();
    return;
  }

  // Handle decoding result based on what we expect
  if (paramTypes.length == 1) {
    // Single parameter - could be direct value or tuple depending on wrapping
    let value: string;
    if (hasTupleWrapper) {
      // Already tuple-wrapped, decoded as direct value
      value = convertEthereumValue(decoded);
    } else {
      // We wrapped it, so it's now a tuple
      let decodedTuple = decoded.toTuple();
      value = convertEthereumValue(decodedTuple[0]);
    }
    log.info("Decoded single value for {}: {}", [paramNames[0], value]);
    let claimValue = fetchIdentityClaimValue(claim, paramNames[0]);
    claimValue.value = value;
    claimValue.save();
  } else {
    // Multiple parameters - always decode as tuple
    let decodedTuple = decoded.toTuple();
    log.info("Decoded tuple with {} elements", [decodedTuple.length.toString()]);
    for (let i = 0; i < paramNames.length; i++) {
      let value = convertEthereumValue(decodedTuple[i]);
      log.info("Decoded value for {}: {}", [paramNames[i], value]);
      let claimValue = fetchIdentityClaimValue(claim, paramNames[i]);
      claimValue.value = value;
      claimValue.save();
    }
  }
}
