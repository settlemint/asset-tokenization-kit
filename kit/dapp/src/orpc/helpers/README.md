# ORPC Helper Functions

This folder contains utility functions that provide common functionality across
ORPC procedures. These helpers ensure consistency in validation, formatting, and
business logic throughout the API.

## Available Helpers

### Array Validation (`array-validation.ts`)

Utilities for validating array inputs in batch operations:

```typescript
// Validate that all arrays have the same length
validateArrayLengths(
  {
    recipients: ["0x123", "0x456"],
    amounts: [100, 200],
  },
  "batch transfer"
);

// Validate arrays are not empty
validateNonEmptyArrays(
  {
    recipients: addresses,
  },
  "airdrop"
);

// Complete batch validation (non-empty, same length, max size)
validateBatchArrays(
  {
    recipients: ["0x123", "0x456"],
    amounts: [100, 200],
    reasons: ["Payment", "Refund"],
  },
  "batch operation",
  50
); // max 50 items
```

### Blockchain Transaction Messages (`blockchain-transaction-messages.ts`)

Standardizes user-facing messages for blockchain operations:

```typescript
// Get a user-friendly message for a blockchain operation
const message = getBlockchainTransactionMessage({
  operation: "mint",
  assetType: "token",
  assetName: "MyToken",
  amount: "1000",
  recipient: "0x123...",
});
// Returns: "Minting 1000 MyToken to 0x123..."

// Supported operations:
// - create, mint, burn, transfer, approve
// - pause, unpause, freeze, unfreeze
// - addCompliance, removeCompliance
// - setCap, setYieldSchedule, redeem
```

### Challenge Response (`challenge-response.ts`)

Handles wallet signature challenges for authentication:

```typescript
// Generate a challenge for wallet signing
const challenge = generateChallenge(walletAddress);
// Returns: "Sign this message to authenticate..."

// Verify a signed challenge
const isValid = await verifyChallenge(
  walletAddress,
  signature,
  expectedChallenge
);
```

### Mutation Messages (`mutation-messages.ts`)

Formats mutation responses with transaction details:

```typescript
// Format a successful mutation response
const response = formatMutationResponse({
  transactionHash: "0xabc...",
  operation: "Token creation",
  details: {
    name: "MyToken",
    symbol: "MTK",
  },
});
// Returns: {
//   transactionHash: "0xabc...",
//   message: "Token creation initiated",
//   details: { name: "MyToken", symbol: "MTK" }
// }
```

### Role Validation (`role-validation.ts`)

Validates user roles and permissions:

```typescript
// Check if user has required role
const hasRole = validateUserRole(user, "TOKEN_ISSUER");

// Check multiple roles (OR condition)
const canManage = validateUserRoles(user, ["ADMIN", "TOKEN_MANAGER"]);

// Throw error if missing role
requireRole(user, "SYSTEM_ADMIN"); // Throws FORBIDDEN error
```

### Transaction Receipt (`transaction-receipt.ts`)

Handles transaction receipt processing:

```typescript
// Wait for transaction confirmation
const receipt = await waitForReceipt(transactionHash, provider, {
  confirmations: 2,
  timeout: 60000, // 1 minute
});

// Extract events from receipt
const events = parseReceiptEvents(receipt, ["TokenCreated", "Transfer"]);

// Check transaction status
const success = isTransactionSuccessful(receipt);
```

## Usage Examples

### In Route Handlers

```typescript
import { validateBatchArrays } from "@/orpc/helpers/array-validation";
import { getBlockchainTransactionMessage } from "@/orpc/helpers/blockchain-transaction-messages";

export const batchMint = authRouter.token.batchMint.handler(
  async ({ input, context }) => {
    // Validate batch inputs
    validateBatchArrays(
      {
        recipients: input.recipients,
        amounts: input.amounts,
      },
      "batch mint"
    );

    // Execute transaction
    const { transactionHash } = await executeBatchMint(input);

    // Return formatted message
    return {
      transactionHash,
      message: getBlockchainTransactionMessage({
        operation: "mint",
        assetType: "tokens",
        count: input.recipients.length,
      }),
    };
  }
);
```

### In Middleware

```typescript
import { validateUserRole } from "@/orpc/helpers/role-validation";

export const adminMiddleware = baseRouter.middleware(
  async ({ context, next, errors }) => {
    if (!validateUserRole(context.auth?.user, "ADMIN")) {
      throw errors.FORBIDDEN("Admin access required");
    }

    return next({ context });
  }
);
```

### In Tests

```typescript
import { validateArrayLengths } from "@/orpc/helpers/array-validation";

describe("batch operations", () => {
  it("validates array lengths", () => {
    expect(() => {
      validateArrayLengths(
        {
          recipients: ["0x1", "0x2"],
          amounts: [100], // Mismatched length
        },
        "test"
      );
    }).toThrow("Array length mismatch");
  });
});
```

## Creating New Helpers

When adding new helper functions:

1. **Single Purpose**: Each helper should do one thing well
2. **Pure Functions**: Avoid side effects when possible
3. **Error Handling**: Use consistent error types (ORPCError)
4. **Type Safety**: Provide full TypeScript types
5. **Testing**: Include comprehensive unit tests
6. **Documentation**: Add JSDoc comments

Example template:

```typescript
/**
 * Validates something specific
 * @param input - The input to validate
 * @param options - Optional configuration
 * @returns Validated result
 * @throws ORPCError if validation fails
 */
export function validateSomething<T>(
  input: T,
  options?: ValidationOptions
): ValidatedResult<T> {
  // Implementation
}
```

## Best Practices

1. **Reusability**: Design helpers to be used across multiple routes
2. **Consistency**: Use similar patterns for similar operations
3. **Performance**: Keep helpers lightweight and efficient
4. **Error Messages**: Provide clear, actionable error messages
5. **Defaults**: Provide sensible defaults for optional parameters
6. **Composability**: Design helpers to work well together

## Testing Helpers

All helpers should have corresponding test files:

```typescript
// array-validation.test.ts
import { describe, it, expect } from "vitest";
import { validateBatchArrays } from "./array-validation";

describe("validateBatchArrays", () => {
  it("accepts valid batch arrays", () => {
    expect(() => {
      validateBatchArrays(
        {
          a: [1, 2, 3],
          b: ["x", "y", "z"],
        },
        "test"
      );
    }).not.toThrow();
  });

  it("rejects empty arrays", () => {
    expect(() => {
      validateBatchArrays(
        {
          a: [],
        },
        "test"
      );
    }).toThrow("Empty array");
  });

  it("enforces maximum length", () => {
    expect(() => {
      validateBatchArrays(
        {
          a: new Array(101).fill(0),
        },
        "test",
        100
      );
    }).toThrow("Too many elements");
  });
});
```
