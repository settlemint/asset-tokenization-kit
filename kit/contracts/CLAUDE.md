# Contracts

## Stack

Solidity 0.8.30 | Foundry + Hardhat | OpenZeppelin 5.4.0 | OnChainID v2.2.1

## Commands

```bash
bun run compile:forge      # Primary compiler
bun run codegen:types      # TypeScript ABIs
forge test                 # MANDATORY before commit
bun run publish            # Local deploy
```

## Architecture

### UUPS Proxy Pattern

- `ATKTypedImplementationProxy` base
- `initialize()` not constructor
- `uint256[50] private __gap;` for upgrades
- Storage layout IMMUTABLE

### Contract Hierarchy

```
ATKSystem (registry)
├── AccessManager (RBAC)
├── TokenFactory
│   ├── ATKBond/Deposit/Equity/Fund/StableCoin/Crypto
│   └── ComplianceModules
└── IdentityRegistry (ERC734/735)
```

### SMART Extensions

Composable modules: Burnable, Capped, Collateral, Pausable, Yield

### Compliance Modules

- CountryAllowList/BlockList
- IdentityAllowList/BlockList
- AddressBlockList

## Patterns

### Factory Deployment

```solidity
Factory → Proxy → Implementation
       → Compliance → Identity
```

### Test Structure

```solidity
setUp() → test_Function() → testFuzz_Edge()
Utils: SystemUtils, TokenUtils, IdentityUtils
```

### Gas Optimization

- calldata for arrays
- Pack structs
- Custom errors
- Batch operations

## Security Rules

1. No storage layout changes
2. Checks-effects-interactions
3. Reentrancy guards
4. Access control
5. Input validation

## Common Errors

- Storage collision in upgrades
- Missing initialize() call
- Wrong compliance module order
- Expired identity claims

## Interfaces

- IERC3643 (compliance token)
- IIdentity (OnChainID)
- ICompliance (rules engine)
- IClaimIssuer (KYC/AML)
