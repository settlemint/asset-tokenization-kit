# ATK Token Sale Module

This module provides a comprehensive solution for conducting compliant token
sales for ATK tokens with advanced features including vesting, multiple
payment currencies, and regulatory compliance.

## Architecture Overview

The token sale module consists of four main components:

### 1. IATKTokenSale.sol

The interface that defines all functions, events, and errors for the token sale
contract. This provides a standardized API for interacting with token sale
instances.

### 2. ATKTokenSale.sol

The main implementation contract that handles:

- **Compliance**: Integration with ATK identity registry for buyer eligibility
- **Vesting**: Configurable token vesting with cliff periods
- **Multiple Payment Methods**: Support for native currency and multiple ERC20
  tokens
- **Flexible Pricing**: Configurable price ratios for different payment
  currencies
- **Admin Controls**: Role-based access control for sale management
- **Upgradeable**: Uses OpenZeppelin's upgradeable contract pattern

### 3. ATKTokenSaleProxy.sol

A transparent upgradeable proxy that allows for contract upgrades while
preserving state and address.

### 4. ATKTokenSaleFactory.sol

A factory contract for deploying new token sale instances with deterministic
addresses using CREATE2.

## Key Features

### 🔒 Compliance & Security

- **Identity Verification**: Automatic buyer eligibility checks through ATK
  identity registry
- **Role-Based Access**: Separate roles for sale administration and funds
  management
- **Reentrancy Protection**: Built-in protection against reentrancy attacks
- **Pausable Operations**: Emergency pause functionality for sale operations

### 💰 Flexible Payment Options

- **Native Currency**: Direct ETH/native token payments
- **ERC20 Tokens**: Support for multiple ERC20 payment currencies
- **Dynamic Pricing**: Configurable price ratios for different currencies
- **Real-time Price Calculation**: Automatic token amount calculations

### ⏰ Vesting & Time Controls

- **Linear Vesting**: Configurable vesting schedules with cliff periods
- **Immediate Distribution**: Option for immediate token distribution
- **Time-based Controls**: Sale start/end time enforcement
- **Withdrawal Management**: Secure token withdrawal for vested amounts

### 🏭 Factory Deployment

- **Deterministic Addresses**: CREATE2 deployment for predictable addresses
- **Automated Setup**: Automatic role assignment and initialization
- **Batch Deployment**: Efficient deployment of multiple sales

## Sale Lifecycle

### 1. Setup Phase (`SaleStatus.SETUP`)

- Configure sale parameters (timing, pricing, limits)
- Add accepted payment currencies
- Configure vesting (if applicable)
- Set purchase limits

### 2. Active Phase (`SaleStatus.ACTIVE`)

- Accept token purchases from eligible buyers
- Enforce purchase limits and hard cap
- Process payments and token distributions

### 3. Paused Phase (`SaleStatus.PAUSED`)

- Temporarily halt purchases while maintaining configuration
- Can be resumed to active state

### 4. Ended Phase (`SaleStatus.ENDED`)

- Permanently concluded sale
- Allow withdrawal of remaining tokens (if vesting enabled)
- Enable funds withdrawal by administrators

## Usage Examples

### Deploying a Token Sale

```solidity
// Using the factory
address saleAddress = factory.deployTokenSale(
    tokenAddress,     // ATK token address
    adminAddress,     // Sale administrator
    startTime,        // Unix timestamp
    86400,           // 24 hours duration
    1000000e18,      // 1M tokens hard cap
    1e15,            // 0.001 ETH per token
    nonce            // Deployment nonce
);
```

### Configuring Vesting

```solidity
// 1 year vesting with 3 month cliff
sale.configureVesting(
    block.timestamp + 86400,  // Start vesting tomorrow
    365 days,                 // 1 year vesting duration
    90 days                   // 3 month cliff
);
```

### Adding Payment Currencies

```solidity
// Add USDC with 1:1000 ratio (1 USDC = 1000 tokens)
sale.addPaymentCurrency(
    usdcAddress,
    1000 * 1e18  // Price ratio scaled by 1e18
);
```

### Purchasing Tokens

```solidity
// With native currency
uint256 tokenAmount = sale.buyTokens{value: 1 ether}();

// With ERC20 token
IERC20(usdcToken).approve(saleAddress, 1000e6);
uint256 tokenAmount = sale.buyTokensWithERC20(usdcToken, 1000e6);
```

## Security Considerations

### Access Control

- `DEFAULT_ADMIN_ROLE`: Full administrative access
- `SALE_ADMIN_ROLE`: Sale configuration and management
- `FUNDS_MANAGER_ROLE`: Withdrawal of sale proceeds

### Input Validation

- All timestamps and amounts are validated
- Address zero checks for all address parameters
- Arithmetic overflow protection (Solidity 0.8+)

### Compliance Integration

- Automatic buyer eligibility verification
- Integration with ATK identity registry
- Respect for token compliance rules

## Gas Optimization

- Packed storage structs for efficient storage
- Minimal external calls during purchases
- Efficient calculation algorithms for pricing and vesting

## Events

The contract emits comprehensive events for:

- Token purchases and withdrawals
- Sale status changes
- Payment currency management
- Administrative actions

## Error Handling

Custom errors provide clear feedback for:

- Timing violations (sale not started/ended)
- Purchase limit violations
- Unauthorized access attempts
- Invalid configuration parameters

## Testing

The module should be thoroughly tested for:

- Various purchase scenarios and edge cases
- Vesting calculations and withdrawal timing
- Access control and permission management
- Integration with ATK token compliance

## Deployment Checklist

1. ✅ Deploy implementation contract
2. ✅ Deploy factory with implementation address
3. ✅ Set up proper access controls
4. ✅ Configure trusted forwarder (if using meta-transactions)
5. ✅ Verify all contracts on block explorer
6. ✅ Test with small amounts before production use

## Upgradeability

The proxy pattern allows for:

- Bug fixes in implementation logic
- Feature additions and improvements
- Maintaining state across upgrades
- Preserving contract addresses

Always test upgrades thoroughly on testnets before applying to production.
