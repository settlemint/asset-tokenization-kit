import { t } from "elysia";

export const defaultErrorSchema = {
  400: t.Object(
    {
      error: t.String({
        description: "Bad Request - Invalid parameters or request format",
      }),
      details: t.Optional(t.Array(t.String())),
    },
    {
      description: "Bad Request - Invalid parameters or request format",
    }
  ),
  401: t.Object(
    {
      error: t.String({
        description: "Unauthorized - Authentication is required",
      }),
    },
    {
      description: "Unauthorized - Authentication is required",
    }
  ),
  403: t.Object(
    {
      error: t.String({
        description:
          "Forbidden - Insufficient permissions to access the resource",
      }),
    },
    {
      description:
        "Forbidden - Insufficient permissions to access the resource",
    }
  ),
  404: t.Object(
    {
      error: t.String({
        description: "Not Found - The requested resource does not exist",
      }),
    },
    {
      description: "Not Found - The requested resource does not exist",
    }
  ),
  429: t.Object(
    {
      error: t.String({
        description: "Too Many Requests - Rate limit exceeded",
      }),
    },
    {
      description: "Too Many Requests - Rate limit exceeded",
    }
  ),
  500: t.Object(
    {
      error: t.String({
        description:
          "Internal Server Error - Something went wrong on the server",
      }),
      requestId: t.Optional(t.String()),
    },
    {
      description: "Internal Server Error - Something went wrong on the server",
    }
  ),
};
