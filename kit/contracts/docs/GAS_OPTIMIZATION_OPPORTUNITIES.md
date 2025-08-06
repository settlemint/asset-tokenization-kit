# Gas Optimization Opportunities

This document tracks potential gas optimization opportunities identified by
`forge lint` in the ATK contracts.

## Keccak256 Inline Assembly Optimizations

The following locations use `keccak256` in a way that could be optimized using
inline assembly for better gas efficiency. These are currently implemented using
standard Solidity patterns for clarity and safety.

### Files with Optimization Opportunities (26 total)

#### Airdrop Module

- `contracts/addons/airdrop/ATKAirdrop.sol:233` - Hash calculation for claim
  verification
- `contracts/addons/airdrop/push-airdrop/ATKPushAirdropFactoryImplementation.sol:37` -
  Salt generation for deterministic deployment

#### Token Sale Module

- `contracts/addons/token-sale/ATKTokenSaleFactory.sol`
  - Line 131: Hash for sale configuration
  - Line 154: Hash for participant verification
  - Line 159: Additional hash computation

#### Vault Module

- `contracts/addons/vault/ATKVault.sol:479` - Hash for vault state tracking

#### System Core

- `contracts/system/addons/AbstractATKSystemAddonFactoryImplementation.sol`
  - Line 84: Salt generation for proxy deployment
  - Line 104: Address prediction hash
- `contracts/system/token-factory/AbstractATKTokenFactoryImplementation.sol`
  - Line 139: Salt calculation for token deployment
  - Line 155: Address prediction for deterministic deployment

## Implementation Considerations

### Current Pattern (Safe, Clear)

```solidity
bytes32 salt = keccak256(abi.encodePacked(param1, param2));
```

### Optimized Pattern (Gas Efficient)

```solidity
bytes32 salt;
assembly {
    let data := mload(0x40)
    mstore(data, param1)
    mstore(add(data, 0x20), param2)
    salt := keccak256(data, 0x40)
}
```

## Trade-offs

### Benefits of Current Implementation

- **Clarity**: Standard Solidity patterns are easier to understand and audit
- **Safety**: Less prone to memory management errors
- **Maintainability**: Easier for developers to modify and extend
- **Tooling**: Better support from analysis tools and linters

### Benefits of Optimization

- **Gas Savings**: ~50-100 gas per hash operation
- **Performance**: More efficient for high-frequency operations

## Recommendation

Given that these hash operations are primarily used in:

1. One-time deployment operations (factory contracts)
2. Claim verification (not high-frequency)
3. Administrative functions

The current implementation prioritizes **security and clarity** over marginal
gas savings. These optimizations could be considered for a future gas
optimization phase if:

- Gas costs become a significant concern
- High-frequency operations are introduced
- After comprehensive security audits

## Priority

**LOW** - These optimizations would provide minimal benefit given the current
usage patterns and the trade-offs in code complexity and auditability.

---

_Last updated: 2025-08-06_ _Generated from forge lint analysis_
