---
title: Custody Connectivity
description: Multi-tier key control, omnibus transparency, and policy enforcement for institutional custodians
---

<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 3 — Custody & Wallet Management, Bank‑Grade Key Control.md -->
<!-- SOURCE: the-book-of-dalp/Part I — The Why/Chapter 5 — Custody and Settlement Clarity (Bank-Grade Control & Atomic DvP).md -->
<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 16 — Integration Patterns (Banking, Custody, Venues).md -->

# Custody Connectivity

**Custodians plug in as first-class peers while compliance retains veto authority.** HSM/MPC-backed multi-sig policies, omnibus look-through, and custodian attestations prevent blind spots even when holdings pool in vaults.

- **Multi-tier controls:** 2-of-3 daily ops, 3-of-5 large transfers, and 4-of-7 emergency signatures maintain segregation of duties (Part I Ch 5).
- **Omnibus transparency:** Custodian attestations feed the cap-table indexer so eligibility rules remain truthful (Part II Ch 3).
- **MPC/HSM parity:** Fireblocks, Metaco, and internal vaults connect through the same policy engine with MPC or HSM enforcement (Part II Ch 3; Part III Ch 16).
- **Hot/warm/cold tiers:** Custody policies span issuance wallets, approval queues, and cold storage, all governed by the same policy fabric (Part II Ch 3).

```mermaid
flowchart LR
    Request[Transfer request] --> Policy[Policy engine]
    Policy --> Approvals[Multi-sig approvals]
    Approvals --> Custodian[Custodian API / HSM]
    Custodian --> Attest[Beneficial ownership attestation]
    Attest --> Compliance[Compliance registry]
    Compliance --> Ledger
```
