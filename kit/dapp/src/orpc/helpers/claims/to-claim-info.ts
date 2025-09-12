import type { ClaimInfo } from "@/orpc/helpers/claims/create-claim";
import { convertValue, parseSignature } from "@/orpc/helpers/claims/signature-parser";
import type { ClaimData } from "@/orpc/routes/system/identity/claims/routes/claims.issue.schema";

/**
 * Convert API ClaimData to internal ClaimInfo format with type conversions based on signature.
 * 
 * @param apiClaim - The claim data from the API
 * @param signature - The topic signature defining the data structure
 * @returns The converted claim info for internal use
 */
export function toClaimInfo(apiClaim: ClaimData, signature: string): ClaimInfo {
  const parameters = parseSignature(signature);
  const convertedData: Record<string, unknown> = {};

  // Convert each field based on the signature parameter types
  for (const param of parameters) {
    const value = apiClaim.data[param.name];
    if (value !== undefined) {
      convertedData[param.name] = convertValue(value, param.type);
    }
  }

  return {
    topicName: apiClaim.topicName,
    signature,
    data: convertedData,
  };
}
