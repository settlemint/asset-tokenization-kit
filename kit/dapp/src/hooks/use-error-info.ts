import type { baseContract } from "@/orpc/procedures/base.contract";
import type { ORPCError } from "@orpc/server";
import { useTranslation } from "react-i18next";

type ErrorKeys = keyof (typeof baseContract)["~orpc"]["errorMap"];

/**
 * Check if error is an ORPC error
 * @param error
 */
export function isORPCError(
  error: unknown
): error is ORPCError<ErrorKeys, unknown> {
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
    return error.status || "500";
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
  const { t } = useTranslation("errors");

  // For ORPC errors, try to get title from translations based on code
  if (isORPCError(error)) {
    // Try to get translation for specific error code
    // For now, we'll use the switch statement below for translations

    // Map ORPC error codes to friendly titles
    switch (error.code) {
      case "UNAUTHORIZED":
        return t("unauthorized.title");
      case "FORBIDDEN":
        return t("forbidden.title");
      case "NOT_FOUND":
        return t("notFound.title");
      case "INPUT_VALIDATION_FAILED":
      case "OUTPUT_VALIDATION_FAILED":
        return t("validation.title");
      case "RATE_LIMIT_EXCEEDED":
        return t("rateLimit.title");
      case "TIMEOUT":
        return t("timeout.title");
      case "PORTAL_ERROR":
        return t("portal.title");
      case "INTERNAL_SERVER_ERROR":
        return t("internal.title");
      case "NOT_ONBOARDED":
        return t("notOnboarded.title");
      case "SYSTEM_NOT_CREATED":
        return t("systemNotCreated.title");
      case "RESOURCE_ALREADY_EXISTS":
        return t("resourceAlreadyExists.title");
      case "TOKEN_INTERFACE_NOT_SUPPORTED":
        return t("tokenInterfaceNotSupported.title");
      case "USER_NOT_ALLOWED":
        return t("userNotAllowed.title");
      case "USER_NOT_AUTHORIZED":
        return t("userNotAuthorized.title");
      default:
        return t("generic.title");
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
      return t("badRequest.title");
    case 401:
    case "401":
      return t("unauthorized.title");
    case 403:
    case "403":
      return t("forbidden.title");
    case 404:
    case "404":
      return t("notFound.title");
    case 408:
    case "408":
      return t("timeout.title");
    case 409:
    case "409":
      return t("conflict.title");
    case 422:
    case "422":
      return t("validation.title");
    case 429:
    case "429":
      return t("rateLimit.title");
    case 500:
    case "500":
      return t("internal.title");
    case 502:
    case "502":
      return t("badGateway.title");
    case 503:
    case "503":
      return t("serviceUnavailable.title");
    case 504:
    case "504":
      return t("gatewayTimeout.title");
    default:
      return t("generic.title");
  }
}

/**
 * Hook to get error description from error object
 * @param error
 */
export function useErrorDescription(error: unknown): string {
  const { t } = useTranslation("errors");

  // For ORPC errors, use the message or try translations
  if (isORPCError(error)) {
    if (error.message) return error.message;

    // Map ORPC error codes to friendly descriptions
    switch (error.code) {
      case "UNAUTHORIZED":
        return t("unauthorized.description");
      case "FORBIDDEN":
        return t("forbidden.description");
      case "NOT_FOUND":
        return t("notFound.description");
      case "INPUT_VALIDATION_FAILED":
      case "OUTPUT_VALIDATION_FAILED":
        return t("validation.description");
      case "RATE_LIMIT_EXCEEDED":
        return t("rateLimit.description");
      case "TIMEOUT":
        return t("timeout.description");
      case "PORTAL_ERROR":
        return t("portal.description");
      case "INTERNAL_SERVER_ERROR":
        return t("internal.description");
      case "NOT_ONBOARDED":
        return t("notOnboarded.description");
      case "SYSTEM_NOT_CREATED":
        return t("systemNotCreated.description");
      case "RESOURCE_ALREADY_EXISTS":
        return t("resourceAlreadyExists.description");
      case "TOKEN_INTERFACE_NOT_SUPPORTED":
        return t("tokenInterfaceNotSupported.description", {
          requiredInterfaces: (error.data as { requiredInterfaces: string[] })
            .requiredInterfaces,
        });

      case "USER_NOT_ALLOWED":
        return t("userNotAllowed.description", {
          reason: (error.data as { reason: string }).reason,
        });
      case "USER_NOT_AUTHORIZED":
        return t("userNotAuthorized.description", {
          requiredRoles: (error.data as { requiredRoles: string[] })
            .requiredRoles,
        });
      default:
        return t("generic.description");
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
      return t("badRequest.description");
    case 401:
    case "401":
      return t("unauthorized.description");
    case 403:
    case "403":
      return t("forbidden.description");
    case 404:
    case "404":
      return t("notFound.description");
    case 408:
    case "408":
      return t("timeout.description");
    case 409:
    case "409":
      return t("conflict.description");
    case 422:
    case "422":
      return t("validation.description");
    case 429:
    case "429":
      return t("rateLimit.description");
    case 500:
    case "500":
      return t("internal.description");
    case 502:
    case "502":
      return t("badGateway.description");
    case 503:
    case "503":
      return t("serviceUnavailable.description");
    case 504:
    case "504":
      return t("gatewayTimeout.description");
    default:
      return t("generic.description");
  }
}
