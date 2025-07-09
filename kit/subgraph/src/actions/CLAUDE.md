# Subgraph Actions System Documentation

_This file documents the actions system implementation within The Graph
subgraph._

## Actions System Architecture

### Core Components

**Entities:**

- **`Action`**: Represents actionable items with lifecycle management
- **`ActionExecutor`**: Manages authorized users who can execute actions
- **Account relationships**: Links actions to target accounts and executors

**Utility Functions:** `action-utils.ts`

- **`createAction`**: Creates new actions with proper validation
- **`executeAction`**: Handles action execution with authorization checks
- **`createActionExecutor`**: Sets up executor entities with account
  relationships

### Action Lifecycle

**Creation Phase:**

1. Action created with specific executors and timing constraints
2. Linked to target account and executor entities
3. Indexed by type, activeAt, and executed status

**Execution Phase:**

1. Validation: Check executor authorization and timing constraints
2. Execution: Mark action as executed with timestamp and executor
3. Logging: Record execution details for audit trail

**Status Determination:**

- **PENDING**: Current time >= activeAt and not executed and not expired
- **UPCOMING**: Current time < activeAt
- **COMPLETED**: Action executed = true
- **EXPIRED**: Current time > expiresAt (if set) and not executed

## Entity Schema

### Action Entity

```graphql
type Action @entity {
  id: ID! # Unique identifier
  name: String! # Action name (e.g., "ApproveXvPSettlement")
  type: String! # Action type ("Admin" or "User")
  target: Account! # Target account for the action
  executor: ActionExecutor! # Authorized executor entity
  activeAt: BigInt! # When action becomes active
  expiresAt: BigInt # Optional expiration timestamp
  executed: Boolean! # Execution status
  executedAt: BigInt # When action was executed
  executedBy: Account # Who executed the action
  createdAt: BigInt! # Creation timestamp
}
```

### ActionExecutor Entity

```graphql
type ActionExecutor @entity {
  id: ID! # Unique identifier
  accounts: [Account!]! # Authorized accounts array
  actions: [Action!]! # Related actions
}
```

## Integration Patterns

### XvP Settlement Integration

**File**: `xvp-settlement.ts`

Actions are created for XvP settlement workflows:

```typescript
// Settlement approval action
createAction(
  event,
  `ApproveXvPSettlement-${event.transaction.hash.toHex()}`,
  "ApproveXvPSettlement",
  "Admin",
  event.block.timestamp,
  event.block.timestamp.plus(BigInt.fromI32(86400)), // 24 hours
  ["0x..."], // Authorized executor addresses
  settlement.asset1.account.id
);

// Settlement execution action
createAction(
  event,
  `ExecuteXvPSettlement-${event.transaction.hash.toHex()}`,
  "ExecuteXvPSettlement",
  "Admin",
  event.block.timestamp,
  event.block.timestamp.plus(BigInt.fromI32(86400)),
  ["0x..."],
  settlement.asset1.account.id
);
```

### Bond Maturation Integration

**File**: `bond.ts`

Future implementation for bond maturation workflows:

```typescript
// Bond maturation action (planned)
createAction(
  event,
  `MatureBond-${tokenId}`,
  "MatureBond",
  "Admin",
  bond.maturityDate,
  null, // No expiration
  [bond.issuer.id],
  bond.holder.id
);
```

## Utility Functions

### `createAction`

```typescript
export function createAction(
  event: ethereum.Event,
  actionId: string,
  name: string,
  type: string,
  activeAt: BigInt,
  expiresAt: BigInt | null,
  executorAddresses: string[],
  targetAccountId: string
): Action;
```

**Features:**

- Creates Action and ActionExecutor entities
- Establishes proper entity relationships
- Handles multiple executor addresses
- Validates input parameters
- Implements proper error handling

### `executeAction`

```typescript
export function executeAction(
  event: ethereum.Event,
  actionId: string,
  executorAddress: string
): Action | null;
```

**Features:**

- Validates executor authorization
- Checks timing constraints (not expired)
- Prevents double execution
- Records execution details
- Proper error handling and logging

### `createActionExecutor`

```typescript
export function createActionExecutor(
  executorId: string,
  accountIds: string[]
): ActionExecutor;
```

**Features:**

- Creates or updates ActionExecutor entities
- Manages account relationships
- Handles multiple authorized accounts
- Maintains entity consistency

## Query Patterns

### Status-Based Queries

```graphql
query PendingActions {
  actions(
    where: {
      executed: false
      activeAt_lte: "current_timestamp"
      expiresAt_gt: "current_timestamp"
    }
  ) {
    id
    name
    type
    activeAt
    expiresAt
    target {
      id
    }
    executor {
      accounts {
        id
      }
    }
  }
}
```

### Type-Based Queries

```graphql
query AdminActions {
  actions(where: { type: "Admin" }) {
    id
    name
    executed
    executedAt
    executedBy {
      id
    }
  }
}
```

## Testing Strategy

### Test Coverage

- **Action Creation**: Validates proper entity creation and relationships
- **Authorization**: Tests executor permission checking
- **Timing Constraints**: Validates activeAt/expiresAt logic
- **Execution**: Tests action execution with proper state changes
- **Query Patterns**: Validates GraphQL query efficiency

### Example Test Pattern

```typescript
test("should create action with proper executor relationships", () => {
  const action = createAction(
    event,
    "test-action",
    "TestAction",
    "Admin",
    BigInt.fromI32(1000),
    BigInt.fromI32(2000),
    ["0x123", "0x456"],
    "target-account"
  );

  assert.fieldEquals("Action", action.id, "name", "TestAction");
  assert.fieldEquals(
    "ActionExecutor",
    action.executor.id,
    "accounts",
    "[0x123, 0x456]"
  );
});
```

## Performance Considerations

### Indexing

- **Action.type**: Indexed for efficient type-based queries
- **Action.activeAt**: Indexed for time-based filtering
- **Action.executed**: Indexed for status-based queries
- **ActionExecutor.accounts**: Indexed for authorization checks

### Query Optimization

- Use specific field selection in GraphQL queries
- Implement proper pagination for large datasets
- Leverage indexed fields for filtering
- Avoid N+1 query patterns

## Security Considerations

### Authorization

- Validate executor addresses against ActionExecutor entities
- Check timing constraints before execution
- Prevent double execution with execution status checks
- Maintain immutable audit trail

### Data Integrity

- Validate all input parameters
- Handle edge cases (null values, invalid timestamps)
- Implement proper error logging
- Maintain entity relationship consistency

---

_This documentation covers the actions system implementation in The Graph
subgraph. For API integration details, see the ORPC documentation._
