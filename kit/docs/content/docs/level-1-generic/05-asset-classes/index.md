---
title: Asset Classes
description: Production-ready financial instruments built on the SMART protocol foundation
---

<!-- SOURCE: kit/contracts/contracts/assets/README.md -->
<!-- SOURCE: kit/contracts/contracts/smart/README.md -->
<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 1 — Issuance & Lifecycle, from Zero to Regulated Asset.md -->
<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 2 — Corporate Actions & Asset Servicing, No‑Leak, No‑Delay.md -->

# Asset Classes Overview

**SMART protocol primitives power five institutional asset templates—bonds, equity, funds, stablecoins, and deposits—each shipping with the lifecycle automation, compliance hooks, and modular extensions required for regulated markets.**

## Navigate the Asset Templates

- [Bonds](./bonds) — Fixed-term debt with automated coupon schedules, redemption workflows, and investor limits derived from regulatory playbooks.
- [Equity](./equity) — Voting rights, dividend orchestration, and cap-table integrity for private and publicly traded shares.
- [Funds](./funds) — NAV calculation, subscription/redemption gates, and fee management for open-ended or closed-ended vehicles.
- [Stablecoins](./stablecoins) — Collateral management, reserve attestations, and transfer policies for payment and settlement programmes.
- [Deposits](./deposits) — Time-locked certificates and yield distribution logic aligned with treasury and cash management requirements.

## Shared Foundation

- **Lifecycle governance:** Issuance, corporate actions, and redemptions execute through deterministic workflows shared across instruments.
- **Compliance at the transfer path:** Eligibility checks, jurisdictional gates, and policy-controlled pausing are encoded directly in the contracts and ORPC layer.
- **Operational automation:** Audit trails, historical balance snapshots, and integration hooks keep reconciliation, reporting, and downstream systems in sync.

Select the instrument relevant to your programme to review the detailed business workflows, compliance requirements, and technical specifications.
