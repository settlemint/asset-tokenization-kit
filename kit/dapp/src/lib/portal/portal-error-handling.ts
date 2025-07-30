import { baseRouter } from "@/orpc/procedures/base.router";
import { ClientError } from "graphql-request";

/**
 * This mapping is used to map portal error codes to ORPC error codes.
 * By default the portal will throw a 400 error for everything.
 */
const STATUS_CODE_MAPPING = {
  // 400 - Bad Request (Validation & Input Errors)
  AirdropEnded: 400,
  AirdropNotStarted: 400,
  AlreadyDistributed: 400,
  ArrayLengthMismatch: 400,
  BasePriceMustBePositive: 400,
  BatchSizeExceedsLimit: 400,
  BondAlreadyMatured: 400,
  BondInvalidMaturityDate: 400,
  BondNotYetMatured: 400,
  BuyerNotEligible: 400,
  CannotExecuteToZeroAddress: 400,
  CannotRecoverSelf: 400,
  ClaimNotValidAccordingToIssuer: 400,
  CliffExceedsVestingDuration: 400,
  ComplianceCheckFailed: 400,
  DistributionCapExceeded: 400,
  DuplicateSignature: 400,
  EmptyArraysProvided: 400,
  EmptyFlows: 400,
  EmptyName: 400,
  EmptySignature: 400,
  ExceededCap: 400,
  IndexOutOfBounds: 400,
  InitializationWithZeroAddress: 400,
  InvalidAddonAddress: 400,
  InvalidAirdropName: 400,
  InvalidClaimAmount: 400,
  InvalidClaimTrackerAddress: 400,
  InvalidComplianceModuleAddress: 400,
  InvalidFactoryAddress: 400,
  InvalidImplementationInterface: 400,
  InvalidInputArrayLengths: 400,
  InvalidMerkleProof: 400,
  InvalidMerkleRoot: 400,
  InvalidSystemAddress: 400,
  InvalidSystemImplementation: 400,
  InvalidTokenAddress: 400,
  InvalidTokenFactoryAddress: 400,
  InvalidTokenImplementationAddress: 400,
  InvalidTokenImplementationInterface: 400,
  InvalidWithdrawalAddress: 400,
  ZeroAddressNotAllowed: 400,
  ZeroClaimAmount: 400,

  // 401 - Unauthorized (Authentication Errors)
  UnauthorizedAccess: 401,

  // 403 - Forbidden (Authorization & Permission Errors)
  AccessControlUnauthorizedAccount: 403,
  AddressNotOnBypassList: 403,
  ETHTransfersNotAllowed: 403,
  MissingRegistrarRole: 403,

  // 404 - Not Found (Resource Not Found Errors)
  AddressNotFoundInList: 404,
  ClaimDoesNotExist: 404,
  ExecutionIdDoesNotExist: 404,

  // 409 - Conflict (State Conflict Errors)
  AccessManagerAlreadyDeployed: 409,
  AddressAlreadyDeployed: 409,
  AddressAlreadyOnBypassList: 409,
  AlreadyInitialized: 409,
  AuthorizationContractAlreadyRegistered: 409,
  ClaimAlreadyRevoked: 409,
  ComplianceModuleAlreadyRegistered: 409,
  ContractAlreadyLinked: 409,
  DuplicateModule: 409,
  ExecutionAlreadyPerformed: 409,
  ExpectedPause: 409,
  IndexAlreadyClaimed: 409,
  SystemAddonTypeAlreadyRegistered: 409,
  SystemAlreadyBootstrapped: 409,
  TokenFactoryTypeAlreadyRegistered: 409,

  // 500 - Internal Server Error (System Errors)
  AddonRegistryImplementationNotSet: 500,
  AndOrOperationRequiresTwoOperands: 500,
  AndOrOperationsRequireTwoOperands: 500,
  AssociatedContractNotSet: 500,
  AuthorizationContractNotRegistered: 500,
  CommitmentImplementationNotSet: 500, // (if present, otherwise remove)
  ComponentImplementationNotSet: 500,
  ComplianceImplementationNotSet: 500,
  ComplianceModuleRegistryImplementationNotSet: 500,
  ContractIdentityImplementationNotSet: 500,
  ContractMissingIdentityInterface: 500,
  DeploymentAddressMismatch: 500,
  ExecutionFailed: 500,
  IdentityFactoryImplementationNotSet: 500,
  IdentityImplementationNotSet: 500,
  IdentityRegistryImplementationNotSet: 500,
  IdentityRegistryStorageImplementationNotSet: 500,
  ImplementationNotSetInFactory: 500,
  InitializationFailed: 500,
  SystemAccessManagerImplementationNotSet: 500,
  SystemAccessManagerNotSet: 500,
  SystemAddonImplementationNotSet: 500,
  SystemNotBootstrapped: 500,
  TokenAccessManagerImplementationNotSet: 500,
  TokenFactoryImplementationNotSet: 500,
  TokenFactoryRegistryImplementationNotSet: 500,
  TokenImplementationNotSet: 500,
  TopicSchemeRegistryImplementationNotSet: 500,
  TrustedIssuersRegistryImplementationNotSet: 500,
};

export function handlePortalError(
  error: unknown,
  orpcErrors: Parameters<
    Parameters<typeof baseRouter.middleware>[0]
  >[0]["errors"]
): never {
  if (error instanceof ClientError) {
    const errors = error.response?.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const firstError = errors[0];
      const reason = extractRevertReason(
        firstError?.message ?? "Unknown error"
      );
      throw mapToOrcpError(reason, error.request.query, orpcErrors);
    }
  }
  if (error instanceof Error) {
    throw mapToOrcpError(error.message, "unknown", orpcErrors);
  }
  throw mapToOrcpError(String(error), "unknown", orpcErrors);
}

function extractRevertReason(message: string) {
  const match = message.match(/reverted with the following reason: (.*)/i);
  return match && match[1] ? match[1] : message;
}

function mapToOrcpError(
  message: string,
  query: string | string[],
  orpcErrors: Parameters<
    Parameters<typeof baseRouter.middleware>[0]
  >[0]["errors"]
): never {
  const statusCodeForRevertReason =
    STATUS_CODE_MAPPING[message as keyof typeof STATUS_CODE_MAPPING];
  if (!statusCodeForRevertReason) {
    throw orpcErrors.PORTAL_ERROR({
      message,
      data: {
        operation: Array.isArray(query) ? query.join(", ") : query,
        details: message,
      },
    });
  }
  // The portal will throw a 400
  if (statusCodeForRevertReason === 400) {
    throw orpcErrors.INPUT_VALIDATION_FAILED({
      message,
      data: {
        errors: [message],
      },
    });
  }
  if (statusCodeForRevertReason === 401) {
    throw orpcErrors.UNAUTHORIZED({
      message,
    });
  }
  if (statusCodeForRevertReason === 403) {
    throw orpcErrors.FORBIDDEN({
      message,
    });
  }
  if (statusCodeForRevertReason === 404) {
    throw orpcErrors.NOT_FOUND({
      message,
    });
  }
  if (statusCodeForRevertReason === 409) {
    throw orpcErrors.CONFLICT({
      message,
    });
  }
  throw orpcErrors.INTERNAL_SERVER_ERROR({
    message,
  });
}
