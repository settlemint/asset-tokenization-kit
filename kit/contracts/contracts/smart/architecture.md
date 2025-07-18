# SMART Protocol Architecture

## Overview

The SMART (SettleMint Adaptable Regulated Token) protocol is a comprehensive
derivation of the ERC-3643 (T-REX) standard for compliant security tokens. Built
on ERC-20 foundations using OpenZeppelin, it provides a more modular and
flexible approach to tokenized asset compliance. This document details the
architectural design, component relationships, and operational flows.

## System Architecture

### Core Components Overview

```mermaid
graph TB
    %% Main Token
    Token[SMART Token]

    %% Core Systems
    IR[Identity Registry]
    CC[Compliance Contract]
    TIR[Trusted Issuers Registry]
    TSR[Topic Scheme Registry]

    %% Identity Layer
    ID1[Identity Contract 1]
    ID2[Identity Contract 2]
    IDN[Identity Contract N]

    %% Compliance Modules
    CM1[Country Allow List]
    CM2[Identity Verification Module]
    CM3[Address Block List]
    CMN[Custom Module N]

    %% Claims
    C1[Claim Issuer 1]
    C2[Claim Issuer 2]
    CN[Claim Issuer N]

    %% Relationships
    Token -->|validates via| CC

    IR -->|stores| ID1
    IR -->|stores| ID2
    IR -->|stores| IDN

    CC -->|uses| CM1
    CC -->|uses| CM2
    CC -->|uses| CM3
    CC -->|uses| CMN

    %% Identity verification flow
    CM2 -->|calls isVerified| IR
    IR -->|verifies against| TIR
    IR -->|validates topics| TSR
    IR -->|checks claims| ID1
    IR -->|checks claims| ID2
    IR -->|checks claims| IDN

    ID1 -->|has claims from| C1
    ID2 -->|has claims from| C2
    IDN -->|has claims from| CN

    TIR -->|trusts| C1
    TIR -->|trusts| C2
    TIR -->|trusts| CN

    style Token fill:#f9f,stroke:#333,stroke-width:4px
    style IR fill:#9ff,stroke:#333,stroke-width:2px
    style CC fill:#9ff,stroke:#333,stroke-width:2px
    style TIR fill:#ff9,stroke:#333,stroke-width:2px
    style TSR fill:#ff9,stroke:#333,stroke-width:2px
    style CM2 fill:#9f9,stroke:#333,stroke-width:2px
```

### Component Descriptions

#### 1. **SMART Token**

The main security token contract that derives from ERC-3643 principles while
maintaining full ERC-20 compatibility through OpenZeppelin. Available in two
variants:

- **SMART.sol**: Non-upgradeable implementation
- **SMARTUpgradeable.sol**: UUPS upgradeable implementation

#### 2. **Identity Registry**

Central registry mapping wallet addresses to identity contracts. Features:

- Stores identity contract addresses for each wallet
- Manages identity verification status
- Handles wallet recovery mechanisms
- Supports identity transfers

#### 3. **Compliance Contract**

Orchestrates compliance checks as an engine based on token configuration:

- Executes modules configured on each specific token
- Performs pre-transfer validation using token's module list
- Updates post-transfer state for configured modules
- No modules stored directly - purely orchestration engine

#### 4. **Trusted Issuers Registry**

Manages trusted entities that can issue identity claims:

- Stores trusted issuer addresses
- Maps issuers to claim topics they can attest
- Supports multiple issuers per topic

#### 5. **Topic Scheme Registry**

Defines the claim topics available for compliance:

- Lists valid claim topics globally
- Maps topics to verification requirements
- Shared registry across all tokens

## Token Transfer Flow

### Detailed Transfer Sequence

