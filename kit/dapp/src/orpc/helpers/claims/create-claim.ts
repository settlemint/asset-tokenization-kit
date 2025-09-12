import type { SessionUser } from "@/lib/auth";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { getVerificationId } from "@/orpc/helpers/get-verification-id";
import { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { handleWalletVerificationChallenge } from "@settlemint/sdk-portal";
import {
  Address,
  encodeAbiParameters,
  encodePacked,
  isHex,
  keccak256,
  parseAbiParameters,
} from "viem";
import { parseSignature, convertValue } from "./signature-parser";

/**
 * GraphQL mutation for signing a message with a wallet.
 */
const SIGN_MESSAGE_MUTATION = portalGraphql(`
  mutation SignMessage($address: String!, $data: String!, $challengeId: String!, $challengeResponse: String!) {
    walletSignMessage(userWalletAddress: $address, data: $data, challengeId: $challengeId, challengeResponse: $challengeResponse) {
      signature
    }
  }
`);

/**
 * Input parameters for creating a claim.
 */
export interface CreateClaimInput {
  /**
   * Wallet address of the issuer of the claim
   */
  user: SessionUser;
  /**
   * Wallet verification of the user
   */
  walletVerification: UserVerification;
  /**
   * Identity to issue the claim to
   */
  identity: Address;
  /**
   * Claim info
   */
  claim: DynamicClaim;
}

/**
 * Dynamic claim structure that can work with any registered topic.
 */
export interface DynamicClaim {
  /**
   * The topic name as registered in the blockchain registry
   */
  topicName: string;
  /**
   * The function signature that defines the data structure
   */
  signature: string;
  /**
   * The claim data matching the signature structure
   */
  data: Record<string, unknown>;
}

/**
 * Type alias for dynamic claim to maintain compatibility.
 */
export type ClaimInfo = DynamicClaim;

/**
 * Generates a signed claim for a user and identity.
 *
 * @param params - The claim creation parameters, including user, wallet verification, identity address, and claim details.
 * @returns An object containing the encoded claim data, signature, and topic ID.
 * @throws {Error} If verification ID is not found or signature is invalid.
 */
export async function createClaim({
  user,
  walletVerification,
  identity,
  claim,
}: CreateClaimInput) {
  const topicId = BigInt(keccak256(encodePacked(["string"], [claim.topicName])));
  const verificationId = getVerificationId(
    user,
    walletVerification.verificationType
  );
  if (!verificationId) {
    throw new Error("Verification ID not found");
  }

  const verificationOptions = await handleWalletVerificationChallenge({
    portalClient,
    portalGraphql,
    userWalletAddress: user.wallet,
    verificationId,
    verificationType: walletVerification.verificationType,
    code: walletVerification.secretVerificationCode,
  });

  const claimData = encodeClaimData(claim.signature, claim.data);
  const dataToSign = encodeAbiParameters(
    parseAbiParameters(
      "address subject, uint256 topicValue, bytes memory dataBytes"
    ),
    [identity, topicId, claimData]
  );
  const dataHash = keccak256(dataToSign);
  const response = await portalClient.request(SIGN_MESSAGE_MUTATION, {
    address: user.wallet,
    data: dataHash,
    challengeId: verificationOptions.challengeId,
    challengeResponse: verificationOptions.challengeResponse,
  });

  if (!isHex(response.walletSignMessage?.signature)) {
    throw new Error("Signature is not a valid hex string");
  }

  return {
    claimData,
    signature: response.walletSignMessage.signature,
    topicId,
  };
}

/**
 * Encodes claim data into ABI-encoded bytes based on the topic signature.
 *
 * @param signature - The function signature defining the data structure
 * @param data - The claim data to encode
 * @returns The ABI-encoded claim data as a byte string
 * @throws {Error} If the signature is invalid or data doesn't match
 */
function encodeClaimData(signature: string, data: Record<string, unknown>) {
  const parameters = parseSignature(signature);
  
  if (parameters.length === 0) {
    // Empty signature means no data
    return encodeAbiParameters([], []);
  }

  // Build type definitions for encoding
  const types = parameters.map(param => ({
    type: param.type,
    name: param.name
  }));

  // Extract and convert values based on parameter order
  const values = parameters.map(param => {
    const value = data[param.name];
    if (value === undefined) {
      throw new Error(`Missing required parameter: ${param.name}`);
    }
    return convertValue(value, param.type);
  });

  return encodeAbiParameters(types, values);
}
