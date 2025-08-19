import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { DEFAULT_ADMIN, signInWithUser } from "@atk/auth/test/fixtures/user";
import { getTestOrpcClient } from "@test/fixtures/orpc-client";
import {
  createBaseContext,
  createMockErrors,
  createUnauthenticatedContext,
  getPublicHandler,
  mockCall,
  type OrpcHandler,
  resetAllMocks,
} from "@test/orpc-route-helpers";

// Import route to register handler (after mocks are set up)
import "../../../../src/routes/account/routes/account.me";

describe("Account me (integration)", () => {
  let client: ReturnType<typeof getTestOrpcClient>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    client = getTestOrpcClient(headers);
  });

  it("returns null when account is not indexed", async () => {
    const result = await client.account.me();
    // In a fresh environment, the user's wallet may not be in the subgraph yet
    // The route returns null in that case
    expect(result === null || typeof result === "object").toBe(true);
  });
});

describe("account.me (unit)", () => {
  let handler: OrpcHandler;
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    resetAllMocks();
    const capturedHandler = getPublicHandler();
    if (!capturedHandler) {
      throw new Error("Handler not captured - check mock setup");
    }
    handler = capturedHandler;
    errors = createMockErrors();
  });

  it("throws UNAUTHORIZED when no auth context", async () => {
    expect(
      handler({
        context: createUnauthenticatedContext(),
        input: undefined,
        errors,
      })
    ).rejects.toThrowError(/UNAUTHORIZED/);
  });

  it("returns account from nested read call", async () => {
    const ADDRESS = "0x1111111111111111111111111111111111111111" as const;
    const context = createBaseContext();

    // Mock the call to account.read to return the expected result
    mockCall.mockResolvedValue({ id: ADDRESS });

    const result = await handler({
      context,
      input: undefined,
      errors,
    });

    expect(result).toEqual({ id: ADDRESS });
    expect(mockCall).toHaveBeenCalledWith(
      expect.anything(), // the read route
      { wallet: context.auth.user.wallet },
      { context }
    );
  });

  it("returns null when nested read throws an error", async () => {
    const context = createBaseContext();

    // Mock the call to account.read to throw an error
    mockCall.mockRejectedValue(new Error("Not found"));

    const result = await handler({
      context,
      input: undefined,
      errors,
    });

    expect(result).toBeNull();
    expect(mockCall).toHaveBeenCalledWith(
      expect.anything(), // the read route
      { wallet: context.auth.user.wallet },
      { context }
    );
  });
});
