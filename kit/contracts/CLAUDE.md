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

### Security Audit Checklist

**ALWAYS check before deployment:**

- Reentrancy vulnerabilities (use nonReentrant modifier)
- Integer overflow/underflow (Solidity 0.8+ built-in protection)
- Access control gaps (check all onlyRole modifiers)
- Front-running vulnerabilities (commit-reveal patterns)
- Storage collision in upgrades (use \_\_gap arrays)
- Unchecked external calls (check return values)
- DOS vulnerabilities (gas limits, array bounds)

### Gas Optimization Patterns

```solidity
// Pack structs (32-byte slots)
struct User {
    uint128 balance;    // slot 1
    uint64 timestamp;   // slot 1
    uint64 nonce;       // slot 1
    address owner;      // slot 2
}

// Use custom errors (save ~50 gas)
error InsufficientBalance(uint256 requested, uint256 available);

// Batch operations
function batchTransfer(address[] calldata recipients, uint256[] calldata amounts)

// Cache storage reads
uint256 _balance = balance[msg.sender];  // Read once
require(_balance >= amount);
balance[msg.sender] = _balance - amount;
```

### ERC Standards Compliance

- **ERC-3643**: Security token standard with compliance
- **ERC-734/735**: Identity claims for KYC/AML
- **ERC-20**: Basic fungible token interface
- **ERC-2771**: Meta transactions support

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
