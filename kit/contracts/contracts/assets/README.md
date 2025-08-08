# ATK Asset Tokenization

✨ [https://settlemint.com](https://settlemint.com) ✨

**A comprehensive suite of compliant asset tokenization contracts built on the
SMART Protocol foundation**

## 📋 What are ATK Assets?

ATK Assets are production-ready tokenization contracts that represent various
real-world assets (RWAs) as compliant security tokens. Built on the SMART
Protocol foundation, each asset type provides specific functionality optimized
for different financial instruments while maintaining full regulatory compliance
and interoperability.

## 🎯 Asset Types

### 1. **Bond** (`bond/`)

Fixed-term debt instruments with maturity dates and redemption features

**Key Features:**

- Fixed maturity date and face value
- Denomination asset backing (collateral)
- Yield distribution capabilities
- Redemption at maturity
- Historical balance tracking
- Supply cap management

**Extensions Used:**

- ✅ **Pausable** - Emergency stop functionality
- ✅ **Burnable** - Admin token destruction
- ✅ **Custodian** - Freeze accounts and forced transfers
- ✅ **Redeemable** - User-initiated token burning at maturity
- ✅ **Yield** - Dividend/interest distribution
- ✅ **Historical Balances** - Snapshot capabilities
- ✅ **Capped** - Maximum supply limits

**Bond-Specific Features:**

#### Maturity Management

- **Maturity Date**: Fixed timestamp when bond matures
- **Face Value**: Redemption value per token
- **Underlying Asset**: Collateral backing for redemption
- **Maturity Process**: Admin-triggered maturation after maturity date

#### Yield Distribution

- **Yield Basis**: Face value per token
- **Yield Token**: Underlying asset used for payments
- **Schedule Management**: Configurable yield distribution schedule

#### Redemption Mechanics

- **Maturity Requirement**: Only redeemable after maturation
- **Proportional Redemption**: Tokens redeemed for proportional denomination
  assets

**Use Cases:**

- Corporate bonds
- Government securities
- Asset-backed securities
- Structured products

### 2. **Equity** (`equity/`)

Tokenized shares with voting rights and governance capabilities

**Key Features:**

- Voting rights through ERC20Votes
- Governance participation
- Shareholder privileges
- Dividend distribution capabilities

**Extensions Used:**

- ✅ **Pausable** - Emergency stop functionality
- ✅ **Burnable** - Admin token destruction
- ✅ **Custodian** - Freeze accounts and forced transfers
- ✅ **Voting** - Governance and voting rights

**Equity-Specific Features:**

#### Governance Rights

- **Voting Power**: ERC20Votes implementation
- **Proposal Participation**: Token holders can vote on proposals
- **Delegate Support**: Vote delegation to representatives
- **Snapshot Mechanism**: Historical voting power tracking

**Use Cases:**

- Company shares
- Startup equity tokens
- DAO governance tokens
- Voting securities

### 3. **Deposit** (`deposit/`)

Collateral-backed deposit certificates with backing requirements

**Key Features:**

- Collateral backing verification
- Deposit certificate functionality
- Time-locked deposits
- Backing requirement enforcement

**Extensions Used:**

- ✅ **Pausable** - Emergency stop functionality
- ✅ **Burnable** - Admin token destruction
- ✅ **Custodian** - Freeze accounts and forced transfers
- ✅ **Collateral** - Backing requirements

**Deposit-Specific Features:**

#### Collateral Management

- **Collateral Claims**: OnchainID claim-based collateral verification
- **Topic-Based Backing**: Specific claim topics for collateral types
- **Continuous Verification**: Ongoing collateral validity checks

**Use Cases:**

- Certificate of deposits
- Collateralized deposit receipts
- Backing-verified deposits
- Institutional deposits

### 4. **Fund** (`fund/`)

Investment fund shares with management fees and governance

**Key Features:**

- Management fee collection
- Voting rights for fund decisions
- Share class management
- Performance tracking

**Extensions Used:**

- ✅ **Pausable** - Emergency stop functionality
- ✅ **Burnable** - Admin token destruction
- ✅ **Custodian** - Freeze accounts and forced transfers
- ✅ **Voting** - Fund governance rights

**Fund-Specific Features:**

#### Management Fees

- **Fee Basis Points**: Configurable management fee percentage
- **Time-Based Collection**: Automatic fee calculation based on time elapsed
- **Fee Distribution**: Management fee collection mechanism

#### Governance Integration

- **Voting Rights**: Fund decision-making participation
- **Share Class Management**: Different fund share categories
- **Performance Tracking**: Historical performance data

**Use Cases:**

- Mutual funds
- Hedge funds
- Index funds
- Investment trusts

### 5. **StableCoin** (`stable-coin/`)

Fiat-pegged tokens with collateral backing

**Key Features:**

- Collateral backing requirements
- Price stability mechanisms
- Regulatory compliance
- Minting/burning controls

**Extensions Used:**

- ✅ **Pausable** - Emergency stop functionality
- ✅ **Burnable** - Admin token destruction
- ✅ **Custodian** - Freeze accounts and forced transfers
- ✅ **Collateral** - Backing requirements

**StableCoin-Specific Features:**

#### Price Stability

- **Collateral Backing**: Claim-based collateral verification
- **Peg Maintenance**: Mechanisms to maintain price stability
- **Reserve Management**: Underlying asset reserve tracking

**Use Cases:**

- USD-pegged stablecoins
- Multi-collateral stablecoins
- Algorithmic stablecoins
- Central bank digital currencies (CBDCs)

### Extension Comparison

| **Extension**      | **Bond** | **Equity** | **Deposit** | **Fund** | **StableCoin** | **Purpose**              |
| ------------------ | -------- | ---------- | ----------- | -------- | -------------- | ------------------------ |
| **SMART Core**     | ✅       | ✅         | ✅          | ✅       | ✅             | Base token functionality |
| **Access Managed** | ✅       | ✅         | ✅          | ✅       | ✅             | Role-based permissions   |
| **Pausable**       | ✅       | ✅         | ✅          | ✅       | ✅             | Emergency stop           |
| **Burnable**       | ✅       | ✅         | ✅          | ✅       | ✅             | Admin token destruction  |
| **Custodian**      | ✅       | ✅         | ✅          | ✅       | ✅             | Freeze & recovery        |
| **Collateral**     | ❌       | ❌         | ✅          | ❌       | ✅             | Backing requirements     |
| **Redeemable**     | ✅       | ❌         | ❌          | ❌       | ❌             | User burn at maturity    |
| **Yield**          | ✅       | ❌         | ❌          | ❌       | ❌             | Dividend distribution    |
| **Historical**     | ✅       | ❌         | ❌          | ❌       | ❌             | Balance snapshots        |
| **Capped**         | ✅       | ❌         | ❌          | ❌       | ❌             | Supply limits            |
| **Votes**          | ❌       | ✅         | ❌          | ✅       | ❌             | Governance rights        |

## 🔐 Role-Based Access Control

All ATK Assets use a unified role-based access control system with four primary
roles:

### Role Definitions

#### **DEFAULT_ADMIN_ROLE** (`0x00`)

- **Description**: Role administration and management
- **Capabilities**:
  - Grant and revoke all other roles
  - Manage role hierarchy and permissions
  - Does not grant operational permissions (must be explicitly assigned other
    roles)

#### **GOVERNANCE_ROLE** (`keccak256("GOVERNANCE_ROLE")`)

- **Description**: Token governance and compliance management
- **Capabilities**:
  - Set onchain identity contracts
  - Configure identity registry
  - Manage compliance settings
  - Add/remove compliance modules
  - Configure module parameters

#### **SUPPLY_MANAGEMENT_ROLE** (`keccak256("SUPPLY_MANAGEMENT_ROLE")`)

- **Description**: Token supply operations
- **Capabilities**:
  - Mint new tokens
  - Burn existing tokens
  - Batch mint/burn operations
  - Set supply caps (Bond only)

#### **CUSTODIAN_ROLE** (`keccak256("CUSTODIAN_ROLE")`)

- **Description**: Custodial operations and asset protection
- **Capabilities**:
  - Freeze/unfreeze addresses
  - Freeze/unfreeze partial token amounts
  - Execute forced transfers
  - Initiate wallet recovery
  - Batch custodial operations

#### **EMERGENCY_ROLE** (`keccak256("EMERGENCY_ROLE")`)

- **Description**: Emergency response and system protection
- **Capabilities**:
  - Pause/unpause token operations
  - Recover stuck ERC20 tokens
  - Emergency system interventions

### Permission Matrix

| **Action**               | **Role Required**      | **Bond** | **Equity** | **Deposit** | **Fund** | **StableCoin** |
| ------------------------ | ---------------------- | -------- | ---------- | ----------- | -------- | -------------- |
| **Governance**           |
| Set OnchainID            | GOVERNANCE_ROLE        | ✅       | ✅         | ✅          | ✅       | ✅             |
| Set Identity Registry    | GOVERNANCE_ROLE        | ✅       | ✅         | ✅          | ✅       | ✅             |
| Set Compliance           | GOVERNANCE_ROLE        | ✅       | ✅         | ✅          | ✅       | ✅             |
| Add Compliance Module    | GOVERNANCE_ROLE        | ✅       | ✅         | ✅          | ✅       | ✅             |
| Remove Compliance Module | GOVERNANCE_ROLE        | ✅       | ✅         | ✅          | ✅       | ✅             |
| Set Yield Schedule       | GOVERNANCE_ROLE        | ✅       | ❌         | ❌          | ❌       | ❌             |
| Mature Bond              | GOVERNANCE_ROLE        | ✅       | ❌         | ❌          | ❌       | ❌             |
| **Supply Management**    |
| Mint Tokens              | SUPPLY_MANAGEMENT_ROLE | ✅       | ✅         | ✅          | ✅       | ✅             |
| Burn Tokens              | SUPPLY_MANAGEMENT_ROLE | ✅       | ✅         | ✅          | ✅       | ✅             |
| Batch Mint               | SUPPLY_MANAGEMENT_ROLE | ✅       | ✅         | ✅          | ✅       | ✅             |
| Batch Burn               | SUPPLY_MANAGEMENT_ROLE | ✅       | ✅         | ✅          | ✅       | ✅             |
| Set Supply Cap           | SUPPLY_MANAGEMENT_ROLE | ✅       | ❌         | ❌          | ❌       | ❌             |
| **Custodial Operations** |
| Freeze Address           | CUSTODIAN_ROLE         | ✅       | ✅         | ✅          | ✅       | ✅             |
| Freeze Partial Tokens    | CUSTODIAN_ROLE         | ✅       | ✅         | ✅          | ✅       | ✅             |
| Forced Transfer          | CUSTODIAN_ROLE         | ✅       | ✅         | ✅          | ✅       | ✅             |
| Recover Tokens           | CUSTODIAN_ROLE         | ✅       | ✅         | ✅          | ✅       | ✅             |
| Batch Operations         | CUSTODIAN_ROLE         | ✅       | ✅         | ✅          | ✅       | ✅             |
| **Emergency Operations** |
| Pause Contract           | EMERGENCY_ROLE         | ✅       | ✅         | ✅          | ✅       | ✅             |
| Unpause Contract         | EMERGENCY_ROLE         | ✅       | ✅         | ✅          | ✅       | ✅             |
| Recover ERC20            | EMERGENCY_ROLE         | ✅       | ✅         | ✅          | ✅       | ✅             |
| **User Operations**      |
| Transfer Tokens          | Token Holder           | ✅       | ✅         | ✅          | ✅       | ✅             |
| Redeem Tokens            | Token Holder           | ✅       | ❌         | ❌          | ❌       | ❌             |
| Vote on Proposals        | Token Holder           | ❌       | ✅         | ❌          | ✅       | ❌             |
| Claim Yield              | Token Holder           | ✅       | ❌         | ❌          | ❌       | ❌             |

## 📁 Directory Structure

```
assets/
├── ATKAssetProxy.sol                    # Base proxy for all assets
├── ATKRoles.sol                         # Role definitions
├── bond/                                # Fixed-term debt instruments
│   ├── ATKBondImplementation.sol
│   ├── ATKBondFactoryImplementation.sol
│   ├── ATKBondProxy.sol
│   ├── IATKBond.sol
│   └── IATKBondFactory.sol
├── equity/                              # Tokenized shares with voting
│   ├── ATKEquityImplementation.sol
│   ├── ATKEquityFactoryImplementation.sol
│   ├── ATKEquityProxy.sol
│   ├── IATKEquity.sol
│   └── IATKEquityFactory.sol
├── deposit/                             # Collateral-backed deposits
│   ├── ATKDepositImplementation.sol
│   ├── ATKDepositFactoryImplementation.sol
│   ├── ATKDepositProxy.sol
│   ├── IATKDeposit.sol
│   └── IATKDepositFactory.sol
├── fund/                                # Investment fund shares
│   ├── ATKFundImplementation.sol
│   ├── ATKFundFactoryImplementation.sol
│   ├── ATKFundProxy.sol
│   ├── IATKFund.sol
│   └── IATKFundFactory.sol
└── stable-coin/                         # Fiat-pegged stablecoins
    ├── ATKStableCoinImplementation.sol
    ├── ATKStableCoinFactoryImplementation.sol
    ├── ATKStableCoinProxy.sol
    ├── IATKStableCoin.sol
    └── IATKStableCoinFactory.sol
```

## ✅ Conclusion

ATK Assets provide a comprehensive suite of compliant tokenization solutions
built on the SMART Protocol foundation. Each asset type is optimized for
specific use cases while maintaining:

- **Regulatory Compliance**: Full ERC-3643 compliance with modular rules
- **Operational Flexibility**: Role-based access control and emergency
  procedures
- **Extensibility**: Modular extension system for custom functionality
- **Security**: Battle-tested security patterns and access controls
- **Interoperability**: Full ERC-20 compatibility for ecosystem integration

The unified architecture ensures consistent behavior across all asset types
while providing specialized functionality for different financial instruments,
making ATK Assets suitable for enterprise-grade tokenization at scale.
