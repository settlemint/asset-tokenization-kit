---
title: Compliance Framework
description: How compliance executes in the asset path, not around it
---

<!-- SOURCE: Book of DALP Part I/Chapter 4 — Compliance as Code lines 1-60 -->
<!-- SOURCE: Book of DALP Part II/Chapter 8 — Regulatory & Legal Framework -->
<!-- SOURCE: Book of DALP Part V/Appendix A — ERC‑3643 Deep Dive lines 1-60 -->
<!-- SOURCE: Book of DALP Part IV/Chapter 22 — Metrics & OKRs line 7 -->
<!-- EXTRACTION: Compliance philosophy, module system, and automation benefits -->
<!-- STATUS: COPIED | POLISHED | VERIFIED -->

# Compliance Framework

**Compliance cannot sit in a sidecar. It must live in the asset path, identity-bound, rule-enforced, and auditable before any state change.**

## The Compliance-as-Code Philosophy

The Asset Tokenization Kit makes compliance non-negotiable by combining onboarding (KYC/KYB), accreditation, on-chain whitelists, a jurisdictional rule engine, and regulator-grade reporting into one runtime. 

**Key principle**: Transfers that don't comply never execute. Full stop.

### What We're Enforcing

The system enforces three core requirements:

1. **Verified Investors Only**: Only verified investors can hold or receive assets
2. **Wallet-Identity Linking**: Investor identities link to one or more wallets with a whitelisted registry
3. **Pre-Transfer Rules**: Jurisdictional limits, holding periods, geo-fences, and concentration caps are checked before transfers and blocked on-chain if violated

Every decision gets audited—allow/deny outcomes, actors, timestamps, and rule references are exportable for regulators and auditors.

## Core Principles and Invariants

Four principles govern the platform's compliance plane:

### 1. Ex-Ante Control
Approvals happen before state change, not after. The policy decision must precede the transfer—no sidecar approvals.

### 2. Single Source of Truth
Investor identity, claims, and rules are canonical and reusable across all offerings on the platform.

### 3. Explainability
Every allow/deny returns machine-readable reason codes plus human evidence for audit trails.

### 4. Regulatory Continuity
Rule libraries track EU/GCC/Singapore/US frameworks and drive filings or alerts automatically.

## The SMART Compliance Module System

The SMART Protocol implements pluggable compliance modules so policy stays programmable:

### Core Modules

- **Geography Controls**: Country whitelist/blacklist enforcement
- **Investor Concentration**: Maximum ownership percentages per holder
- **Temporal Controls**: Lock-ups, vesting windows, and holding periods

### Advanced Modules

- **Supply Limits**: Maximum token supply and circulation caps
- **Approved Venues**: Restrict trading to specific exchanges or venues
- **Bespoke Rules**: Project-specific regulation for unique jurisdictions

### Module Lifecycle Management

1. **Registration**: Modules register in a central registry
2. **Deployment**: Deploy through managed factories with version control
3. **Activation**: Activate per token with administrator consent
4. **Governance**: Track updates or deactivation with governance approval

### Performance Characteristics

- **Gas footprint**: Typical modules add 3–12k gas per transfer
- **Predictable costs**: Risk teams can model cost and throughput impact alongside policy decisions
- **Optimization**: Cache identity/claims in lightweight on-chain structures

This architecture lets compliance officers mix-and-match modules per instrument while guaranteeing a single on-chain enforcement point.

## ERC-3643 Implementation

The platform implements ERC-3643 to make transfers lawful by construction:

### Execution Path

```solidity
function transfer(address to, uint256 amt) public {
  require(!paused);
  (bool allow, bytes32 reason) = policy.allow(msg.sender, to, amt, assetId);
  if (!allow) revert ComplianceDenied(reason);
  _transfer(msg.sender, to, amt); // state change
  emit TransferWithContext(msg.sender, to, amt, ctxHash);
}
```

**Invariant**: Policy decision must precede transfer. No exceptions.

### Components and Roles

