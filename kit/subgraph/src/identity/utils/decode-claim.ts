import { Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { IdentityClaim, TopicScheme } from "../../../generated/schema";
import { convertEthereumValue } from "../../event/fetch/event";
import { fetchIdentityClaimValue } from "../fetch/identity-claim-value";

export function decodeClaimValues(
  claim: IdentityClaim,
  topicScheme: TopicScheme,
  data: Bytes
): void {
  // Set the claim name from the topic scheme
  claim.name = topicScheme.name;
  claim.save();

  // Parse the signature to extract parameter names and types
  const signatureWithNames = topicScheme.signature;
  const normalizedSignature = signatureWithNames.trim();

  if (normalizedSignature.length === 0) {
    log.warning("Skipping decode for topic {} because signature missing", [
      topicScheme.name,
    ]);
    const claimValue = fetchIdentityClaimValue(claim, "rawData");
    claimValue.value = data.toHexString();
    claimValue.save();
    return;
  }

  // Split by comma to get individual parameters
  const params = normalizedSignature.split(",");
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

  // Try graceful fallback decoding approaches
  let decoded: ethereum.Value | null = null;
  let successfulSignature = "";
  let standardSignature = paramTypes.join(",");
  let tupleSignature = "(" + paramTypes.join(",") + ")";

  // Approach 1: Try standard signature with original data (only for single parameters)
  if (paramTypes.length == 1) {
    decoded = ethereum.decode(standardSignature, data);
    if (decoded != null) {
      successfulSignature = standardSignature;
      log.info("Standard signature succeeded for topic: {}", [
        topicScheme.name,
      ]);
    }
  }

  // Approach 2: Try tuple signature with original data
  if (decoded == null) {
    decoded = ethereum.decode(tupleSignature, data);
    if (decoded != null) {
      successfulSignature = tupleSignature;
      log.info("Tuple signature succeeded for topic: {}", [topicScheme.name]);
    }
  }

  // Approach 3: Try tuple signature with 0x20 prefixed data
  if (decoded == null) {
    let dataHex = data.toHexString();
    let prefixedDataHex =
      "0x0000000000000000000000000000000000000000000000000000000000000020" +
      dataHex.slice(2);
    let prefixedData = Bytes.fromHexString(prefixedDataHex);

    decoded = ethereum.decode(tupleSignature, prefixedData);
    if (decoded != null) {
      successfulSignature = tupleSignature;
      log.info("Tuple signature with 0x20 prefix succeeded for topic: {}", [
        topicScheme.name,
      ]);
    }
  }

  if (decoded == null) {
    log.warning("All decoding approaches failed for topic {} with data: {}", [
      topicScheme.name,
      data.toHexString(),
    ]);
    let claimValue = fetchIdentityClaimValue(claim, "rawData");
    claimValue.value = data.toHexString();
    claimValue.save();
    return;
  }

  log.info("Successfully decoded claim {} using signature: {}", [
    topicScheme.name,
    successfulSignature,
  ]);

  // Handle decoding based on number of expected parameters
  if (paramTypes.length == 1) {
    // Single parameter - could be direct value or tuple with one element
    let value: string;
    if (successfulSignature.startsWith("(")) {
      // Tuple signature was used, extract from tuple
      let decodedTuple = decoded.toTuple();
      value = convertEthereumValue(decodedTuple[0]);
    } else {
      // Standard signature was used, direct value
      value = convertEthereumValue(decoded);
    }
    let claimValue = fetchIdentityClaimValue(claim, paramNames[0]);
    claimValue.value = value;
    claimValue.save();
  } else {
    // Multiple parameters - always decoded using tuple signature, so always extract from tuple
    let decodedTuple = decoded.toTuple();
    for (let i = 0; i < paramNames.length; i++) {
      let value = convertEthereumValue(decodedTuple[i]);
      let claimValue = fetchIdentityClaimValue(claim, paramNames[i]);
      claimValue.value = value;
      claimValue.save();
    }
  }
}
