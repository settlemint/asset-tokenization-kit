# CLAUDE.md - Contracts Package

## Purpose

Smart contract layer for the Asset Tokenization Kit, providing on-chain
infrastructure for tokenizing real-world assets. Implements ERC standards with
compliance modules, identity management, and yield mechanisms. Serves as the
blockchain foundation for bonds, equities, funds, stablecoins, and deposits.

## Layout

```
contracts/
├── contracts/           # Solidity source files
│   ├── assets/         # Token implementations (Bond, Equity, Fund, etc.)
│   ├── system/         # Core system contracts (Factory, Registry, Roles)
│   ├── addons/         # Optional features (Airdrops, XvP, Yield)
│   ├── onchainid/      # Identity and claims management
│   └── smart/          # SMART token standards and extensions
├── test/               # Foundry test suite
├── scripts/            # Deployment and setup scripts
├── ignition/           # Hardhat Ignition deployment modules
└── genesis/            # Pre-deployed contract genesis
```

## Dependencies (names only)

- **Local packages**: None (base layer)
- **Key libraries**: OpenZeppelin Contracts, OpenZeppelin Upgradeable,
  OnchainID, Foundry, Hardhat, Viem, Merkletreejs

## Best Practices (Local)

<!-- BEGIN AUTO -->

- **Solidity**: Use latest stable compiler version; implement CEI pattern
  (Checks-Effects-Interactions); leverage OpenZeppelin for standard
  implementations; always include reentrancy guards for external calls
- **Foundry**: Structure tests with clear setup/execution/assertion phases; use
  fuzzing for property testing; leverage forge coverage for completeness;
  organize tests to mirror contract structure
- **Upgradeable Contracts**: Use initializer pattern instead of constructors;
  implement storage gaps for future upgrades; version your implementations; test
  upgrade paths thoroughly
- **Gas Optimization**: Pack struct variables by size; use events for data
storage when appropriate; prefer `external` over `public` for functions; batch
operations where possible
<!-- END AUTO -->

## Style & Testing Cues

### TypeScript-only

- Use `tsgo` for TypeScript compilation checks
- Leverage Viem for type-safe contract interactions in scripts
- Generate TypeScript types from ABIs via codegen

### Oxlint/Prettier deltas from root

- Solhint for Solidity linting with max warnings = 0
- Forge formatter for consistent Solidity style

### Test locations

- Unit tests: `test/` directory with `.t.sol` extension
- Integration tests: `scripts/hardhat/main.ts` for deployment testing
- Coverage: `bun run test:ci` generates LCOV reports

## Agent Hints (Local)

### Interface boundaries

- **Immutable after deployment**: Contracts cannot be modified once deployed to
  production
- **Proxy pattern**: Most contracts use upgradeable proxies via
  `ATKTypedImplementationProxy`
- **Factory pattern**: New assets created through factory contracts, not
  deployed directly

### Safe extension points

- Add new asset types in `contracts/assets/` following existing patterns
- Extend addons in `contracts/addons/` for optional features
- Add compliance modules following `IComplianceModule` interface

### What not to touch

- Core system contracts in `contracts/system/` require extreme caution
- Identity contracts follow OnchainID standards - modifications break compliance
- Genesis file is auto-generated - never edit manually

### CI considerations

- Compilation must pass both Foundry and Hardhat
- All tests must pass with 100% assertion coverage
- Gas reports generated for optimization tracking
