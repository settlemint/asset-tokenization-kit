# Zod Validators - AI Assistant Instructions

## Overview

This document provides specific instructions for AI assistants working with the
Zod validators library. These validators are critical for data integrity
throughout the Asset Tokenization Kit.

**README Reference**: See [README.md](./README.md) for comprehensive
documentation about the validators library.

## Critical Context for AI Assistants

### 1. **Validator Usage Patterns**

When working with validators:

- Always use the factory function pattern (e.g., `amount()`, not just
  `z.number()`)
- Import validators from their specific files, not from an index
- Use helper functions (`isType`, `getType`) for runtime validation
- Prefer validator composition over creating new complex validators

### 2. **Type Safety Requirements**

```typescript
// CORRECT: Use full types from validators
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
const address: EthereumAddress = getEthereumAddress(input);

// INCORRECT: Don't use partial types
const address: { address?: string } = { address: input }; // ❌ Never do this
```

### 3. **Common Pitfalls to Avoid**

1. **Don't create duplicate validators** - Check existing validators first
2. **Don't use `z.any()` or `as any`** - Always use proper typed validators
3. **Don't skip transformations** - Many validators normalize data (e.g.,
   checksummed addresses)
4. **Don't ignore error messages** - Validators have specific, helpful error
   messages

### 4. **Integration with Forms**

When using validators with TanStack Form:

```typescript
// Use validators directly in form schemas
const form = useForm({
  validatorAdapter: zodValidator,
  validators: {
    onChange: z.object({
      address: ethereumAddress, // Direct validator usage
      amount: amount({ min: 0.01 }),
    }),
  },
});
```

### 5. **ORPC Integration**

For ORPC endpoints, always validate inputs:

```typescript
export const transferTokens = orpc
  .input(
    z.object({
      from: ethereumAddress,
      to: ethereumAddress,
      amount: apiBigInt, // Use apiBigInt for large numbers
      assetType: assetType(),
    })
  )
  .mutation(async ({ input }) => {
    // Input is fully validated and typed
  });
```

### 6. **Database Integration**

When defining database schemas:

```typescript
// Use validator types for database columns
export const tokensTable = sqliteTable("tokens", {
  address: text("address").$type<EthereumAddress>().notNull(),
  symbol: text("symbol").$type<AssetSymbol>().notNull(),
  decimals: integer("decimals").$type<Decimals>().notNull(),
  totalSupply: text("total_supply").$type<string>().notNull(), // Store BigInt as string
});
```

## Validator-Specific Guidelines

### Financial Validators

- **amount**: Always specify `decimals` or `min` for financial amounts
- **price**: Limited to 4 decimal places - suitable for most financial markets
- **basis-points**: Use for percentages (100 basis points = 1%)

### Blockchain Validators

- **ethereum-address**: Always returns checksummed addresses
- **bigint**: Handles scientific notation and decimal truncation
- **ethereum-hash**: Validates both with and without '0x' prefix

### Compliance Validators

- **compliance**: Uses discriminated unions - match on `typeId`
- **iso-country-code**: Only accepts uppercase ISO codes
- **isin**: Includes Luhn checksum validation

### Time Validators

- **timestamp**: Accepts multiple formats, always returns Date object
- **duration**: Validates time periods with unit conversion

## Code Generation Patterns

When generating code that uses validators:

### 1. **Import Pattern**

```typescript
// Always use specific imports
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { amount } from "@/lib/zod/validators/amount";
import { assetType } from "@/lib/zod/validators/asset-types";
```

### 2. **Schema Composition**

```typescript
// Compose validators for complex schemas
const tokenSchema = z.object({
  address: ethereumAddress,
  name: z.string().min(1).max(100),
  symbol: assetSymbol(),
  decimals: decimals(),
  totalSupply: apiBigInt,
  type: assetType(),
  compliance: complianceModulePairArray(),
});
```

### 3. **Error Handling**

```typescript
// Always handle validation errors properly
const result = schema.safeParse(input);
if (!result.success) {
  // Use formatValidationError from the codebase
  toast.error(formatValidationError(result.error));
  return;
}
```

### 4. **Type Inference**

```typescript
// Let TypeScript infer types from schemas
type TokenData = z.infer<typeof tokenSchema>;

// Or use exported types directly
import type { AssetType } from "@/lib/zod/validators/asset-types";
```

## Testing Requirements

When modifying or creating validators:

1. **Always create corresponding test files**
2. **Test edge cases and transformations**
3. **Verify error messages are helpful**
4. **Check type inference works correctly**

## Performance Considerations

1. **Reuse validator instances** - They're stateless
2. **Avoid complex regex in hot paths**
3. **Use `.passthrough()` sparingly** - Prefer strict schemas
4. **Cache parsed results when appropriate**

## Common Use Cases

### 1. **Token Creation**

```typescript
const createTokenSchema = z.object({
  name: z.string().min(1).max(100),
  symbol: assetSymbol(),
  decimals: decimals(),
  initialSupply: amount({ min: 0 }),
  assetType: assetType(),
  compliance: complianceModulePairArray(),
});
```

### 2. **Transaction Validation**

```typescript
const transactionSchema = z.object({
  from: ethereumAddress,
  to: ethereumAddress,
  value: apiBigInt,
  data: ethereumHash.optional(),
  timestamp: timestamp(),
});
```

### 3. **User Input Validation**

```typescript
const userProfileSchema = z.object({
  address: ethereumAddress,
  country: isoCountryCode(),
  role: userRole(),
  verificationCode: verificationCode().optional(),
});
```

## MCP Tool Usage

When using MCP tools to work with validators:

### 1. **Finding Examples**

```javascript
// Use Grep to find validator usage patterns
mcp__grep__searchGitHub({
  query: "ethereumAddress.parse",
  language: ["TypeScript"],
  repo: "settlemint/",
});
```

### 2. **Understanding Patterns**

```javascript
// Use Gemini to analyze validator patterns
mcp__gemini -
  cli__ask -
  gemini({
    prompt:
      "@validators/*.ts analyze the validation patterns and suggest improvements",
    changeMode: true,
  });
```

### 3. **Documentation Updates**

```javascript
// Check Context7 for Zod best practices
mcp__context7__get -
  library -
  docs({
    context7CompatibleLibraryID: "/colinhacks/zod",
    topic: "schema composition refinements",
  });
```

## Migration Guidelines

When updating validators:

1. **Check all usages** with grep before modifying
2. **Maintain backward compatibility** when possible
3. **Update tests** before changing implementation
4. **Document breaking changes** clearly

## Security Considerations

1. **Never trust unvalidated input** - Always parse through validators
2. **Use strict schemas** - Avoid `.passthrough()` for user input
3. **Validate at boundaries** - API endpoints, form submissions, contract calls
4. **Sanitize error messages** - Don't expose sensitive validation details

## Remember

- Validators are the first line of defense against bad data
- Type safety starts with proper validation
- Clear error messages improve developer experience
- Consistency across validators reduces cognitive load
- Performance matters for high-frequency validations
