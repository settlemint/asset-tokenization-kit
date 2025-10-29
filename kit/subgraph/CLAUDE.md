# CLAUDE.md - Subgraph Package

## Purpose

TheGraph protocol indexer for the Asset Tokenization Kit, providing queryable
blockchain data through GraphQL. Indexes events from smart contracts to enable
efficient querying of token balances, transfers, compliance status, and system
statistics without direct blockchain calls.

## Layout

```
subgraph/
├── src/                # AssemblyScript mappings
│   ├── system/        # System contract handlers
│   ├── token/         # Token event handlers
│   ├── identity/      # Identity and KYC handlers
│   ├── compliance/    # Compliance module handlers
│   └── stats/         # Statistical aggregations
├── schema.graphql      # GraphQL schema definition
├── subgraph.yaml      # Manifest and data sources
├── test/              # Integration tests
└── generated/         # Auto-generated types from ABIs
```

## Dependencies (names only)

- **Local packages**: contracts (workspace dependency for ABIs)
- **Key libraries**: Graph Protocol CLI, AssemblyScript, Matchstick testing
  framework, GraphQL

## Best Practices (Local)

<!-- BEGIN AUTO -->

- **Entity Design**: Normalize data with proper relations; use immutable IDs;
  implement proper indexes with @derivedFrom; avoid storing computed values that
  can be derived
- **Event Handlers**: Keep handlers pure and deterministic; handle reorgs
  gracefully; batch entity saves when possible; avoid external calls or
  non-deterministic operations
- **Performance**: Use data source templates for dynamic contracts; implement
  proper pagination; avoid loading unnecessary entities; leverage caching for
  frequently accessed data
- **Testing**: Test all event handlers with Matchstick; verify entity
relationships; test edge cases and reorg scenarios; validate aggregation
accuracy
<!-- END AUTO -->

## Style & Testing Cues

### TypeScript-only

- AssemblyScript for mappings (subset of TypeScript)
- Generated types from contract ABIs
- Strong typing for all entity fields

### Oxlint/Prettier deltas from root

- AssemblyScript-specific linting rules
- GraphQL schema formatting

### Test locations

- Integration tests: `test/` directory
- Mock events and fixtures in test files
- Use Matchstick for unit testing handlers

## Agent Hints (Local)

### Interface boundaries

- **Schema immutability**: Breaking schema changes require new subgraph
  deployment
- **Event-driven only**: Cannot query blockchain directly, only indexed events
- **Deterministic execution**: Handlers must be pure functions

### Safe extension points

- Add new entities in `schema.graphql` following existing patterns
- New event handlers in appropriate `src/` subdirectories
- Statistical aggregations in `src/stats/`

### What not to touch

- SystemFactory address in `subgraph.yaml` - must match genesis
- Generated files in `generated/` directory
- Core ID generation logic - breaks existing queries

### CI considerations

- Schema must compile without errors
- All handlers must be deterministic
- Tests verify event processing accuracy
- Deployment hash must be recorded for environments