```mermaid
sequenceDiagram
    participant User
    participant Token
    participant Compliance
    participant IdentityModule
    participant IdentityRegistry
    participant Identity
    participant TrustedIssuers
    participant TopicScheme
    participant Module1
    participant ModuleN

    User->>Token: transfer(to, amount)

    %% Compliance Check (including identity verification)
    Token->>Compliance: canTransfer(from, to, amount)

    loop For each module
        Compliance->>IdentityModule: canTransfer(token, from, to, amount, params)

        %% Identity verification within module (only checks recipient)
        IdentityModule->>IdentityRegistry: isVerified(to, requiredClaimTopics)
        IdentityRegistry->>TopicScheme: hasTopicScheme(topic)
        TopicScheme-->>IdentityRegistry: topic valid
        IdentityRegistry->>TrustedIssuers: getTrustedIssuersForClaimTopic(topic)
        TrustedIssuers-->>IdentityRegistry: trusted issuers list
        IdentityRegistry->>Identity: getClaim(claimId)
        Identity-->>IdentityRegistry: claim data
        IdentityRegistry->>TrustedIssuers: isClaimValid(identity, topic, signature, data)
        TrustedIssuers-->>IdentityRegistry: claim validity
        IdentityRegistry-->>IdentityModule: verification result

        IdentityModule-->>Compliance: true/false

        Compliance->>Module1: canTransfer(token, from, to, amount, params)
        Module1-->>Compliance: true/false
        Compliance->>ModuleN: canTransfer(token, from, to, amount, params)
        ModuleN-->>Compliance: true/false
    end

    Compliance-->>Token: compliance result

    alt Transfer Allowed
        Token->>Token: _transfer(from, to, amount)
        Token->>Compliance: transferred(from, to, amount)

        loop Update each module
            Compliance->>IdentityModule: transferred(from, to, amount)
            Compliance->>Module1: transferred(from, to, amount)
            Compliance->>ModuleN: transferred(from, to, amount)
        end

        Token-->>User: Transfer Success
    else Transfer Blocked
        Token-->>User: Revert with reason
    end
```

### Transfer Validation Steps

1. **Identity Verification**
   - Verify receiver has valid identity contract and required claims
   - Sender verification is assumed (already owns tokens, so was previously
     verified)

2. **Compliance Validation**
   - Compliance engine runs through modules configured on the specific token
   - Each configured module performs its specific checks
   - All configured modules must approve for transfer to proceed

3. **Balance Updates**
   - Execute standard ERC-20 transfer
   - Update compliance module states
   - Emit transfer events

## Compliance Module Architecture

### Multi-Token Configuration

```mermaid
graph TB
    %% Multiple Tokens
    TokenA[Token A]
    TokenB[Token B]
    TokenC[Token C]

    %% Token-Specific Compliance Configurations
    ConfigA[Token A Compliance Config<br/>Modules: A, B<br/>Parameters: {...}]
    ConfigB[Token B Compliance Config<br/>Modules: A, C<br/>Parameters: {...}]
    ConfigC[Token C Compliance Config<br/>Modules: B, C<br/>Parameters: {...}]

    %% Shared Compliance Contract
    CC[Compliance Contract<br/>Orchestration Engine]

    %% Compliance Modules
    ModuleA[Module A]
    ModuleB[Module B]
    ModuleC[Module C]

    %% Global Module Configuration
    GlobalA[Module A Global Config]
    GlobalB[Module B Global Config]
    GlobalC[Module C Global Config]

    %% Relationships
    TokenA -->|has configuration| ConfigA
    TokenB -->|has configuration| ConfigB
    TokenC -->|has configuration| ConfigC

    TokenA -->|uses| CC
    TokenB -->|uses| CC
    TokenC -->|uses| CC

    CC -->|orchestrates| ModuleA
    CC -->|orchestrates| ModuleB
    CC -->|orchestrates| ModuleC

    ConfigA -->|configures| ModuleA
    ConfigA -->|configures| ModuleB

    ConfigB -->|configures| ModuleA
    ConfigB -->|configures| ModuleC

    ConfigC -->|configures| ModuleB
    ConfigC -->|configures| ModuleC

    GlobalA -->|global config| ModuleA
    GlobalB -->|global config| ModuleB
    GlobalC -->|global config| ModuleC

    ModuleA -->|verifies| Identity[Identity/Claims System]
    ModuleB -->|verifies| Identity
    ModuleC -->|verifies| Identity

    style CC fill:#9ff,stroke:#333,stroke-width:2px
    style ConfigA fill:#f9f,stroke:#333,stroke-width:1px
    style ConfigB fill:#f9f,stroke:#333,stroke-width:1px
    style ConfigC fill:#f9f,stroke:#333,stroke-width:1px
    style GlobalA fill:#ff9,stroke:#333,stroke-width:1px
    style GlobalB fill:#ff9,stroke:#333,stroke-width:1px
    style GlobalC fill:#ff9,stroke:#333,stroke-width:1px
```

### Configuration Levels

#### **Global Configuration**

- **Trusted Issuers Registry**: Defines which entities can issue identity claims
- **Topic Scheme Registry**: Defines valid claim topics (KYC, Accreditation,
  etc.)
