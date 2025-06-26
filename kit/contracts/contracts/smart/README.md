# SMART Protocol

✨ [https://settlemint.com](https://settlemint.com) ✨

**A comprehensive Solidity smart contract framework for regulatory-compliant
tokenization of real-world assets (RWAs)**

[Documentation](https://console.settlemint.com/documentation/) •
[Discord](https://discord.com/invite/Mt5yqFrey9) •
[NPM](https://www.npmjs.com/package/@settlemint/solidity-smart-protocol) •
[Issues](https://github.com/settlemint/solidity-smart-protocol/issues)

## 📋 What is SMART Protocol?

SMART Protocol is an advanced, modular smart contract framework designed for
creating regulatory-compliant security tokens and tokenizing real-world assets.
Built on multiple ERC standards, it provides a complete infrastructure for:

- **Security Token Issuance**: ERC-3643 and ERC-20 compliant tokens for
  regulated financial instruments
- **Asset Tokenization**: Bonds, equity shares, deposits, funds, and stablecoins
- **Identity Management**: On-chain KYC/AML compliance with ERC-734/735
  identities
- **Regulatory Compliance**: Modular compliance rules for different
  jurisdictions
- **DeFi Integration**: Full ERC-20 compatibility for seamless ecosystem
  integration

## 🏗️ Architecture Overview

SMART Protocol consists of three main layers:

### 1. **Extension Layer**

Modular components that add specific functionality:

- **SMARTBurnable**: Token burning capabilities
- **SMARTCustodian**: Address freezing and forced transfers
- **SMARTCollateral**: Collateral proof requirements
- **SMARTPausable**: Emergency pause functionality
- **SMARTRedeemable**: Token redemption features
- **SMARTYield**: Yield/dividend distribution
- **SMARTHistoricalBalances**: Balance snapshot tracking
- **SMARTCapped**: Token supply cap
- **SMARTAccessManaged**: External access control for token operations

### 2. **System Layer**

Infrastructure contracts for identity and compliance:

- **Identity Management**: ERC-734/735 compliant on-chain identities
- **Compliance Engine**: ERC-3643 regulatory compliance validation
- **Trust Registry**: Trusted claim issuers for KYC/AML

### 3. **Compliance modules**

Compliance modules for different regulatory requirements:

- **Country Allow/Block List**: Restrict transfers to specific countries
- **Identity Allow/Block List**: Block transfers to specific identities
- **Address Block List**: Block transfers to specific addresses
- **KYC/AML**: KYC/AML compliance validation

## 🔌 ERC Standards Implemented

SMART Protocol implements multiple Ethereum standards to provide comprehensive
functionality:

### **ERC-20: Fungible Token Standard**

- **Full Compatibility**: Complete ERC-20 and ERC-20 Metadata implementation
- **DeFi Ready**: Works seamlessly with DEXs, lending protocols, and wallets
- **Extensions**: Transfer hooks, pausable transfers, burnable tokens
- **Upgradeability**: UUPS proxy pattern support for contract upgrades

### **ERC-3643: T-REX Security Token Standard**

- **Regulatory Compliance**: Built-in KYC/AML and jurisdiction-specific rules
- **Transfer Restrictions**: Conditional transfers based on investor eligibility
- **Identity Verification**: Integration with trusted identity providers
- **Compliance Modules**: Pluggable rules for different regulatory requirements
- **Components**:
  - Identity Registry for investor management
  - Compliance validation engine
  - Trusted issuers registry for claim verification
  - Claim topics for required documentation types

### **ERC-734: Key Holder Standard**

- **On-chain Identity**: Self-sovereign identity management
- **Multi-purpose Keys**: Management, action, claim signing, and encryption keys
- **Execution Framework**: Multi-signature execution with key-based approval
- **Key Management**: Add, remove, and replace keys with proper authorization

### **ERC-735: Claim Holder Standard**

- **Verifiable Claims**: On-chain attestations about identity attributes
- **Trusted Issuers**: Claims validated by authorized third parties
- **Topic-based Organization**: Claims categorized by topics (KYC, nationality,
  etc.)
- **Revocation Support**: Ability to revoke outdated or invalid claims

### **ERC-2771: Meta-Transaction Standard**

- **Gasless Transactions**: Users can transact without holding ETH
- **Improved UX**: Third-party relayers can sponsor transaction costs
- **Trusted Forwarders**: Secure delegation of transaction execution
- **Native Integration**: Built into all SMART Protocol contracts

### **ERC-5313: Light Contract Ownership**

- **Access Control**: Role-based permission system
- **Batch Operations**: Efficient multi-role management
- **OpenZeppelin Integration**: Compatible with existing access control patterns

## 🧩 Key Highlights of SMART

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
  recovery happens in two stages: first, the identity is recovered via the
  Identity Registry (by a manager); then, the user reclaims tokens tied to that
  identity—offering secure and structured recovery.

## ⚖️ Overview Comparison

### 🔄 ERC-3643 vs SMART Protocol

| **Aspect**                               | **ERC-3643**                                | **SMART Protocol**                                                          | **Notes**                                                              |
| ---------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **ERC20 Compatibility**                  | Partial / constrained                       | Fully `ERC20` and `ERC20Upgradeable` compliant                              | Ensures full compatibility with DeFi and wallets                       |
| **Upgradeability**                       | Centralized via Implementation Authority    | Supported via UUPS; system-agnostic (project decides upgrade pattern)       | SMART provides the option but doesn't enforce a pattern                |
| **Modularity**                           | Partially modular                           | Modular by default (OpenZeppelin extension pattern)                         | SMARTBurnable, SMARTRedeemable, SMARTPausable, etc.                    |
| **Identity / Compliance Contract Reuse** | Typically one-off per token                 | Reusable across all tokens                                                  | Efficient architecture, simplifies ecosystem-wide compliance           |
| **Compliance Model**                     | Single compliance contract, may be modular  | Fully modular compliance rules; also supports monolithic if desired         | Flexible based on project use case                                     |
| **Compliance Configuration**             | No token-specific configuration             | Rule-specific parameters configurable per token                             | Enables rule reuse with different behaviors                            |
| **Claim Topics Storage**                 | External Claim Topics Registry              | Defined and stored per token                                                | Improves clarity and portability of tokens                             |
| **Identity Verification**                | Relies on Claim Topics Registry             | Token-configurable `isVerified(identity, topics)` + **optional KYC**        | Identity checks are configurable and optional                          |
| **KYC Optional**                         | Implied as required                         | **Optional** per token, part of the modular compliance                      | Allows issuing cryptocurrencies or unrestricted tokens                 |
| **Authorization**                        | Agent-based role system                     | Access-control agnostic                                                     | Supports OpenZeppelin `AccessControl`, custom roles, or hybrid models  |
| **Burning Logic**                        | Owner-initiated only (`burn(user, amount)`) | `SMARTBurnable` (admin burn) + `SMARTRedeemable` (self-burn)                | Enables more flexible redemption logic (e.g. for bonds)                |
| **Meta-Transaction Support**             | Not specified                               | Fully ERC-2771 compatible (trusted forwarders)                              | Enables gasless transactions and better UX                             |
| **Immutability**                         | Name and symbol mutable                     | Immutable following ERC20 standard                                          | Avoids confusion and aligns with token standards                       |
| **Interface Detection (ERC-165)**        | Not part of standard                        | **Built-in ERC-165 support**                                                | Enables introspection: e.g., query if token supports Burnable, etc.    |
| **Token Recovery Flow**                  | Custodian-based recovery                    | Two-step: identity registry manager handles recovery + user reclaims tokens | SMART separates identity and asset recovery for better security and UX |

## ✅ Conclusion

SMART rethinks the ERC-3643 architecture by moving modularity, configuration,
and verification closer to the token layer. This creates a more flexible,
reusable, and standards-compliant framework for compliant token issuance in
dynamic regulatory environments. By decoupling identity and compliance logic
from any single token, SMART improves scalability and opens doors for broader
cross-application identity use.

## **Common Use Cases**

| **Use Case**               | **Asset Type**  | **Key Extensions**             | **Compliance Requirements**           |
| -------------------------- | --------------- | ------------------------------ | ------------------------------------- |
| **Corporate Bonds**        | SMARTBond       | Yield, Redeemable, Pausable    | Accredited investor, KYC              |
| **Real Estate Shares**     | SMARTEquity     | Custodian, Historical Balances | KYC, Jurisdiction restrictions        |
| **Tokenized Deposits**     | SMARTDeposit    | Yield, Capped                  | Bank verification, deposit insurance  |
| **Investment Funds**       | SMARTFund       | Yield, Custodian, Burnable     | Fund prospectus, investor suitability |
| **Regulatory Stablecoins** | SMARTStableCoin | Pausable, Custodian            | Money transmitter license             |
