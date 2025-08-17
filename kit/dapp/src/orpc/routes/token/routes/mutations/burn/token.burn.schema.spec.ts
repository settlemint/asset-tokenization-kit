import { describe, it, expect } from "vitest";
import { TokenBurnInputSchema } from "./token.burn.schema";

describe("TokenBurnInputSchema", () => {
  it("accepts single address and amount and transforms to arrays", () => {
    const parsed = TokenBurnInputSchema.parse({
      contract: "0x1111111111111111111111111111111111111111",
      addresses: "0x2222222222222222222222222222222222222222",
      amounts: "10",
      walletVerification: { secretVerificationCode: "123456" },
    });
    expect(parsed.addresses).toEqual([
      "0x2222222222222222222222222222222222222222",
    ]);
    expect(parsed.amounts).toEqual([10n]);
  });

  it("fails when addresses and amounts length mismatch", () => {
    expect(() =>
      TokenBurnInputSchema.parse({
        contract: "0x1111111111111111111111111111111111111111",
        addresses: [
          "0x2222222222222222222222222222222222222222",
          "0x3333333333333333333333333333333333333333",
        ],
        amounts: ["10"],
        walletVerification: { secretVerificationCode: "123456" },
      })
    ).toThrow();
  });
});