- **Module Deployment**: Shared compliance modules across all tokens
- **Infrastructure**: Identity registry, storage contracts

#### **Token-Specific Configuration**

- **Required Claim Topics**: Each token defines which claims investors must have
- **Module Parameters**: Token-specific rules (allowed countries, transfer
  limits, etc.)
- **Compliance Rules**: Different restrictions per token type
- **Extension Configuration**: Token-specific feature enablement

### Configuration Example

```solidity
// Global Configuration (shared across all tokens)
TrustedIssuersRegistry.addTrustedIssuer(kycProvider, [1, 2, 3]); // Can issue KYC, Country, Accreditation
TopicSchemeRegistry.addTopicScheme(1, "KYC Verification");
TopicSchemeRegistry.addTopicScheme(2, "Country Verification");
TopicSchemeRegistry.addTopicScheme(3, "Accredited Investor");

// Token A Configuration (Real Estate Token)
TokenA.setRequiredClaimTopics([1, 2]); // Requires KYC + Country
CountryModule.setAllowedCountries(TokenA, [840, 826]); // US, UK only
IdentityModule.setRequiredTopics(TokenA, [1, 2]);

// Token B Configuration (Corporate Bond)
TokenB.setRequiredClaimTopics([1, 3]); // Requires KYC + Accreditation
CountryModule.setAllowedCountries(TokenB, [840, 826, 276]); // US, UK, Germany
IdentityModule.setRequiredTopics(TokenB, [1, 3]);

// Token C Configuration (Equity Shares)
TokenC.setRequiredClaimTopics([1, 2, 3]); // Requires KYC + Country + Accreditation
CountryModule.setAllowedCountries(TokenC, [840]); // US only
IdentityModule.setRequiredTopics(TokenC, [1, 2, 3]);
```

### Benefits of Shared Infrastructure

1. **Cost Efficiency**: Multiple tokens share the same compliance modules
2. **Consistency**: Same compliance logic across all tokens
3. **Flexibility**: Each token can have different parameters
4. **Scalability**: Easy to add new tokens without deploying new modules
5. **Maintenance**: Single point of updates for compliance logic
6. **Regulatory Alignment**: Shared global rules ensure consistency

### Module Hierarchy

```mermaid
graph LR
    Base[ISMARTComplianceModule] --> Country[Country Modules]
    Base --> Identity[Identity Modules]
    Base --> Transfer[Transfer Modules]
    Base --> Time[Time Modules]

    Country --> CA[Country Allow List]
    Country --> CB[Country Block List]

    Identity --> IA[Identity Allow List]
    Identity --> IV[Identity Verification]
    Identity --> AB[Address Block List]

    Transfer --> TL[Transfer Limits]
    Transfer --> HL[Holder Limits]

    Time --> TR[Time Restrictions]
    Time --> LP[Lock Periods]

    style Base fill:#f9f,stroke:#333,stroke-width:2px
```

### Module Interface

Each compliance module implements:

```solidity
interface ISMARTComplianceModule {
    // Pre-transfer check
    function canTransfer(
        address from,
        address to,
        uint256 amount
    ) external view returns (bool);

    // Post-transfer state update
    function transferred(
        address from,
        address to,
        uint256 amount
    ) external;

    // Token creation hook
    function created(address to, uint256 amount) external;

    // Token destruction hook
    function destroyed(address from, uint256 amount) external;
}
```

## Token Extensions Architecture

### Extension System

```mermaid
graph TD
    Core[SMART Core] --> Burnable[Burnable]
    Core --> Pausable[Pausable]
    Core --> Custodian[Custodian]
    Core --> Redeemable[Redeemable]
    Core --> Yield[Yield]
    Core --> Historical[Historical Balances]
    Core --> Capped[Capped Supply]
    Core --> Collateral[Collateral]

    Burnable --> |Admin can| Burn[Burn tokens]
    Pausable --> |Emergency| Pause[Pause transfers]
    Custodian --> |Compliance| Freeze[Freeze & Force transfers]
    Redeemable --> |User can| Redeem[Self-burn tokens]
    Yield --> |Distribute| Dividends[Pay dividends]
    Historical --> |Query| Snapshots[Historical balances]
    Capped --> |Limit| Supply[Maximum supply]
    Collateral --> |Require| Backing[Collateral backing]
```

### Extension Descriptions

The SMART protocol's modular approach allows mixing and matching extensions
based on specific tokenization needs. Each extension adds specific functionality
through well-defined interfaces:

