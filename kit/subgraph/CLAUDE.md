# Subgraph

## Stack

TheGraph v0.38.1 | AssemblyScript (NOT TypeScript) | GraphQL | matchstick-as

## Commands

```bash
bun run codegen      # Generate AS types
bun run compile      # Build + IPFS hash
bun run publish      # Deploy local
bun run test:integration
```

## Architecture

### Structure

```
schema.graphql       # Entity definitions
subgraph.yaml       # Event mappings
src/
├── system/         # Core handlers
├── token/          # Token events
├── compliance/     # Module events
└── stats/          # Aggregations
```

### Schema Patterns

```graphql
type Token @entity {
  id: ID!
  # Derived relationships
  balances: [TokenBalance!]! @derivedFrom(field: "token")
  # Stats
  holderCount: BigInt!
}

type Event @entity(immutable: true) {
  # Immutable for integrity
}
```

## AssemblyScript Rules

### Critical Differences

```typescript
// ✅ CORRECT AS
let token = Token.load(id)
if (token == null) {
  token = new Token(id)
}
token.save()

// ❌ WRONG (TS syntax)
const token = await Token.load(id)  // NO async
token?.update()                     // NO optional chaining
[...array, item]                    // NO spread
```

### Null Handling

- No `null`/`undefined`
- Check with `== null`
- Use `!` carefully

### Arrays

```typescript
let array = entity.field;
if (array == null) {
  array = new Array<string>();
}
array.push(item);
entity.field = array; // Reassign
```

## Event Handlers

### Pattern

```typescript
export function handleTransfer(event: Transfer): void {
  // 1. Load entities
  let token = Token.load(event.address.toHex());
  if (token == null) return;

  // 2. Create event entity
  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  let transfer = new Transfer(id);

  // 3. Update state
  updateBalance(from, value.neg());
  updateBalance(to, value);

  // 4. Save all
  transfer.save();
  token.save();
}
```

### Dynamic Sources

```yaml
templates:
  - name: Token
    kind: ethereum/contract
    # Instantiated per token
```

## Common Patterns

### Stats Aggregation

- Use State entities
- `@aggregation` for timeseries
- Pre-compute for queries

### IDs

- Composite: `token-account`
- Event: `txHash-logIndex`

### Logging

```typescript
log.info("Message: {}", [value]);
log.warning("Warning: {}", [id]);
```

## Testing

```typescript
describe("Token", () => {
  test("creation", () => {
    // Mock event
    let event = createTokenCreatedEvent();
    handleTokenCreated(event);

    // Assert
    assert.fieldEquals("Token", id, "name", "Test");
  });
});
```

## Common Errors

1. Using TS syntax
2. Missing `.save()`
3. ID collisions
4. Null derefs
5. Array mutations

## Remember

AssemblyScript ≠ TypeScript
