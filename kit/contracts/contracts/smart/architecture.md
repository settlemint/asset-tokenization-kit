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
    %% Top Row - Multiple Tokens
    TokenA[Token A]
    TokenB[Token B]
    TokenC[Token C]

    %% Middle Row - Compliance Contract
    CC[Compliance Contract<br/>Orchestration Engine]

    %% Right Side - Compliance Modules
    ModuleA[Module A<br/>Global Config]
    ModuleB[Module B<br/>Global Config]
    ModuleC[Module C<br/>Global Config]

    %% Token to Compliance Contract
    TokenA -->|uses| CC
    TokenB -->|uses| CC
    TokenC -->|uses| CC

    %% Compliance Contract to Modules
    CC -->|orchestrates| ModuleA
    CC -->|orchestrates| ModuleB
    CC -->|orchestrates| ModuleC

    %% Token Configuration Parameters to Modules
    TokenA -.->|"config: countries=US,UK<br/>topics=1,2"| ModuleA
    TokenA -.->|"config: maxAmount=1000"| ModuleB

    TokenB -.->|"config: countries=US,UK,DE<br/>topics=1,3"| ModuleA
    TokenB -.->|"config: minBalance=100"| ModuleC

    TokenC -.->|"config: maxHolders=50"| ModuleB
    TokenC -.->|"config: lockPeriod=30days"| ModuleC

    style CC fill:#9ff,stroke:#333,stroke-width:2px
    style ModuleA fill:#ff9,stroke:#333,stroke-width:1px
    style ModuleB fill:#ff9,stroke:#333,stroke-width:1px
    style ModuleC fill:#ff9,stroke:#333,stroke-width:1px
```

### Configuration Architecture

The diagram shows a clean separation of concerns:

#### **Token Layer**

- Multiple tokens can exist independently
- Each token defines its own compliance requirements
- Tokens use the shared compliance contract for orchestration

#### **Compliance Contract**

- Single orchestration engine shared by all tokens
- Executes compliance checks based on token-specific configuration
- Routes requests to appropriate modules

#### **Module Layer**

- Shared compliance modules with global configuration
- Each module can be used by multiple tokens with different parameters
- Modules contain both global settings and token-specific configuration

#### **Configuration Types**

**Global Configuration** (applies to all tokens):

- Module deployment and availability
- Trusted issuers registry
- Topic scheme registry
- Infrastructure settings

**Token-Specific Configuration** (per token):

- Which modules to use
- Module parameters (countries, limits, topics, etc.)
- Compliance rules specific to token type
- Business logic parameters

### Benefits of Shared Infrastructure

1. **Cost Efficiency**: Multiple tokens share the same compliance modules
2. **Consistency**: Same compliance logic across all tokens
3. **Flexibility**: Each token can have different parameters
4. **Scalability**: Easy to add new tokens without deploying new modules
5. **Maintenance**: Single point of updates for compliance logic
6. **Regulatory Alignment**: Shared global rules ensure consistency

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

2. **Pausable Extension** (`extensions/pausable/`)
   - **Purpose**: Emergency pause functionality for all token transfers
   - **Use Cases**: Security incidents, regulatory orders, system maintenance
   - **Key Functions**: `pause()`, `unpause()`

3. **Custodian Extension** (`extensions/custodian/`)
   - **Purpose**: Freeze addresses and force transfers for compliance
   - **Use Cases**: Legal orders, sanctions compliance, dispute resolution
   - **Key Functions**: `freeze(address account)`,
     `forceTransfer(from, to, amount)`

#### **User-Facing Extensions**

4. **Redeemable Extension** (`extensions/redeemable/`)
   - **Purpose**: Users can burn their own tokens (self-redemption)
   - **Use Cases**: Token buybacks, voluntary redemptions, exit mechanisms
   - **Key Functions**: `redeem(uint256 amount)`

5. **Yield Extension** (`extensions/yield/`)
   - **Purpose**: Distribute dividends or yield to token holders
   - **Use Cases**: Dividend payments, profit sharing, interest distribution
   - **Key Functions**: `distributeYield(uint256 totalAmount)`, `claimYield()`

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
   - **Key Functions**: Collateral managed through token's OnchainID identity
   - **Features**: Each token has its own identity contract for collateral
     management

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

    NewWallet->>Admin: Request Recovery with New Identity
    Admin->>Admin: Verify User Identity

    %% Step 1: Identity Recovery - User specifies new identity
    Admin->>IdentityRegistry: initiateRecovery(lostWallet, newWallet, newIdentity)
    IdentityRegistry->>IdentityRegistry: Track wallet relationship (old -> new)
    IdentityRegistry->>IdentityRegistry: Register newWallet with newIdentity
    IdentityRegistry->>IdentityRegistry: Store recovery mapping for token reclaim

    %% Step 2: Token Recovery (if needed)
    Admin->>Token: recover(lostWallet, newWallet)
    Token->>IdentityRegistry: isRecoveryAllowed(lostWallet, newWallet)
    IdentityRegistry-->>Token: Recovery permitted
    Token->>Token: Transfer Balance

    Note over NewWallet: Recovery Complete with New Identity
    Note over IdentityRegistry: Wallet relationship tracked for token reclaim
```

## Gas Optimization Strategies

1. **Storage Packing**: Related variables packed in single storage slots
2. **Immutable Variables**: Use immutable for deployment-time constants
3. **Caching**: Identity verification results cached per transaction
4. **Batch Operations**: Multiple operations combined where possible
5. **Custom Errors**: Replace require strings with custom errors
6. **Short-Circuit Evaluation**: Check cheapest conditions first

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
