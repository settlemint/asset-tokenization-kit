import { identityClaim } from "@atk/zod/claim";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { ethereumHex } from "@atk/zod/ethereum-hex";
import { isoCountryCode } from "@atk/zod/iso-country-code";
import { z } from "zod";

/**
 * Input schema for identity read
 */
export const IdentityReadSchema = z.object({
  wallet: ethereumAddress.describe(
    "The account of the user to read the identity for"
  ),
});

/**
 * Output schema for identity read operations
 */
export const IdentitySchema = z.object({
  /**
   * Unique identifier of the identity - the Ethereum address of the identity contract.
   */
  id: ethereumAddress,

  /**
   * The address associated with this identity
   */
  account: ethereumAddress,

  /**
   * The registered identity.
   */
  registered: z
    .object({
      isRegistered: z.literal(true),
      country: isoCountryCode,
    })
    .or(z.literal(false))
    .optional(),

  /**
   * User's identity claims.
   * Returns both claim names and detailed claim information
   */
  claims: z.array(identityClaim).default([]),
});

/**
 * GraphQL response schema for identity queries
 */
export const IdentityResponseSchema = z.object({
  identities: z
    .array(
      z.object({
        id: ethereumAddress,
        account: z.object({
          id: ethereumAddress,
        }),
        claims: z.array(identityClaim),
        registered: z
          .array(
            z.object({
              id: ethereumHex,
              country: z.number(),
            })
          )
          .nullable()
          .optional(),
      })
    )
    .nullable()
    .optional(),
});

/**
 * Type definitions
 */
export type IdentityReadInput = z.infer<typeof IdentityReadSchema>;
export type Identity = z.infer<typeof IdentitySchema>;
