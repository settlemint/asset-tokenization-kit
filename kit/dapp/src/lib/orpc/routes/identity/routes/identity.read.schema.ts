import { ethereumAddress } from "@/lib/utils/zod/validators/ethereum-address";
import { z } from "zod";

export const IdentityReadSchema = z.object({
  identityAddress: ethereumAddress.describe(
    "The identity contract address to read"
  ),
});

/**
 * Schema definition for an Identity entity.
 *
 * Identities are blockchain-based representations of users or entities
 * within the SMART protocol compliance system. They hold claims that
 * verify various attributes required for regulatory compliance.
 */
export const IdentitySchema = z.object({
  /**
   * Unique identifier of the identity - the Ethereum address of the deployed identity contract.
   */
  id: ethereumAddress,
  
  /**
   * The wallet address associated with this identity.
   */
  walletAddress: ethereumAddress,
  
  /**
   * Array of claims associated with this identity.
   * Claims are verified attributes issued by trusted entities.
   */
  claims: z.array(
    z.object({
      topic: z.number().describe("The claim topic (e.g., 1 for KYC)"),
      issuer: ethereumAddress.describe("Address of the claim issuer"),
      signature: z.string().describe("Claim signature"),
      data: z.string().describe("Claim data"),
      uri: z.string().describe("URI pointing to claim metadata"),
    })
  ),
  
  /**
   * Identity metadata.
   */
  metadata: z.object({
    createdAt: z.string().describe("ISO timestamp of identity creation"),
    updatedAt: z.string().describe("ISO timestamp of last update"),
    country: z.string().optional().describe("Country code"),
  }),
});