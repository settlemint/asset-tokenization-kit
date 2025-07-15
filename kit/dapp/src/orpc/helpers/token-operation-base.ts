import type { ValidatedPortalClient } from "@/orpc/middlewares/services/portal.middleware";
import type { z } from "zod";
import type { TadaDocumentNode } from "gql.tada";
import type { Variables } from "graphql-request";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import {
  validateTokenCapability,
  supportsInterface,
} from "@/orpc/helpers/interface-detection";
import { validateRole, type TokenRole } from "@/orpc/helpers/role-validation";
import type { InterfaceId } from "@/lib/interface-ids";
import type { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { SessionUser } from "@/lib/auth";

/**
 * Base configuration for token operations
 */
export interface TokenOperationConfig {
  /** Human-readable operation name for error messages */
  operationName: string;
  /** Required interface for the operation (optional) */
  requiredInterface?: InterfaceId;
  /** Required role for the operation (optional) */
  requiredRole?: TokenRole;
  /** Custom validation function (optional) */
  validate?: (context: TokenOperationContext) => Promise<void>;
}

/**
 * Context available to token operations
 */
export interface TokenOperationContext {
  /** Portal client for GraphQL operations */
  portalClient: ValidatedPortalClient;
  /** Contract address */
  contract: string;
  /** Sender user object */
  sender: SessionUser;
  /** Challenge response credentials */
  challengeResponse: {
    verificationId?: string;
    challengeResponse?: string;
  };
  /** ORPC errors object */
  errors: Record<string, (params: unknown) => Error>;
}

/**
 * Input for token operations
 */
export interface TokenOperationInput {
  contract: string;
  verification: z.infer<typeof UserVerificationSchema>;
  messages?: Record<string, string>;
}

/**
 * Helper functions for common token operation patterns
 */
export const TokenOperationHelper = {
  /**
   * Validates the operation prerequisites
   */
  async validateOperation(
    config: TokenOperationConfig,
    context: TokenOperationContext
  ): Promise<void> {
    const { requiredInterface, requiredRole, validate } = config;
    const { portalClient, contract, sender } = context;

    // Check interface support
    if (requiredInterface) {
      await validateTokenCapability(
        portalClient,
        contract,
        requiredInterface,
        config.operationName
      );
    }

    // Check role permissions
    if (requiredRole) {
      await validateRole(
        portalClient,
        contract,
        sender.wallet,
        requiredRole,
        config.operationName
      );
    }

    // Run custom validation
    if (validate) {
      await validate(context);
    }
  },

  /**
   * Executes a single token operation
   */
  async *executeSingleOperation<TVariables extends Variables>(
    mutation: TadaDocumentNode<unknown, TVariables>,
    variables: TVariables,
    context: TokenOperationContext,
    messages: Record<string, string>,
    errorMessage: string
  ): AsyncGenerator<unknown, string, void> {
    const transactionHash = yield* context.portalClient.mutate(
      mutation,
      variables,
      errorMessage,
      messages
    );
    return getEthereumHash(transactionHash);
  },

  /**
   * Executes a batch token operation
   */
  async *executeBatchOperation<TVariables extends Variables>(
    mutation: TadaDocumentNode<unknown, TVariables>,
    variables: TVariables,
    context: TokenOperationContext,
    messages: Record<string, string>,
    errorMessage: string
  ): AsyncGenerator<unknown, string, void> {
    const transactionHash = yield* context.portalClient.mutate(
      mutation,
      variables,
      errorMessage,
      messages
    );
    return getEthereumHash(transactionHash);
  },

  /**
   * Handles challenge response for verification
   */
  async handleVerification(
    sender: SessionUser,
    verification: z.infer<typeof UserVerificationSchema>
  ): Promise<{ verificationId?: string; challengeResponse?: string }> {
    return handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });
  },

  /**
   * Checks if an interface is supported with a specific fallback
   */
  async checkInterfaceWithFallback(
    portalClient: ValidatedPortalClient,
    contract: string,
    primaryInterface: string,
    fallbackInterface?: string
  ): Promise<boolean> {
    const results = await Promise.all([
      supportsInterface(portalClient, contract, primaryInterface),
      fallbackInterface
        ? supportsInterface(portalClient, contract, fallbackInterface)
        : Promise.resolve(false),
    ]);

    return results[0] || results[1];
  },

  /**
   * Converts amounts to string format for GraphQL
   */
  formatAmounts(amounts: (string | number | bigint)[]): string[] {
    return amounts.map((a) => a.toString());
  },

  /**
   * Formats a single amount for GraphQL
   */
  formatAmount(amount: string | number | bigint): string {
    return amount.toString();
  },
};

/**
 * Base class for token operations that follow a common pattern
 */
export abstract class BaseTokenOperation<TInput extends TokenOperationInput> {
  protected abstract config: TokenOperationConfig;

  /**
   * Main handler for the operation
   */
  async *handler(
    input: TInput,
    context: TokenOperationContext
  ): AsyncGenerator<unknown, string, void> {
    // Validate operation prerequisites
    await TokenOperationHelper.validateOperation(this.config, context);

    // Handle verification
    const challengeResponse = await TokenOperationHelper.handleVerification(
      context.sender,
      input.verification
    );

    // Update context with challenge response
    const updatedContext = {
      ...context,
      challengeResponse,
    };

    // Execute the specific operation
    return yield* this.execute(input, updatedContext);
  }

  /**
   * Execute the specific operation (to be implemented by subclasses)
   */
  protected abstract execute(
    input: TInput,
    context: TokenOperationContext
  ): AsyncGenerator<unknown, string, void>;
}
