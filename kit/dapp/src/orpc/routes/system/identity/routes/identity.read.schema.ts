import { identityClaim } from "@atk/zod/claim";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { isoCountryCode } from "@atk/zod/iso-country-code";
import { z } from "zod";

/**
 * Account metadata returned with an identity item.
 * Contains the address and optional contract metadata.
 */
export const IdentityAccountSchema = z.object({
  id: ethereumAddress,
  contractName: z.string().nullable().optional(),
});

/**
 * Input schema for identity read
 * Supports querying by either wallet address or identity ID
 */
export const IdentityReadSchema = z
  .union([
    z.object({
      wallet: ethereumAddress.describe(
        "The account of the user to read the identity for"
      ),
    }),
    z.object({
      identityId: ethereumAddress.describe(
        "The ID of the identity contract to read"
      ),
    }),
  ])
  .describe("Query by either wallet address or identity ID");

/**
 * Output schema for identity read operations
 */
export const IdentitySchema = z.object({
  /**
   * Unique identifier of the identity - the Ethereum address of the identity contract.
   */
  id: ethereumAddress,

  /**
   * The account associated with this identity (always present)
   */
  account: IdentityAccountSchema,

  /**
   * Whether this identity represents a smart contract
   */
  isContract: z.boolean(),

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
 * GraphQL response schema for identity queries by wallet
 */
export const IdentityByWalletResponseSchema = z.object({
  identityFactory: z
    .object({
      id: ethereumAddress,
      identities: z.array(
        z.object({
          id: ethereumAddress,
          account: z.object({
            id: ethereumAddress,
            contractName: z.string().nullable().optional(),
          }),
          registered: z
            .array(
              z.object({
                id: z.string(),
                country: z.number(),
              })
            )
            .nullable()
            .optional(),
          claims: z.array(identityClaim),
        })
      ),
    })
    .nullable()
    .optional(),
});

/**
 * GraphQL response schema for identity queries by ID
 */
export const IdentityByIdResponseSchema = z.object({
  identity: z
    .object({
      id: ethereumAddress,
      account: z.object({
        id: ethereumAddress,
        contractName: z.string().nullable().optional(),
      }),
      registered: z
        .array(
          z.object({
            id: z.string(),
            country: z.number(),
          })
        )
        .nullable()
        .optional(),
      claims: z.array(identityClaim),
    })
    .nullable()
    .optional(),
});

/**
 * GraphQL response schema for unified identity queries (both wallet and ID)
 */
export const IdentityUnifiedResponseSchema = z.object({
  identities: z
    .array(
      z.object({
        id: ethereumAddress,
        account: z.object({
          id: ethereumAddress,
          contractName: z.string().nullable().optional(),
        }),
        registered: z
          .array(
            z.object({
              id: z.string(),
              country: z.number(),
            })
          )
          .nullable()
          .optional(),
        claims: z.array(identityClaim),
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
export type IdentityAccount = z.infer<typeof IdentityAccountSchema>;
