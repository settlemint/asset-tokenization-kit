import type { ORPCError } from "@orpc/server";
import { useTranslation } from "react-i18next";

/**
 * Check if error is an ORPC error
 * @param error
 */
export function isORPCError(
  error: unknown
): error is ORPCError<string, unknown> {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    "status" in error
  );
}

/**
 * Helper function to extract error code from error object
 * @param error
 */
export function getErrorCode(error: unknown): string | number {
  // For ORPC errors, use the status code
  if (isORPCError(error)) {
    return error.status || error.code || "500";
  }

  // Type guard for error-like objects
  const errorObj = error as Record<string, unknown> | null | undefined;

  // Check for common error code patterns
  if (errorObj?.status) return errorObj.status as string | number;
  if (errorObj?.statusCode) return errorObj.statusCode as string | number;
  if (errorObj?.code) return errorObj.code as string | number;
  if (errorObj?.response && typeof errorObj.response === "object") {
    const response = errorObj.response as Record<string, unknown>;
    if (response.status) return response.status as string | number;
    if (response.statusCode) return response.statusCode as string | number;
  }

  // Default to 500 for unknown errors
  return "500";
}

/**
 * Hook to get error title from error object
 * @param error
 */
export function useErrorTitle(error: unknown): string {
  const { t } = useTranslation("general");

  // For ORPC errors, try to get title from translations based on code
  if (isORPCError(error)) {
    // Try to get translation for specific error code
    // For now, we'll use the switch statement below for translations

    // Map ORPC error codes to friendly titles
    switch (error.code) {
      case "UNAUTHORIZED":
        return t("errors.unauthorized.title");
      case "FORBIDDEN":
        return t("errors.forbidden.title");
      case "NOT_FOUND":
        return t("errors.notFound.title");
      case "INPUT_VALIDATION_FAILED":
      case "OUTPUT_VALIDATION_FAILED":
        return t("errors.validation.title");
      case "RATE_LIMIT_EXCEEDED":
        return t("errors.rateLimit.title");
      case "TRANSACTION_FAILED":
        return t("errors.transaction.title");
      case "TIMEOUT":
        return t("errors.timeout.title");
      case "PORTAL_ERROR":
        return t("errors.portal.title");
      case "INTERNAL_SERVER_ERROR":
        return t("errors.internal.title");
      case "BLOCKCHAIN_ERROR":
        return t("errors.blockchain.title");
      case "CONTRACT_ERROR":
        return t("errors.contract.title");
      case "INSUFFICIENT_FUNDS":
        return t("errors.insufficientFunds.title");
      case "NETWORK_ERROR":
        return t("errors.network.title");
      case "NOT_ONBOARDED":
        return t("errors.notOnboarded.title");
      case "SYSTEM_NOT_CREATED":
        return t("errors.systemNotCreated.title");
      case "RESOURCE_ALREADY_EXISTS":
        return t("errors.resourceAlreadyExists.title");
      default:
        return t("errors.generic.title");
    }
  }

  // Type guard for error-like objects
  const errorObj = error as Record<string, unknown> | null | undefined;

  // Check for common error title patterns
  if (errorObj?.statusText && typeof errorObj.statusText === "string")
    return errorObj.statusText;
  if (errorObj?.title && typeof errorObj.title === "string")
    return errorObj.title;
  if (errorObj?.name && typeof errorObj.name === "string") return errorObj.name;
  if (errorObj?.response && typeof errorObj.response === "object") {
    const response = errorObj.response as Record<string, unknown>;
    if (response.statusText && typeof response.statusText === "string")
      return response.statusText;
  }

  // Map common HTTP status codes to more specific titles
  const errorCode = getErrorCode(error);
  switch (errorCode) {
    case 400:
    case "400":
      return t("errors.badRequest.title");
    case 401:
    case "401":
      return t("errors.unauthorized.title");
    case 403:
    case "403":
      return t("errors.forbidden.title");
    case 404:
    case "404":
      return t("errors.notFound.title");
    case 408:
    case "408":
      return t("errors.timeout.title");
    case 409:
    case "409":
      return t("errors.conflict.title");
    case 422:
    case "422":
      return t("errors.validation.title");
    case 429:
    case "429":
      return t("errors.rateLimit.title");
    case 500:
    case "500":
      return t("errors.internal.title");
    case 502:
    case "502":
      return t("errors.badGateway.title");
    case 503:
    case "503":
      return t("errors.serviceUnavailable.title");
    case 504:
    case "504":
      return t("errors.gatewayTimeout.title");
    default:
      return t("errors.generic.title");
  }
}

