import { ClientError } from "graphql-request";

export class PortalError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.statusCode = statusCode;
  }

  public translate(t: (key: string) => string) {
    return (
      t(`errors.portal.error-codes.${this.message}`) ??
      t("errors.portal.error-codes.default")
    );
  }
}

export function isPortalError(error: unknown): error is PortalError {
  return error instanceof PortalError;
}

export function handlePortalError(error: unknown): never {
  if (error instanceof ClientError) {
    const errors = error.response?.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const firstError = errors[0];
      const statusCode =
        typeof firstError?.extensions?.statusCode === "number"
          ? firstError.extensions.statusCode
          : 500;
      const reason = extractRevertReason(
        firstError?.message ?? "Unknown error"
      );
      throw new PortalError(reason, statusCode);
    }
  }
  if (error instanceof Error) {
    throw new PortalError(error.message, 500);
  }
  throw new PortalError(String(error), 500);
}

function extractRevertReason(message: string) {
  const match = message.match(/reverted with the following reason: (.*)/i);
  return match && match[1] ? match[1] : message;
}