#### **Administrative Extensions**

1. **Burnable Extension** (`extensions/burnable/`)
   - **Purpose**: Allows designated administrators to burn tokens from any
     account
   - **Use Cases**: Regulatory compliance, token destruction, supply management
   - **Key Functions**: `burn(address account, uint256 amount)`
   - **Access Control**: Supply Manager role required

2. **Pausable Extension** (`extensions/pausable/`)
   - **Purpose**: Emergency pause functionality for all token transfers
   - **Use Cases**: Security incidents, regulatory orders, system maintenance
   - **Key Functions**: `pause()`, `unpause()`
   - **Access Control**: Token Admin role required

3. **Custodian Extension** (`extensions/custodian/`)
   - **Purpose**: Freeze addresses and force transfers for compliance
   - **Use Cases**: Legal orders, sanctions compliance, dispute resolution
   - **Key Functions**: `freeze(address account)`,
     `forceTransfer(from, to, amount)`
   - **Access Control**: Compliance Manager role required

#### **User-Facing Extensions**

4. **Redeemable Extension** (`extensions/redeemable/`)
   - **Purpose**: Users can burn their own tokens (self-redemption)
   - **Use Cases**: Token buybacks, voluntary redemptions, exit mechanisms
   - **Key Functions**: `redeem(uint256 amount)`
   - **Access Control**: Token holders can redeem their own tokens

5. **Yield Extension** (`extensions/yield/`)
   - **Purpose**: Distribute dividends or yield to token holders
   - **Use Cases**: Dividend payments, profit sharing, interest distribution
   - **Key Functions**: `distributeYield(uint256 totalAmount)`, `claimYield()`
   - **Access Control**: Yield Manager role for distribution

#### **Data & Analytics Extensions**

6. **Historical Balances Extension** (`extensions/historical/`)
   - **Purpose**: Query historical balance data at specific blocks
   - **Use Cases**: Snapshot governance, historical reporting, audit trails
   - **Key Functions**: `balanceOfAt(address account, uint256 blockNumber)`
   - **Features**: Automatic snapshot creation on transfers

#### **Supply Management Extensions**

7. **Capped Extension** (`extensions/capped/`)
   - **Purpose**: Enforce maximum token supply limits
   - **Use Cases**: Fixed supply tokens, inflation control, tokenomics
   - **Key Functions**: `cap()`, `totalSupply()`
   - **Features**: Prevents minting beyond cap, immutable once set

8. **Collateral Extension** (`extensions/collateral/`)
   - **Purpose**: Require collateral backing for token issuance
   - **Use Cases**: Asset-backed tokens, stablecoins, secured instruments
   - **Key Functions**: `addCollateral(uint256 amount)`,
     `removeCollateral(uint256 amount)`
   - **Features**: Maintains collateral ratios, prevents over-issuance

#### **Extension Compatibility**

Extensions are designed to work together seamlessly:

- **Burnable + Redeemable**: Admin and user-initiated token destruction
- **Pausable + Custodian**: Emergency controls with granular freezing
- **Yield + Historical**: Dividend distribution based on historical snapshots
- **Capped + Collateral**: Supply-limited tokens with backing requirements

#### **vs. Standard ERC-3643**

Unlike standard ERC-3643 implementations, SMART protocol's derivation approach
provides:

- **Modular Design**: Add only needed functionality
- **Role-Based Access**: Granular permission system
- **Upgradeability**: Extensions can be added/removed post-deployment
- **Composability**: Extensions work together without conflicts
- **Gas Efficiency**: Pay only for used functionality

## Identity and Claims System

### Identity Architecture

```mermaid
graph TB
    Wallet[User Wallet] --> Registry[Identity Registry]
    Registry --> Identity[Identity Contract]

    Identity --> Claim1[KYC Claim]
    Identity --> Claim2[Country Claim]
    Identity --> Claim3[Accreditation Claim]
    Identity --> ClaimN[Custom Claim N]

    Issuer1[KYC Provider] -.->|issues| Claim1
    Issuer2[Government] -.->|issues| Claim2
    Issuer3[Accreditation Service] -.->|issues| Claim3
    IssuerN[Custom Issuer] -.->|issues| ClaimN

    TrustedReg[Trusted Issuers Registry] -->|validates| Issuer1
    TrustedReg -->|validates| Issuer2
    TrustedReg -->|validates| Issuer3
    TrustedReg -->|validates| IssuerN

    style Wallet fill:#f9f,stroke:#333,stroke-width:2px
    style Identity fill:#9ff,stroke:#333,stroke-width:2px
```

