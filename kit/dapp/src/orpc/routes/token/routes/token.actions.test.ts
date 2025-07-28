/**
 * Token Actions Route Tests
 *
 * Minimal tests to verify schema extension works correctly.
 * @module TokenActionsTests
 */
import { safeParse } from "@/lib/zod";
import { describe, expect, it } from "vitest";
import { ActionsListSchema } from "@/orpc/routes/actions/routes/actions.list.schema";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod";

// Logger is mocked via vitest.config.ts alias

// Define the TokenActionsInputSchema for testing (matches the contract implementation)
const TokenActionsInputSchema = z
  .object({
    tokenAddress: ethereumAddress.describe(
      "The token contract address to filter actions by"
    ),
  })
  .extend(ActionsListSchema.shape);

describe("Token Actions Schema Extension", () => {
  it("should require tokenAddress and allow ActionsListSchema filters", () => {
    const validInput = {
      tokenAddress: "0x1234567890123456789012345678901234567890",
      status: "PENDING" as const,
      name: "settlement",
    };
    const result = safeParse(TokenActionsInputSchema, validInput);
    expect(result.tokenAddress).toBe(
      "0x1234567890123456789012345678901234567890"
    );
    expect(result.status).toBe("PENDING");
    expect(result.name).toBe("settlement");
  });

  it("should work with only required tokenAddress", () => {
    const minimalInput = {
      tokenAddress: "0x1234567890123456789012345678901234567890",
    };
    const result = safeParse(TokenActionsInputSchema, minimalInput);
    expect(result.tokenAddress).toBe(
      "0x1234567890123456789012345678901234567890"
    );
    expect(result.status).toBeUndefined();
    expect(result.name).toBeUndefined();
  });

  it("should require tokenAddress field", () => {
    const missingTokenAddress = {
      status: "ACTIVE" as const,
    };
    expect(() =>
      safeParse(TokenActionsInputSchema, missingTokenAddress)
    ).toThrow();
  });

  it("should validate tokenAddress as ethereum address", () => {
    const invalidAddress = {
      tokenAddress: "invalid-address",
    };
    expect(() => safeParse(TokenActionsInputSchema, invalidAddress)).toThrow();
  });
});
