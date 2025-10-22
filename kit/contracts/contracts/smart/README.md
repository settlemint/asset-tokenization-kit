# SMART Protocol

✨ [https://settlemint.com](https://settlemint.com) ✨

**A comprehensive Solidity smart contract framework for regulatory-compliant
tokenization of real-world assets (RWAs)**

[Documentation](https://console.settlemint.com/documentation/) •
[Discord](https://discord.com/invite/Mt5yqFrey9) •
[NPM](https://www.npmjs.com/package/@settlemint/solidity-smart-protocol) •
[Issues](https://github.com/settlemint/solidity-smart-protocol/issues)

## 📋 What is SMART Protocol?

SMART (SettleMint Adaptable Regulated Token) Protocol is an advanced, modular
smart contract framework designed for creating regulatory-compliant security
tokens and tokenizing real-world assets. Built as a derivation of ERC-3643 with
ERC-20 foundations using OpenZeppelin, it provides a complete infrastructure
for:

- **Security Token Issuance**: ERC-3643 derived and ERC-20 compliant tokens for
  regulated financial instruments
- **Asset Tokenization**: Bonds, equity shares, deposits, funds, and stablecoins
- **Advanced Identity Management**: On-chain KYC/AML compliance with ERC-734/735
  identities and **logical expressions** for complex verification rules
- **Regulatory Compliance**: Modular compliance rules for different
  jurisdictions
- **DeFi Integration**: Full ERC-20 compatibility for seamless ecosystem
  integration

### Key Highlights of SMART

- **ERC20 Compliance**: Fully implements `ERC20` and `ERC20Upgradeable`,
  ensuring compatibility with Ethereum tooling and DeFi ecosystems.
- **Externally Modular Architecture**: SMART uses composable extensions (e.g.,
  `SMARTBurnable`, `SMARTCollateral`) in a plug-and-play model.
- **Token-Configurable Compliance**: SMART tokens can be configured to use
  specific modular rules and parameters without needing custom compliance
  contracts.
- **Token-Agnostic Identity Verification**: Identity registry remains reusable
  across tokens and use cases—tokens dynamically pass required claim topics into
  the verification logic.
- **Authorization Agnostic**: SMART is compatible with any authorization logic
  via hooks (e.g., OpenZeppelin `AccessControl`).
- **ERC-2771 Meta-Transaction Support**: Compatible with trusted forwarders for
  gasless transactions and improved UX.
- **Upgradeable & Non-Upgradeable Support**: SMART supports both upgradeable
  (proxy-based) and fixed (non-upgradeable) token deployments—giving issuers
  full control over token mutability.
- **KYC is optional**: SMART supports both regulated and unregulated assets.
  Tokens can opt into identity verification (KYC/AML) or operate
  permissionlessly—ideal for both security tokens and cryptocurrencies.
- **Built-in ERC-165 Interface Detection**: Every SMART token implements
  ERC-165, allowing external systems to query which capabilities (burnable,
  redeemable, etc.) a token supports—improving composability and tooling.
- **Two-Step Identity Recovery Flow**: If a user loses access to their wallet,
  recovery happens in two stages: first, a new identity is registered for the
  new wallet via the Identity Registry (by a manager) and the relationship is
  tracked; then, the user reclaims tokens from the lost wallet after the token
  validates the recovery with the Identity Registry—offering secure and
  structured recovery.

## 🏗️ Architecture Overview

SMART Protocol consists of three main layers:

### 1. **Token Layer** - Smart contract tokens with configurable compliance

### 2. **Compliance Layer** - Orchestration engine with modular rules

### 3. **Identity Layer** - On-chain identity management and verification

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

**Key Insight**: The compliance contract acts as an orchestration engine,
executing different modules based on each token's configuration. This allows
multiple tokens to share the same compliance infrastructure while having
completely different compliance requirements.

### ERC Standards Implemented

SMART Protocol implements multiple Ethereum standards to provide comprehensive
functionality:

#### **ERC-20: Fungible Token Standard**

- **Full Compatibility**: Complete ERC-20 and ERC-20 Metadata implementation
- **DeFi Ready**: Works seamlessly with DEXs, lending protocols, and wallets
- **Extensions**: Transfer hooks, pausable transfers, burnable tokens
- **Upgradeability**: UUPS proxy pattern support for contract upgrades

#### **ERC-3643: T-REX Security Token Standard**

- **Regulatory Compliance**: Built-in KYC/AML and jurisdiction-specific rules
- **Transfer Restrictions**: Conditional transfers based on investor eligibility
- **Identity Verification**: Integration with trusted identity providers
- **Compliance Modules**: Pluggable rules for different regulatory requirements
- **Components**:
  - Identity Registry for investor management
  - Compliance validation engine
  - Trusted issuers registry for claim verification
  - Claim topics for required documentation types

#### **ERC-734: Key Holder Standard**

- **On-chain Identity**: Self-sovereign identity management
- **Multi-purpose Keys**: Management, action, claim signing, and encryption keys
- **Execution Framework**: Multi-signature execution with key-based approval
- **Key Management**: Add, remove, and replace keys with proper authorization

#### **ERC-735: Claim Holder Standard**

- **Verifiable Claims**: On-chain attestations about identity attributes
- **Trusted Issuers**: Claims validated by authorized third parties
- **Topic-based Organization**: Claims categorized by topics (KYC, nationality,
  etc.)
- **Revocation Support**: Ability to revoke outdated or invalid claims

#### **ERC-2771: Meta-Transaction Standard**

- **Gasless Transactions**: Users can transact without holding ETH
- **Improved UX**: Third-party relayers can sponsor transaction costs
- **Trusted Forwarders**: Secure delegation of transaction execution
- **Native Integration**: Built into all SMART Protocol contracts

## 🎯 Token Layer

### SMART Token

The main security token contract that derives from ERC-3643 principles while
maintaining full ERC-20 compatibility through OpenZeppelin. Available in two
variants:

- **SMART.sol**: Non-upgradeable implementation
- **SMARTUpgradeable.sol**: UUPS upgradeable implementation

### Token Extensions

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

Each extension adds specific functionality through well-defined interfaces:

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
   - **Key Functions**: `redeemFor(address owner, uint256 amount)`
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
   - **Key Functions**: Collateral managed through token's OnchainID identity
   - **Features**: Each token has its own identity contract for collateral
     management

## ⚖️ Compliance Layer

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

### Overview

The diagram shows a clean separation of concerns:

- **Token Layer**
  - Multiple tokens can exist independently
  - Each token defines its own compliance requirements
  - Tokens use the shared compliance contract for orchestration

- **Compliance Contract**
  - Single orchestration engine shared by all tokens
  - Executes compliance checks based on token-specific configuration
    - Routes requests to appropriate modules

- **Module Layer**
  - Shared compliance modules with global configuration
  - Each module can be used by multiple tokens with different parameters
  - Modules contain both global settings and token-specific configuration

### Compliance Contract

Orchestrates compliance checks as an engine based on token configuration:

- Executes modules configured on each specific token
- Performs pre-transfer validation using token's module list
- Updates post-transfer state for configured modules
- No modules stored directly - purely orchestration engine

### Compliance Modules

The SMART protocol provides a flexible, extensible compliance module system with
both default modules and support for custom implementations. The system supports
country restrictions, identity verification with logical expressions, transfer
limits, time-based restrictions, and more.

**📖 For detailed documentation of all compliance modules, see:
[`modules/README.md`](modules/README.md)**

Key highlights:

- **Advanced Identity Verification**: Complex logical expressions beyond simple
  AND-only requirements
- **Flexible Configuration**: Global infrastructure with per-token parameters
- **Modular Architecture**: Mix and match modules based on regulatory
  requirements
- **Extensible Framework**: Create custom modules for specific compliance needs

Available module categories:

- **Country-based**: Allow/block lists for jurisdictions
- **Identity-based**: Verification, allow/block lists for identities and
  addresses
- **Transfer & Supply**: Token supply limits, investor count restrictions
- **Time-based**: Lock-up periods, holding requirements

## 🔐 Identity Layer

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

### Identity Registry

Central registry mapping wallet addresses to identity contracts. Features:

- Stores identity contract addresses for each wallet
- Manages identity verification status
- Handles wallet recovery mechanisms
- Supports identity transfers

### Trusted Issuers Registry

Manages trusted entities that can issue identity claims:

- Stores trusted issuer addresses
- Maps issuers to claim topics they can attest
- Supports multiple issuers per topic

### Topic Scheme Registry

Defines the claim topics available for compliance:

- Lists valid claim topics globally
- Maps topics to verification requirements
- Shared registry across all tokens

### 2 step recovery mechanism

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

## 🚀 Complete System Flow

Now that we've covered all three layers, here's how they work together during a
token transfer:

### Token Transfer Flow

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
        IdentityModule->>IdentityRegistry: isVerified(to, logicalExpression)
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

## 🔄 ERC-3643 vs SMART Protocol

| **Aspect**                               | **ERC-3643**                                | **SMART Protocol**                                                          | **Notes**                                                              |
| ---------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **ERC20 Compatibility**                  | Partial / constrained                       | Fully `ERC20` and `ERC20Upgradeable` compliant                              | Ensures full compatibility with DeFi and wallets                       |
| **Upgradeability**                       | Centralized via Implementation Authority    | Supported via UUPS; system-agnostic (project decides upgrade pattern)       | SMART provides the option but doesn't enforce a pattern                |
| **Modularity**                           | Partially modular                           | Modular by default (OpenZeppelin extension pattern)                         | SMARTBurnable, SMARTRedeemable, SMARTPausable, etc.                    |
| **Identity / Compliance Contract Reuse** | Typically one-off per token                 | Reusable across all tokens                                                  | Efficient architecture, simplifies ecosystem-wide compliance           |
| **Compliance Model**                     | Single compliance contract, may be modular  | Fully modular compliance rules; also supports monolithic if desired         | Flexible based on project use case                                     |
| **Compliance Configuration**             | No token-specific configuration             | Rule-specific parameters configurable per token                             | Enables rule reuse with different behaviors                            |
| **Claim Topics Storage**                 | External Claim Topics Registry              | Defined and stored per token                                                | Improves clarity and portability of tokens                             |
| **Identity Verification**                | Simple AND-only logic for required topics   | **Advanced logical expressions** with AND/OR/NOT                            | Enables complex rules like "CONTRACT OR (KYC AND AML)"                 |
| **KYC Optional**                         | Implied as required                         | **Optional** per token, part of the modular compliance                      | Allows issuing cryptocurrencies or unrestricted tokens                 |
| **Authorization**                        | Agent-based role system                     | Access-control agnostic                                                     | Supports OpenZeppelin `AccessControl`, custom roles, or hybrid models  |
| **Burning Logic**                        | Owner-initiated only (`burn(user, amount)`) | `SMARTBurnable` (admin burn) + `SMARTRedeemable` (self-burn)                | Enables more flexible redemption logic (e.g. for bonds)                |
| **Meta-Transaction Support**             | Not specified                               | Fully ERC-2771 compatible (trusted forwarders)                              | Enables gasless transactions and better UX                             |
| **Immutability**                         | Name and symbol mutable                     | Immutable following ERC20 standard                                          | Avoids confusion and aligns with token standards                       |
| **Interface Detection (ERC-165)**        | Not part of standard                        | **Built-in ERC-165 support**                                                | Enables introspection: e.g., query if token supports Burnable, etc.    |
| **Token Recovery Flow**                  | Custodian-based recovery                    | Two-step: identity registry manager handles recovery + user reclaims tokens | SMART separates identity and asset recovery for better security and UX |

## **Common Use Cases**

| **Use Case**               | **Asset Type**  | **Key Extensions**             | **Compliance Requirements**           |
| -------------------------- | --------------- | ------------------------------ | ------------------------------------- |
| **Corporate Bonds**        | SMARTBond       | Yield, Redeemable, Pausable    | Accredited investor, KYC              |
| **Real Estate Shares**     | SMARTEquity     | Custodian, Historical Balances | KYC, Jurisdiction restrictions        |
| **Tokenized Deposits**     | SMARTDeposit    | Yield, Capped                  | Bank verification, deposit insurance  |
| **Investment Funds**       | SMARTFund       | Yield, Custodian, Burnable     | Fund prospectus, investor suitability |
| **Regulatory Stablecoins** | SMARTStableCoin | Pausable, Custodian            | Money transmitter license             |

## ✅ Conclusion

SMART rethinks the ERC-3643 architecture by moving modularity, configuration,
and verification closer to the token layer. This creates a more flexible,
reusable, and standards-compliant framework for compliant token issuance in
dynamic regulatory environments. By decoupling identity and compliance logic
from any single token, SMART improves scalability and opens doors for broader
cross-application identity use.
