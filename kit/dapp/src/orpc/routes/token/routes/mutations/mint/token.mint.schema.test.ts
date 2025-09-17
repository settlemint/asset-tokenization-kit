import { describe, it, expect } from "vitest";
import { TokenMintInputSchema } from "./token.mint.schema";

describe("TokenMintInputSchema", () => {
  it("accepts single recipient and amount and transforms to arrays", () => {
    const parsed = TokenMintInputSchema.parse({
      contract: "0x1111111111111111111111111111111111111111",
      recipients: "0x2222222222222222222222222222222222222222",
      amounts: "10",
      walletVerification: { secretVerificationCode: "123456" },
    });
    expect(parsed.recipients).toEqual([
      "0x2222222222222222222222222222222222222222",
    ]);
    expect(parsed.amounts).toEqual([10n]);
  });

  it("fails when recipients and amounts length mismatch", () => {
    expect(() =>
      TokenMintInputSchema.parse({
        contract: "0x1111111111111111111111111111111111111111",
        recipients: [
          "0x2222222222222222222222222222222222222222",
          "0x3333333333333333333333333333333333333333",
        ],
        amounts: ["10"],
        walletVerification: { secretVerificationCode: "123456" },
      })
    ).toThrow();
  });
});
