# ORPC Backend API Documentation

_This file documents ORPC server functions and API patterns within the dapp
backend._

## Token Actions API

### New Endpoint: `token.actions.ts`

The token actions API provides comprehensive querying capabilities for the
workflow management system:

**Route:** `authRouter.token.actions`

**Key Features:**

- **GraphQL Integration**: Queries The Graph subgraph for action data
- **Complex Filtering**: Supports status, type, token ID, and user address
  filters
- **Status Calculation**: Backend timestamp-based status determination
- **Pagination**: Offset/limit pattern with 1000 max limit
- **Type Safety**: Full Zod schema validation and TypeScript types

**Query Parameters:**

```typescript
{
  status?: ActionStatus;          // PENDING, UPCOMING, COMPLETED, EXPIRED
  type?: ActionType;              // Admin, User
  tokenId?: string;               // Filter by specific token
  userAddress?: string;           // Filter by user address
  limit?: number;                 // Max 1000, default varies
  offset?: number;                // Pagination offset
}
```

**Status Calculation Logic:**

```typescript
const now = Date.now();
const activeAt = new Date(action.activeAt).getTime();
const expiresAt = action.expiresAt
  ? new Date(action.expiresAt).getTime()
  : null;

if (action.executed) return ActionStatusEnum.COMPLETED;
if (expiresAt && now > expiresAt) return ActionStatusEnum.EXPIRED;
if (now < activeAt) return ActionStatusEnum.UPCOMING;
return ActionStatusEnum.PENDING;
```

**GraphQL Query Pattern:**

- Uses The Graph client for efficient subgraph queries
- Implements proper error handling with structured responses
- Supports advanced filtering with GraphQL where clauses
- Includes comprehensive JSDoc documentation with examples

## Action Schema System

### New Schema: `token.actions.schema.ts`

Centralized type definitions and validation for the actions system:

**Core Types:**

- **`ActionStatusEnum`**: Enum for consistent status handling across
  frontend/backend
- **`ActionType`**: "Admin" | "User" action categorization
- **`TokenAction`**: Complete action data structure with timestamps and
  relationships
- **Query/Response schemas**: Zod validation for all API inputs/outputs

**Action Names:**

- `"ApproveXvPSettlement"`: XvP settlement approval workflow
- `"ExecuteXvPSettlement"`: XvP settlement execution workflow
- `"MatureBond"`: Bond maturation workflow (future implementation)

**Schema Validation:**

```typescript
export const tokenActionsInputSchema = z.object({
  status: z.nativeEnum(ActionStatusEnum).optional(),
  type: z.enum(["Admin", "User"]).optional(),
  tokenId: z.string().optional(),
  userAddress: z.string().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
});
```

## API Integration Patterns

### GraphQL Client Usage

- **The Graph Integration**: Direct subgraph queries for action data
- **Error Handling**: Structured error responses with proper HTTP status codes
- **Performance**: Efficient querying with indexed fields (type, activeAt,
  executed)
- **Relationships**: Proper entity relationship handling (executor, target,
  executedBy)

### Authentication & Authorization

- **Auth Middleware**: Uses established auth router patterns
- **Session Management**: Integrates with existing session middleware
- **Permission Checking**: Validates user access to action data
- **Token Context**: Leverages token-specific permission middleware

### Data Transformation

- **Date Handling**: Converts ISO strings to Date objects for frontend
- **Status Mapping**: Backend status calculation reduces frontend complexity
- **Type Safety**: End-to-end type safety from schema to frontend
- **Validation**: Comprehensive input validation with meaningful error messages

## Best Practices

### Error Handling

- **Structured Responses**: Consistent error format across all endpoints
- **GraphQL Errors**: Proper GraphQL error handling and logging
- **Validation Errors**: Clear validation error messages for debugging
- **Network Errors**: Graceful handling of subgraph connectivity issues

### Performance Considerations

- **Query Optimization**: Efficient GraphQL queries with proper field selection
- **Pagination**: Implements offset/limit pattern for large datasets
- **Caching**: Leverages GraphQL caching mechanisms
- **Index Usage**: Queries use indexed fields for optimal performance

### Security

- **Input Validation**: All inputs validated with Zod schemas
- **Authorization**: Proper permission checking for action access
- **Data Sanitization**: Prevents injection attacks through validation
- **Rate Limiting**: Implements reasonable pagination limits

---

_This documentation covers the token actions API implementation and related
backend patterns. For frontend integration details, see the components
documentation._
