---
title: Glossary
description: Authoritative ATK terminology aligned with DALP sources
---

# Glossary

Every term below is extracted directly from the approved source set: Appendix L (selected glossary), Appendix A (ERC‑3643 deep dive), Appendix B (data model & events), Part I Chapter 4 (Compliance as Code), and Part II Chapter 8 (Regulatory & Legal Framework). Use the _Category_ and _Source_ columns to filter quickly when preparing executive decks, compliance artefacts, or technical briefs.

| Term | Category | Definition | Source |
|------|----------|------------|--------|
| **ATK (Asset Tokenization Kit)** | Business | SettleMint’s production implementation of the SMART protocol with ERC‑3643 concepts, shipping compliant token types, addons, and operational services. | Appendix L |
| **DALP (Digital Asset Lifecycle Platform)** | Business | The broader market infrastructure vision the ATK enables—issuance, compliance, custody, settlement, and servicing on one control plane. | Appendix L |
| **SMART protocol** | Architecture | Contract architecture embedding identity registry, compliance contract, and pluggable compliance modules directly in the token path. | Appendix L |
| **Bond (Asset)** | Financial | Fixed-term token that bakes in maturity/redemption mechanics and yield distribution. | Appendix L |
| **Equity (Asset)** | Financial | Governance-enabled token (ERC20Votes) providing voting rights within the tokenized cap table. | Appendix L |
| **Fund (Asset)** | Financial | Tokenized representation of an investment fund share, integrated with NAV workflows. | Appendix L |
| **Deposit (Asset)** | Financial | Collateral-backed certificate with enforceable backing requirements for holders. | Appendix L |
| **StableCoin (Asset)** | Financial | Fiat-pegged token with issuance and redemption controls running inside the SMART protocol. | Appendix L |
| **Fixed Yield addon** | Financial | Schedule module that defines periodic distributions for yield-bearing assets. | Appendix L |
| **Airdrop addon** | Technical | Distribution addon supporting time-bound or vesting campaigns with bitmap and amount tracking. | Appendix L |
| **Vault addon** | Technical | Multi-signature treasury module that governs controlled operations on treasury funds. | Appendix L |
| **XvP addon** | Settlement | Atomic settlement addon enabling value-for-value swaps (e.g., token-for-token) with compliance continuity. | Appendix L |
| **Compliance module** | Compliance | Pluggable rule component (geo filters, investor caps, time locks, supply limits, transfer approvals) evaluated before state change. | Appendix L |
| **Identity registry (OnchainID style)** | Compliance | Canonical mapping of wallets to verified identities backed by signed claims from trusted issuers. | Appendix L |
| **Topics (Claims)** | Compliance | Numeric identifiers for claim types—KYC/KYB, AML, accreditation, residency—that drive policy evaluation. | Appendix L |
| **Trusted issuer** | Compliance | Approved attestor permitted to sign claims for specific topics within the identity registry. | Appendix L |
| **Pre-transfer check** | Compliance | Enforced evaluation that blocks non-compliant transfers before any state change on-chain. | Appendix L |
| **GOVERNANCE_ROLE** | Role | Permission set that establishes protocol references and manages module configuration. | Appendix L |
| **SUPPLY_MANAGEMENT_ROLE** | Role | Role authorized to mint, burn, and enforce supply caps for a tokenized asset. | Appendix L |
| **CUSTODIAN_ROLE** | Role | Operators empowered to freeze/unfreeze addresses and execute recovery or forced transfers. | Appendix L |
| **EMERGENCY_ROLE** | Role | Authority to pause/unpause operations and run emergency procedures under governance. | Appendix L |
| **Transaction Signer** | Platform | Secure signing and policy enforcement service for outbound blockchain transactions. | Appendix L |
| **Portal/API** | Platform | Developer entry point exposing ABIs and helper tooling for the ATK runtime. | Appendix L |
| **Hasura** | Platform | GraphQL layer over Postgres providing structured access to off-chain data and views. | Appendix L |
| **Graph-node (The Graph)** | Platform | Event indexer that turns on-chain emissions into queryable subgraphs. | Appendix L |
| **ERPC / Load Balancer** | Platform | RPC gateway that brokers access to public or private EVM nodes with balancing. | Appendix L |
| **Blockscout** | Platform | Explorer surfaced with the kit for transaction and contract introspection. | Appendix L |
| **Observability stack** | Platform | Metrics, logs, and traces dashboards bundled with the runtime. | Appendix L |
| **MinIO / S3** | Platform | Object storage layer for artefacts and documents within the ATK deployment footprint. | Appendix L |
| **PostgreSQL** | Platform | Primary relational datastore used by ATK backend services. | Appendix L |
| **Redis** | Platform | Caching and queueing layer underpinning high-throughput workflows. | Appendix L |
| **Atomic DvP** | Settlement | Delivery-versus-payment pattern where token and cash legs settle simultaneously—both or none. | Appendix L |
| **Eligibility ticket** | Settlement | Short-lived approval artefact that lets trading venues pre-validate compliance before matching. | Appendix L |
| **Omnibus look-through** | Settlement | Custodian attestation flow that keeps beneficial ownership visible even inside pooled accounts. | Appendix L |
| **Cap-table truth** | Settlement | Canonical, real-time ownership record tied directly to on-chain events. | Appendix L |
| **Identity Registry (ERC‑3643)** | ERC‑3643 | Canonical investor → wallet mapping used inside the transfer path to enforce eligibility. | Appendix A |
| **Transfer Manager** | ERC‑3643 | Controller executing pre-transfer compliance checks and reverting non-compliant transactions. | Appendix A |
| **Emergency hooks** | ERC‑3643 | Governance-controlled `pause`, `freeze`, and `forceTransfer` capabilities with full audit context. | Appendix A |
| **Compliance reason codes** | ERC‑3643 | Machine-readable denial codes (e.g., sanctions, whitelist failures) returned whenever policy blocks a transfer. | Appendix A |
| **Ex-ante control** | Compliance | Principle that approvals execute before any state change, eliminating after-the-fact remediation. | Part I Ch 4 |
| **Single source of compliance truth** | Compliance | Shared repository of identities, claims, and rules reused across offerings and venues. | Part I Ch 4 |
| **Explainability** | Compliance | Guarantee that every allow/deny decision emits machine-readable reason codes plus human evidence for audit. | Part I Ch 4 |
| **Regulatory continuity** | Compliance | Continuous tracking of EU/GCC/SG/US frameworks with automated filings and alerts. | Part I Ch 4 |
| **Evidence bundles** | Compliance | Packaged identity snapshots, module verdicts, and transaction metadata proving compliance outcomes. | Part I Ch 4 |
| **Travel Rule** | Regulatory | Obligation for originator/beneficiary data to accompany value transfers between regulated entities; encoded directly in ATK flows. | Part II Ch 8 |
| **MiCA (EU)** | Regulatory | Markets in Crypto-Assets regulation covering crypto-asset issuance; stablecoin rules enforceable from June 30 2024. | Part II Ch 8 |
| **DLT Pilot Regime** | Regulatory | EU framework granting issuance, trading, and settlement permissions on DLT without rewriting securities law. | Part II Ch 8 |
| **Digital Securities Sandbox (UK)** | Regulatory | UK program enabling issuance, trading, and settlement of digital securities under modified supervision. | Part II Ch 8 |
| **Article 12 UCC (US)** | Regulatory | Commercial law update that recognises controllable electronic records so property rights settle cleanly. | Part II Ch 8 |
| **MAS Stablecoin Framework** | Regulatory | Singapore regime imposing reserve and redemption discipline on stablecoin issuers. | Part II Ch 8 |
| **VARA licensing (Gulf)** | Regulatory | Dubai’s Virtual Assets Regulatory Authority framework covering custody, issuance, exchanges, and stablecoins. | Part II Ch 8 |
| **Transfer.blocked event** | Blockchain | Webhook/event payload carrying blocked transfer details, including denial reason, from the operational data plane. | Appendix B |
| **Settlement.finalized event** | Blockchain | Event emitted when atomic settlement completes, citing trade ID, token transaction, and cash reference. | Appendix B |
| **Corpaction.paid event** | Blockchain | Structured payload listing holders and amounts when a coupon or dividend executes. | Appendix B |
| **Rule table** | Blockchain | Core data-model table storing jurisdictional expressions and activation state for compliance rules. | Appendix B |

