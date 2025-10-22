---
title: Compliance Framework
description: How compliance executes in the asset path, not around it
---

<!-- SOURCE: Book of DALP Part I/Chapter 4 — Compliance as Code -->
<!-- SOURCE: Book of DALP Part II/Chapter 8 — Regulatory & Legal Framework -->
<!-- SOURCE: Book of DALP Part IV/Chapter 22 — Metrics & OKRs, Evidence You’re Winning (or Not).md -->
<!-- SOURCE: Book of DALP Part V/Appendix A — ERC‑3643 Deep Dive -->
<!-- SOURCE: kit/contracts/contracts/system/compliance/IATKCompliance.sol -->
<!-- SOURCE: kit/contracts/contracts/system/trusted-issuers-registry/README.md -->
<!-- SOURCE: kit/contracts/contracts/smart/extensions/core/SMART.sol -->
<!-- SOURCE: kit/contracts/contracts/smart/modules/README.md -->

# Compliance Framework

**Compliance that lives outside the asset is compliance that fails. ATK executes identity, eligibility, and jurisdictional policy inside the transfer path so non-compliant transactions never settle.**

## Why sidecar compliance fails

- **Fragmented approvals slow deals.** Legacy projects bolt KYC portals and manual reviews next to tokens, leaving a “call us back” gap that stalls issuance and settlement.
- **Auditors reject unverifiable controls.** Without machine-readable evidence tied to every transfer, regulators cannot rely on the platform’s records.
- **Policy drift invites enforcement.** If claims, whitelists, and rules live in different systems, someone will forget to update one of them—and the first mistake becomes a reportable incident.

## How ATK enforces law inside the transfer path

| Requirement | Implementation | Evidence | Outcome |
|-------------|----------------|----------|---------|
| **Verified investors only** | OnchainID-backed identity registry with trusted issuer attestations (`kit/contracts/contracts/system/trusted-issuers-registry`) | `IATKCompliance.isBypassed` and identity audit trails | **Only identities with valid claims can hold or receive securities** |
| **Policy before state change** | `_beforeTransfer` hook calls `__smart_beforeTransferLogic` (see `kit/contracts/contracts/smart/extensions/core/SMART.sol`) and compliance modules revert on failure | Module errors such as `ComplianceCheckFailed` | **Restricted transfers revert on-chain with reason codes** |
| **Programmable jurisdictions** | Pluggable ERC‑3643 compliance modules (`kit/contracts/contracts/smart/modules`) configured per asset | Module registry events in `IATKCompliance` | **Geo-fences, lock-ups, and investor caps enforced without redeploying contracts** |
| **Audit-grade evidence** | Compliance events, identity snapshots, and policy versions stored together | `AddressAddedToBypassList`, `GlobalComplianceModuleAdded` events | **Regulators receive machine-readable bundles on demand** |

### Identity-first onboarding

- **Federated identity registry.** OnchainID identities map legal persons to wallet addresses; recovery flows ensure lost keys do not mean lost assets.
- **Trusted issuers registry.** Only approved issuers can attach claims; claim topics define what a “verified investor”, “eligible jurisdiction”, or “accredited institution” means.
- **Separation of duties.** `SYSTEM_MANAGER_ROLE`, `IDENTITY_MANAGER_ROLE`, and `CLAIM_POLICY_MANAGER_ROLE` enforce that no single operator can create, approve, and distribute claims.

### Programmable policy modules

- **Core controls ship ready-made.** Country allow/block lists, investor concentration caps, time-locks, supply limits, and transfer approval workflows are delivered as stateless modules.
- **Lifecycle governance.** Modules register through dedicated factories, are versioned, and require administrator approval before activation.
- **Composable logic.** Assets can combine multiple modules, with precedence rules ensuring hard constraints (sanctions, identity) always override softer limits (per-period thresholds).

### Deterministic execution path

```solidity
function _beforeTransfer(address from, address to, uint256 amount)
    internal
    override(SMARTHooks)
{
    __smart_beforeTransferLogic(from, to, amount); // identity + compliance checks
    super._beforeTransfer(from, to, amount);
}
```

- The transfer hook executes identity validation, issuer-claim checks, and every configured compliance module. Any module can revert with a typed error (for example, `ComplianceCheckFailed("Country not allowed")`), stopping the transaction before balances mutate.
- Allow and deny outcomes emit events through `IATKCompliance`, giving auditors immutable reason codes, actors, timestamps, and referenced policy IDs.

### Evidence trail

- **Transaction bundles.** Each transfer captures identity snapshots, evaluated modules, parameter sets, and decision results.
- **Immutable logs.** Compliance and identity operations emit events that feed audit stores and downstream reporting systems.
- **Machine-readable exports.** Reports align with MiCA, SEC, MAS, and GCC expectations, making regulator requests a retrieval exercise, not a reconstruction project.

## Jurisdictional playbook

- **European Union (MiCA).** Combine country restriction modules, investor caps, and time-based controls to satisfy passporting, lock-up, and disclosure thresholds; evidence bundles feed ESMA requests automatically.
- **United States (Reg D/S/CF/A+).** Accreditation claims, venue restrictions, and distribution modules keep private placements segregated from public flows while documenting exemption reliance.
- **Singapore & GCC.** Topic filters model MAS fit-and-proper rules; Shariah eligibility and regional gatekeeping use the same claim-and-module system without branching code.

Policy updates move through the same pipelines that manage smart contracts and APIs, so compliance officers track every change with version control and mandatory approvals.

## Automation and metrics

| Metric | Target | Achieved | Source |
|--------|--------|----------|--------|
| **Automated approvals** | ≥95% | >95% auto-cleared | DALP Metrics & OKRs |
| **Restricted transfer block rate** | 100% | 100% of violations blocked on-chain | DALP Metrics & OKRs |
| **Compliance review time** | <24h | 16h p95 federated KYC turnaround | DALP Metrics & OKRs |

Real-time enforcement eliminates manual queues, and every approval or denial ships with structured evidence for second-line control teams.

## Emergency and governance controls

- **Freeze addresses instantly.** Custodians invoke freeze/unfreeze functions with full audit trails; restricted wallets cannot transfer until governance releases them.
- **Force transfers under order.** Dual-control workflows execute court-mandated remediations while logging order references and notifying affected parties.
- **Immutable checkpoints.** Policy flags prevent silent parameter changes on live securities; every alteration requires explicit governance approval.

## Integration and change control

- **External services stay synchronized.** KYC/AML providers, sanctions screening, and regulatory reporting systems integrate through documented adapters without breaking the single source of truth.
- **Versioned deployments.** Compliance configurations travel with the same `bun run ci` pipeline that validates contracts, APIs, and UI code—no shadow releases.
- **Simulation-first operations.** Rules can be staged, simulated, and reviewed before production, ensuring regulators see deliberate change management.

## Business outcomes

- **Regulatory confidence from day one**—compliance executes ex-ante with evidence ready for audit.
- **Operational leverage**—95% automation keeps compliance teams focused on edge cases, not queue management.
- **Global readiness**—one control plane applies different regulatory playbooks without custom code bases.
- **Cost reduction**—institutions retire manual review tooling and redundant integrations, contributing to the 95% TCO savings proven across production deployments.

**Compliance is no longer a bolt-on workflow. In ATK, it is the runtime itself—measured, repeatable, and regulator-grade.**
