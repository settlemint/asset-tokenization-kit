import { GraphQLError } from "graphql";
import { ClientError } from "graphql-request";
import { describe, expect, it } from "vitest";
import { PortalError, handlePortalError } from "./portal-error-handling";

describe("PortalError", () => {
  it("should set message and statusCode", () => {
    const err = new PortalError("fail", 401);
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("fail");
    expect(err.statusCode).toBe(401);
  });
});

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
      handlePortalError(clientError);
    } catch (error) {
      expect(error).toBeInstanceOf(PortalError);
      if (error instanceof PortalError) {
        expect(error.message).toBe("AccessControlUnauthorizedAccount");
        expect(error.statusCode).toBe(400);
      }
    }
  });

  it("throws default error if not a ClientError", () => {
    const error = new Error("test");
    try {
      handlePortalError(error);
    } catch (error) {
      expect(error).toBeInstanceOf(PortalError);
      if (error instanceof PortalError) {
        expect(error.message).toBe("test");
        expect(error.statusCode).toBe(500);
      }
    }
  });
});
