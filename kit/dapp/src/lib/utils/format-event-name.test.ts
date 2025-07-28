import { describe, expect, test } from "vitest";
import { formatEventName } from "./format-event-name";

describe("formatEventName", () => {
  test("removes leading underscores", () => {
    expect(formatEventName("_Transfer")).toBe("Transfer");
    expect(formatEventName("__DoubleUnderscore")).toBe("Double Underscore");
    expect(formatEventName("___TripleUnderscore")).toBe("Triple Underscore");
  });

  test("removes trailing underscores", () => {
    expect(formatEventName("TokenMinted_")).toBe("Token Minted");
    expect(formatEventName("EventEmitted__")).toBe("Event Emitted");
    expect(formatEventName("UserCreated___")).toBe("User Created");
  });

  test("removes both leading and trailing underscores", () => {
    expect(formatEventName("_BothSides_")).toBe("Both Sides");
    expect(formatEventName("__MultipleUnderscores__")).toBe(
      "Multiple Underscores"
    );
    expect(formatEventName("___ManyUnderscores___")).toBe("Many Underscores");
  });

  test("converts camelCase to capital case", () => {
    expect(formatEventName("userAccountCreated")).toBe("User Account Created");
    expect(formatEventName("tokenTransferRequested")).toBe(
      "Token Transfer Requested"
    );
    expect(formatEventName("balanceUpdated")).toBe("Balance Updated");
  });

  test("converts PascalCase to capital case", () => {
    expect(formatEventName("OwnershipTransferred")).toBe(
      "Ownership Transferred"
    );
    expect(formatEventName("TokenMinted")).toBe("Token Minted");
    expect(formatEventName("AccountFrozen")).toBe("Account Frozen");
  });

  test("handles snake_case", () => {
    expect(formatEventName("user_account_created")).toBe(
      "User Account Created"
    );
    expect(formatEventName("token_transfer_completed")).toBe(
      "Token Transfer Completed"
    );
  });

  test("handles mixed cases with underscores", () => {
    expect(formatEventName("_userAccount_Created_")).toBe(
      "User Account Created"
    );
    expect(formatEventName("__Token_Minted__")).toBe("Token Minted");
  });

  test("handles single word events", () => {
    expect(formatEventName("Transfer")).toBe("Transfer");
    expect(formatEventName("Mint")).toBe("Mint");
    expect(formatEventName("Burn")).toBe("Burn");
  });

  test("handles empty string", () => {
    expect(formatEventName("")).toBe("");
  });

  test("handles strings with only underscores", () => {
    expect(formatEventName("_")).toBe("");
    expect(formatEventName("___")).toBe("");
  });

  test("preserves internal underscores when appropriate", () => {
    expect(formatEventName("user_account_created")).toBe(
      "User Account Created"
    );
    // capitalCase converts all caps to Title Case
    expect(formatEventName("TOKEN_TRANSFER_EVENT")).toBe(
      "Token Transfer Event"
    );
  });

  test("handles complex event names from examples", () => {
    expect(formatEventName("__userAccountCreated__")).toBe(
      "User Account Created"
    );
    expect(formatEventName("_Transfer")).toBe("Transfer");
    expect(formatEventName("TokenMinted_")).toBe("Token Minted");
    expect(formatEventName("OwnershipTransferred")).toBe(
      "Ownership Transferred"
    );
  });
});
