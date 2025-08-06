# Contracts Module

## Stack

Solidity 0.8.30 | Foundry + Hardhat | OpenZeppelin 5.4.0 | OnChainID v2.2.1

## Key Commands

```bash
bun run compile:forge      # Primary compiler
bun run codegen:types      # Generate TypeScript ABIs
forge test                 # Run tests before commit
bun run publish           # Deploy locally
```

## Architecture

<example>
# UUPS Proxy Pattern
ATKTypedImplementationProxy → Implementation
- Use initialize() not constructor
- Add uint256[50] private __gap for upgrades
- Never change storage layout
</example>

<example>
# Contract Hierarchy
ATKSystem (registry)
├── AccessManager (RBAC)
├── TokenFactory → ATKBond/Deposit/Equity/Fund/StableCoin
└── IdentityRegistry (ERC734/735)
</example>

## Critical Patterns

<example>
# Gas Optimization
struct User {
    uint128 balance;    // Pack in slot 1
    uint64 timestamp;   // Pack in slot 1  
    uint64 nonce;       // Pack in slot 1
    address owner;      // Slot 2
}

error InsufficientBalance(uint256 requested, uint256 available); </example>

<example>
# Test Structure
setUp() → test_Function() → testFuzz_Edge()
Use: SystemUtils, TokenUtils, IdentityUtils
</example>

## Security Checklist

- Reentrancy guards (nonReentrant)
- Access control (onlyRole)
- Storage gaps (\_\_gap arrays)
- Input validation
- Return value checks

## Common Issues

- Storage collision → use \_\_gap
- Missing initialize() → always call after deploy
- Wrong compliance order → check dependencies
- Expired claims → validate timestamps

## ERC Standards

- ERC-3643: Security tokens with compliance
- ERC-734/735: Identity claims (KYC/AML)
- ERC-2771: Meta transactions
