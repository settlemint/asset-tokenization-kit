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

  // Create signature without parameter names for decoding
  let decodingSignature = "";

  if (paramTypes.length == 1) {
    // Always wrap single values in a tuple for consistency
    decodingSignature = "(" + paramTypes[0] + ")";
  } else {
    // Multiple parameters - wrap them in a tuple
    decodingSignature = "(" + paramTypes.join(",") + ")";
  }

  let decoded = ethereum.decode(decodingSignature, data);
  if (decoded == null) {
    log.warning("Decoding claim values for topic {} with signature {} failed", [
      topicScheme.name,
      decodingSignature,
    ]);
    const claimValue = fetchIdentityClaimValue(claim, "rawData");
    claimValue.value = data.toHexString();
    claimValue.save();
    return;
  }

  // Always treat the result as a tuple
  let decodedTuple = decoded.toTuple();
  for (let i = 0; i < paramNames.length; i++) {
    let value = convertEthereumValue(decodedTuple[i]);
    let claimValue = fetchIdentityClaimValue(claim, paramNames[i]);
    claimValue.value = value;
    claimValue.save();
  }
}
