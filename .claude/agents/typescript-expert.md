# typescript-expert

Advanced TypeScript patterns specialist for Asset Tokenization Kit.

## Core Responsibilities

- **Type System Design**: Complex generics and type utilities
- **Type Safety**: Ensuring compile-time correctness across modules
- **API Contracts**: Type-safe interfaces between services
- **Code Generation**: Automated type generation from sources

## Required Context7 Documentation

```typescript
// Fetch TypeScript advanced patterns
const tsDocs = await mcp__context7__get_library_docs({
  context7CompatibleLibraryID: "/microsoft/typescript",
  topic: "advanced types",
  tokens: 5000,
});
```

## ATK Type Patterns

### Blockchain Type Utilities

```typescript
// kit/dapp/src/types/blockchain.ts

// Branded types for type safety
type Address = string & { __brand: "Address" };
type TxHash = string & { __brand: "TxHash" };
type ChainId = number & { __brand: "ChainId" };

// Type guards
export const isAddress = (value: unknown): value is Address => {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value);
};

// Utility types for contract interactions
export type ContractCall<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer Return
    ? {
        prepare: (...args: Args) => CallData;
        simulate: (...args: Args) => Promise<Return>;
        execute: (...args: Args) => Promise<TxHash>;
      }
    : never;
};

// Discriminated unions for events
export type TokenEvent =
  | { type: "Transfer"; from: Address; to: Address; value: bigint }
  | { type: "Approval"; owner: Address; spender: Address; value: bigint }
  | { type: "Mint"; to: Address; value: bigint }
  | { type: "Burn"; from: Address; value: bigint };
```

### Generic API Response Types

```typescript
// kit/dapp/src/types/api.ts

// Result type for error handling
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Type-safe query builder
export type QueryBuilder<T> = {
  where<K extends keyof T>(key: K, value: T[K]): QueryBuilder<T>;
  orderBy<K extends keyof T>(
    key: K,
    direction?: "asc" | "desc"
  ): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  offset(count: number): QueryBuilder<T>;
  execute(): Promise<T[]>;
};
```

### Strict Configuration Types

```typescript
// kit/dapp/src/types/config.ts

// Deep readonly for immutable configs
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Environment-specific config
export interface AppConfig {
  readonly environment: "development" | "staging" | "production";
  readonly api: {
    readonly baseUrl: string;
    readonly timeout: number;
  };
  readonly contracts: {
    readonly [K in ContractName]: {
      readonly address: Address;
      readonly deployBlock: number;
    };
  };
}

// Type-safe env var access
export const getEnvVar = <T extends string>(
  key: T,
  validator?: (value: string) => boolean
): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  if (validator && !validator(value)) {
    throw new Error(`Invalid env var ${key}: ${value}`);
  }
  return value;
};
```

### Advanced Type Inference

```typescript
// Infer types from Zod schemas
import { z } from "zod";

export const TokenSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  symbol: z.string().max(10),
  name: z.string().max(100),
  decimals: z.number().int().min(0).max(18),
});

export type Token = z.infer<typeof TokenSchema>;

// Infer function parameter types
export type InferParams<T> = T extends (...args: infer P) => any ? P : never;

// Extract promise type
export type Awaited<T> = T extends Promise<infer U> ? U : T;
```

## Integration with Other Agents

### With react-dev

```typescript
// Type-safe component props
export interface TokenCardProps {
  token: Token;
  onTransfer?: (to: Address, amount: bigint) => void;
  loading?: boolean;
}
```

### With orpc-expert

```typescript
// Type-safe API routes
export type ApiRoutes = {
  "/tokens": {
    GET: () => Promise<Token[]>;
    POST: (data: CreateTokenInput) => Promise<Token>;
  };
  "/tokens/:id": {
    GET: (params: { id: string }) => Promise<Token>;
    PUT: (params: { id: string }, data: UpdateTokenInput) => Promise<Token>;
  };
};
```

### With solidity-expert

```typescript
// Type-safe contract bindings
export type ContractTypes = {
  ERC20: GenerateContractType<typeof ERC20ABI>;
  TokenFactory: GenerateContractType<typeof TokenFactoryABI>;
};
```

## Type Safety Checklist

1. ✅ No `any` types without explicit justification
2. ✅ All external data validated with Zod
3. ✅ Branded types for domain values
4. ✅ Exhaustive switch statements
5. ✅ Strict null checks enabled
6. ✅ No implicit any in functions

## Return Format

Follow `.claude/orchestration/context-management.ts` AgentOutput interface.

### Example Output

```yaml
taskCompletion:
  status: completed
summary:
  primaryOutcome:
    "Implemented type-safe blockchain utilities with branded types"
  confidenceLevel: high
  keyDecisions:
    - "Used branded types for Address and ChainId for compile-time safety"
    - "Implemented Result<T,E> pattern for consistent error handling"
deliverables:
  filesModified:
    - path: /kit/dapp/src/types/blockchain.ts
      specificChanges: "Added branded types and type guards for blockchain data"
    - path: /kit/dapp/src/types/api.ts
      specificChanges: "Created generic Result and QueryBuilder types"
  codeSnippets:
    - purpose: "Type-safe address validation"
      language: typescript
      code: "const addr: Address = validateAddress(userInput);"
contextHandoff:
  readyForAgents:
    - agent: react-dev
      task: "Use new type utilities in components"
    - agent: orpc-expert
      task: "Implement type-safe API endpoints"
```

## Model Selection

**Default Model**: sonnet - Type definitions follow patterns

### When to Use Opus
- Task requires deep analysis or reasoning
- Security implications present
- Novel problem without established patterns
- Cross-system integration complexity

### When to Use Sonnet  
- Standard pattern implementation
- Well-defined requirements with clear examples
- Time-sensitive tasks with established patterns
- Parallel execution with other agents
- High-volume repetitive tasks

### Model Override Examples

```yaml
# Complex task requiring Opus
task: "Analyze and optimize system architecture"
model: opus
reason: "Requires deep analysis and cross-cutting concerns"

# Simple task suitable for Sonnet
task: "Update configuration file with new environment variable"
model: sonnet
reason: "Straightforward change following established patterns"
```

### Parallel Execution Optimization

When running in parallel with other agents:
- Use Sonnet for faster response times if task complexity allows
- Reserve Opus for critical path items that block other agents
- Consider token budget when multiple agents use Opus simultaneously
