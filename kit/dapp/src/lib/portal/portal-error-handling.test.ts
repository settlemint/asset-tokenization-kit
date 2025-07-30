import { CUSTOM_ERRORS } from "@/orpc/procedures/base.contract";
import { createORPCErrorConstructorMap, ORPCError } from "@orpc/server";
import { GraphQLError } from "graphql";
import { ClientError } from "graphql-request";
import { describe, expect, it } from "vitest";
import { handlePortalError } from "./portal-error-handling";

const orpcErrors = createORPCErrorConstructorMap(CUSTOM_ERRORS);

describe("handlePortalError", () => {
  it("should throw PortalError with correct message and statusCode from ClientError with extensions", () => {
    const clientError = new ClientError(
      {
        errors: [
          new GraphQLError(
            'The contract function "registerSystemAddon" reverted with the following reason: AccessControlUnauthorizedAccount',
            {
              extensions: { statusCode: 400 },
            }
          ),
        ],
        data: undefined,
        status: 200,
        headers: {},
      },
      { query: "", variables: {} }
    );
    try {
      handlePortalError(clientError, orpcErrors);
    } catch (error) {
      expect(error).toBeInstanceOf(ORPCError);
      if (error instanceof ORPCError) {
        expect(error.message).toBe("AccessControlUnauthorizedAccount");
        expect(error.status).toBe(403);
        expect(error.code).toBe("FORBIDDEN");
      }
    }
  });

  it("throws default error if not a ClientError", () => {
    const error = new Error("test");
    try {
      handlePortalError(error, orpcErrors);
    } catch (error) {
      expect(error).toBeInstanceOf(ORPCError);
      if (error instanceof ORPCError) {
        expect(error.message).toBe("test");
        expect(error.status).toBe(500);
        expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      }
    }
  });
});