/**
 * Hook to get error description from error object
 * @param error
 */
export function useErrorDescription(error: unknown): string {
  const { t } = useTranslation("general");

  // For ORPC errors, use the message or try translations
  if (isORPCError(error)) {
    if (error.message) return error.message;

    // Map ORPC error codes to friendly descriptions
    switch (error.code) {
      case "UNAUTHORIZED":
        return t("errors.unauthorized.description");
      case "FORBIDDEN":
        return t("errors.forbidden.description");
      case "NOT_FOUND":
        return t("errors.notFound.description");
      case "INPUT_VALIDATION_FAILED":
      case "OUTPUT_VALIDATION_FAILED":
        return t("errors.validation.description");
      case "RATE_LIMIT_EXCEEDED":
        return t("errors.rateLimit.description");
      case "TRANSACTION_FAILED":
        return t("errors.transaction.description");
      case "TIMEOUT":
        return t("errors.timeout.description");
      case "PORTAL_ERROR":
        return t("errors.portal.description");
      case "INTERNAL_SERVER_ERROR":
        return t("errors.internal.description");
      case "BLOCKCHAIN_ERROR":
        return t("errors.blockchain.description");
      case "CONTRACT_ERROR":
        return t("errors.contract.description");
      case "INSUFFICIENT_FUNDS":
        return t("errors.insufficientFunds.description");
      case "NETWORK_ERROR":
        return t("errors.network.description");
      case "NOT_ONBOARDED":
        return t("errors.notOnboarded.description");
      case "SYSTEM_NOT_CREATED":
        return t("errors.systemNotCreated.description");
      case "RESOURCE_ALREADY_EXISTS":
        return t("errors.resourceAlreadyExists.description");
      default:
        return t("errors.generic.description");
    }
  }

  // Type guard for error-like objects
  const errorObj = error as Record<string, unknown> | null | undefined;

  // Check for common error message patterns
  if (errorObj?.message && typeof errorObj.message === "string")
    return errorObj.message;
  if (errorObj?.description && typeof errorObj.description === "string")
    return errorObj.description;
  if (errorObj?.detail && typeof errorObj.detail === "string")
    return errorObj.detail;
  if (errorObj?.response && typeof errorObj.response === "object") {
    const response = errorObj.response as Record<string, unknown>;
    if (response.data && typeof response.data === "object") {
      const data = response.data as Record<string, unknown>;
      if (data.message && typeof data.message === "string") return data.message;
      if (data.error && typeof data.error === "string") return data.error;
    }
  }

  // Map common HTTP status codes to more specific descriptions
  const errorCode = getErrorCode(error);
  switch (errorCode) {
    case 400:
    case "400":
      return t("errors.badRequest.description");
    case 401:
    case "401":
      return t("errors.unauthorized.description");
    case 403:
    case "403":
      return t("errors.forbidden.description");
    case 404:
    case "404":
      return t("errors.notFound.description");
    case 408:
    case "408":
      return t("errors.timeout.description");
    case 409:
    case "409":
      return t("errors.conflict.description");
    case 422:
    case "422":
      return t("errors.validation.description");
    case 429:
    case "429":
      return t("errors.rateLimit.description");
    case 500:
    case "500":
      return t("errors.internal.description");
    case 502:
    case "502":
      return t("errors.badGateway.description");
    case 503:
    case "503":
      return t("errors.serviceUnavailable.description");
    case 504:
    case "504":
      return t("errors.gatewayTimeout.description");
    default:
      return t("errors.generic.description");
  }
}