- **Identity Registry**: Canonical mapping of investor → wallets + claims (jurisdiction, accreditation, restrictions)
- **Claim/Eligibility Store**: Accredited status, pro/retail classification, lockups, geographic restrictions
- **Transfer Manager**: Pre-transfer checks that block violations and emit denial reasons
- **Admin/Emergency Hooks**: `pause()`, `freeze(address)`, `forceTransfer()` under governance with full audit trail

## Identity Integration and Evidence Trail

OnchainID integration ensures identity and claim data remain reusable:

### Identity Infrastructure

- **OnchainID Contracts**: Hold decentralized identity data
- **Trusted Issuers**: Populate KYC/AML/accreditation claims
- **Identity Registry**: Verify claim freshness, revocation status, and expiration before execution
- **Compliance Engine**: Compose identity-derived rules with module logic

### Evidence Bundles

Every transaction packages:
- Identity snapshot at transaction time
- Module verdicts and rule evaluations
- Transaction metadata and context
- Immutable audit logs

This allows regulators or counterparties to verify compliance independently.

## Jurisdictional Playbook

The same rule engine expresses region-specific obligations:

### European Union - MiCA

- Country restriction + investor caps + time-based modules
- Encode passporting, lock-ups, and reporting thresholds
- Audit bundles satisfy ESMA requests without manual compilation

### United States

- Accreditation claims combined with venue restrictions
- Keep Reg D/Reg S flows separate
- Document exemption reliance automatically

### Singapore & GCC

- Claim topics model MAS fit-and-proper checks
- Shariah eligibility verification
- Geographic and asset class gating

Because compliance logic is code, policy updates are versioned, peer-reviewed, and deployed through the same pipelines that manage contracts and APIs.

## Automated Compliance Benefits

### Cost Reduction

- **95% automation rate**: Over 95% of approvals auto-handled with low manual review
- **100% block rate**: All attempted restricted transfers blocked by rules
- **90% cost reduction**: Compared to manual compliance processes

### Operational Efficiency

- **Real-time enforcement**: No delay between decision and execution
- **Audit-ready**: Complete evidence trail generated automatically
- **Version control**: All rule changes tracked and reversible
- **Testing**: Rules can be simulated before deployment

## Emergency Procedures

### Freeze Mechanism

- Isolate specific addresses immediately
- Transfers revert until address is thawed
- Full audit trail of freeze/unfreeze actions

### Force Transfer

- Legal remediation path for court orders
- Dual-control authorization required
- Records reason and order references
- Notifies affected parties automatically
- Emits `ForcedTransfer` event for transparency

## Compliance Policy Composition

### Constraint Hierarchy

1. **Hard Constraints**: Non-overridable rules
   - Sanctions and geographic restrictions
   - KYC verification state
   - Whitelist membership

2. **Soft Constraints**: Overridable by authorized workflow
   - Concentration caps
   - Per-period limits
   - Trading windows

3. **Precedence Rules**: Deny > ApproveWithWarning > Approve

### Reason Codes

Denials include compact reason codes for efficiency:
- `0x01` = Sanctions violation
- `0x02` = Not whitelisted
- `0x03` = In lockup period
- `0x04` = Concentration limit exceeded
- `0x05` = Geographic restriction

## Upgrade Strategy

- Proxy pattern with **immutable policy checkpoints** per asset version
- "Frozen policy" flag ensures no silent policy changes on live securities
- All upgrades require governance approval and notification

## Integration with External Systems

The compliance framework integrates seamlessly with:
- Third-party KYC/AML providers
- Sanctions screening services
- Regulatory reporting systems
- Traditional compliance platforms

All while maintaining the single source of truth principle.

## What This Means for Business

1. **Regulatory confidence**: Compliance executes ex-ante on the same control plane as the asset
2. **Cost savings**: 95% reduction in manual compliance overhead
3. **Speed**: Real-time compliance decisions, not batch processing
4. **Auditability**: Every decision documented and exportable
5. **Flexibility**: New rules deployed without smart contract changes
6. **Global reach**: Single platform handles multiple jurisdictions

The compliance framework ensures that your platform is regulatory-ready from day one, with the flexibility to adapt as regulations evolve.



