# Subgraph Documentation

_This file documents The Graph subgraph implementation for blockchain data
indexing within the Asset Tokenization Kit._

## Subgraph Overview

The subgraph provides comprehensive indexing of blockchain events for efficient
querying via GraphQL:

**Technology Stack:**

- **The Graph Protocol**: Decentralized indexing protocol
- **AssemblyScript**: TypeScript-like language for event handlers
- **GraphQL**: Query interface for indexed data
- **PostgreSQL**: Underlying data storage (managed by The Graph)

**Key Features:**

- **Real-time Event Processing**: Indexes blockchain events as they occur
- **Entity Relationships**: Complex data relationships for efficient querying
- **Statistical Aggregations**: Pre-computed stats for dashboard performance
- **Multi-Asset Support**: Handles all asset types (Bond, Equity, Fund, Deposit,
  StableCoin)

## Architecture Patterns

### Actions System Integration

**New Feature**: The actions system provides workflow management for
time-sensitive blockchain operations.

**Core Components:**

- **Action Entity**: Represents actionable items with lifecycle management
- **ActionExecutor Entity**: Manages authorized users for action execution
- **Action Utilities** (`src/actions/action-utils.ts`): Helper functions for
  action management

**Integration Points:**

- **XvP Settlements**: Approval and execution actions for settlement workflows
- **Bond Maturation**: Planned integration for bond lifecycle management
- **Custom Workflows**: Extensible pattern for new action types

**Architecture Benefits:**

- **Time-based Workflows**: Support for scheduled and time-sensitive operations
- **Authorization Management**: Multi-user authorization with proper validation
- **Audit Trail**: Complete tracking of who executed what and when
- **Query Efficiency**: Indexed fields for optimal query performance

### Event Processing

**Event Handlers:**

- **Token Assets**: Bond, Equity, Fund, Deposit, StableCoin events
- **System Events**: Factory deployments, system configuration changes
- **Identity Events**: OnChainID and compliance-related events
- **Action Events**: Workflow creation and execution events

**Processing Patterns:**

- **Immutable Creation**: Entities created once and never modified
- **Mutable State**: Status and relationship updates through separate functions
- **Relationship Management**: Proper entity linking and relationship updates
- **Error Handling**: Graceful handling of malformed or invalid events

### Entity Relationships

**Primary Entities:**

- **Token**: Asset token with metadata and statistics
- **Account**: User accounts with identity and balance information
- **Action**: Workflow actions with timing and authorization
- **System**: System configuration and compliance settings

**Relationship Patterns:**

- **One-to-Many**: Token to Actions, Account to Actions
- **Many-to-Many**: ActionExecutor to Accounts
- **Hierarchical**: System to Tokens, Identity to Claims
- **Statistical**: Aggregated data for dashboard performance

## Development Workflow

### Adding New Actions

1. **Define Action Type**: Add new action name to schema and handlers
2. **Create Action**: Use `createAction` utility with proper parameters
3. **Handle Execution**: Implement execution logic with `executeAction`
4. **Add Tests**: Write comprehensive tests for new action workflows
5. **Update Documentation**: Document new action patterns and usage

### Schema Evolution

1. **Schema Changes**: Update `schema.graphql` with new entities/fields
2. **Migration Planning**: Plan for data migration if needed
3. **Handler Updates**: Update event handlers for new schema
4. **Testing**: Comprehensive testing of schema changes
5. **Deployment**: Deploy with proper rollback strategy

### Performance Optimization

1. **Index Strategy**: Add indexes for frequently queried fields
2. **Query Optimization**: Optimize GraphQL queries for efficiency
3. **Batch Processing**: Process multiple events in batches where possible
4. **Caching**: Implement proper caching for computed values
5. **Monitoring**: Monitor query performance and optimize bottlenecks

## Best Practices

### Code Organization

- **Modular Structure**: Organize code by feature/entity type
- **Utility Functions**: Create reusable utilities for common operations
- **Type Safety**: Use proper TypeScript types throughout
- **Error Handling**: Implement comprehensive error handling and logging

### Data Integrity

- **Validation**: Validate all input data before processing
- **Consistency**: Maintain data consistency across related entities
- **Immutability**: Design for immutable event processing
- **Audit Trail**: Maintain complete audit trails for all operations

### Performance

- **Efficient Queries**: Use indexed fields for filtering and sorting
- **Pagination**: Implement proper pagination for large datasets
- **Batch Operations**: Process multiple related events together
- **Memory Management**: Avoid memory leaks in long-running processes

## Recent Enhancements

### Actions System

- **Complete workflow management** for blockchain operations
- **Time-based activation** with expiration handling
- **Multi-user authorization** with proper permission validation
- **Integration with XvP settlements** and planned bond maturation

### XvP Integration

- **Settlement tracking** with complete lifecycle management
- **Action creation** for approval and execution workflows
- **Real-time status updates** through GraphQL subscriptions
- **Comprehensive testing** with edge case coverage

### Testing Infrastructure

- **Unit Tests**: Comprehensive test coverage for all action utilities
- **Integration Tests**: End-to-end testing of action workflows
- **Performance Tests**: Query performance and optimization testing
- **Edge Case Testing**: Validation of error conditions and edge cases

---

_For specific implementation details, see the feature-specific documentation in
`src/actions/CLAUDE.md` and other component directories._