### Claim Structure

Claims follow the ERC-735 standard:

- **Topic**: Category of the claim (e.g., KYC, Country, Accreditation)
- **Scheme**: Version/format of the claim data
- **Issuer**: Address that issued and signed the claim
- **Signature**: Cryptographic proof of claim validity
- **Data**: Encrypted or hashed claim information
- **URI**: Optional link to off-chain claim data

## Recovery Mechanism

### Two-Step Recovery Process

```mermaid
sequenceDiagram
    participant LostWallet
    participant NewWallet
    participant IdentityRegistry
    participant Identity
    participant Token
    participant Admin

    Note over LostWallet: Wallet Lost/Compromised

    NewWallet->>Admin: Request Recovery
    Admin->>Admin: Verify User Identity

    %% Step 1: Identity Recovery
    Admin->>IdentityRegistry: initiateRecovery(lostWallet, newWallet)
    IdentityRegistry->>Identity: transferOwnership(newWallet)
    Identity-->>IdentityRegistry: Ownership Updated

    %% Step 2: Token Recovery (if needed)
    Admin->>Token: recover(lostWallet, newWallet)
    Token->>Token: Transfer Balance
    Token->>IdentityRegistry: Update Mapping

    Note over NewWallet: Recovery Complete
```

## Gas Optimization Strategies

1. **Storage Packing**: Related variables packed in single storage slots
2. **Immutable Variables**: Use immutable for deployment-time constants
3. **Caching**: Identity verification results cached per transaction
4. **Batch Operations**: Multiple operations combined where possible
5. **Custom Errors**: Replace require strings with custom errors
6. **Short-Circuit Evaluation**: Check cheapest conditions first

## Security Architecture

### Access Control Hierarchy

```mermaid
graph TD
    Owner[Contract Owner] --> TokenAdmin[Token Admin]
    Owner --> ComplianceAdmin[Compliance Admin]
    Owner --> IdentityAdmin[Identity Admin]

    TokenAdmin --> Pause[Pause/Unpause]
    TokenAdmin --> Burn[Force Burn]
    TokenAdmin --> Freeze[Freeze Accounts]

    ComplianceAdmin --> AddModule[Add Modules]
    ComplianceAdmin --> RemoveModule[Remove Modules]
    ComplianceAdmin --> ConfigModule[Configure Modules]

    IdentityAdmin --> AddIssuer[Add Issuers]
    IdentityAdmin --> RemoveIssuer[Remove Issuers]
    IdentityAdmin --> Recovery[Handle Recovery]
```

### Security Features

1. **Role-Based Access Control**: Granular permissions for different operations
2. **Reentrancy Protection**: All state changes follow CEI pattern
3. **Integer Overflow Protection**: Solidity 0.8+ built-in protections
4. **Signature Validation**: All claims cryptographically verified
5. **Upgrade Safety**: UUPS pattern with access control

## Integration Points

### External System Integration

```mermaid
graph LR
    SMART[SMART Protocol] --> DeFi[DeFi Protocols]
    SMART --> CEX[Centralized Exchanges]
    SMART --> Custody[Custody Solutions]
    SMART --> KYC[KYC Providers]

    DeFi --> AMM[AMMs]
    DeFi --> Lending[Lending Protocols]

    CEX --> Trading[Trading Interfaces]
    CEX --> Settlement[Settlement Systems]

    Custody --> Cold[Cold Storage]
    Custody --> MultiSig[Multi-Signature]

    KYC --> Identity[Identity Verification]
    KYC --> Claims[Claim Issuance]
```

## Performance Characteristics

### Operation Complexity

| Operation                 | Gas Cost | Complexity             |
| ------------------------- | -------- | ---------------------- |
| Transfer (verified users) | ~150k    | O(m) where m = modules |
| Initial Registration      | ~300k    | O(1)                   |
| Add Compliance Module     | ~50k     | O(1)                   |
| Identity Verification     | ~100k    | O(c) where c = claims  |
| Burn Tokens               | ~80k     | O(1)                   |
| Pause/Unpause             | ~30k     | O(1)                   |

### Scalability Considerations

1. **Module Count**: Linear scaling with number of compliance modules
2. **Claim Verification**: Cached after first check per transaction
3. **Storage Growth**: Minimal per-user storage requirements
4. **Batch Operations**: Support for batch transfers and operations
