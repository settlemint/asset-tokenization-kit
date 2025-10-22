---
title: Integration Ecosystem
description: Connect banking, custody, venue, and settlement systems without losing compliance control
---

<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 16 — Integration Patterns (Banking, Custody, Venues).md -->
<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 4 — Settlement & Interoperability, T+0 Is the Baseline.md -->

# Integration Ecosystem

**The integration plane keeps ATK embedded in bank infrastructure while preserving DALP compliance guarantees. Pre-built adapters handle ISO 20022 messaging, custody attestations, exchange eligibility, and atomic settlement so legacy systems and distributed ledgers stay in lockstep.**

## Navigate the Connectors

- [Banking Integration](./banking) — ISO 20022 mirroring, multi-rail settlement, and reconciliation reporting for treasury and core banking.
- [Custody Connectivity](./custody) — HSM/MPC policy engines, omnibus transparency, and attestation flows for institutional custodians.
- [Trading Venues](./venues) — Eligibility ticketing, exchange adapters, and post-trade synchronization for ATS, P2P, and bulletin boards.
- [Settlement & Clearing](./settlement) — XvP escrow, liquidity management, and evidence bundles that make T+0 the default.

## Implementation Themes

- **One workflow, many rails:** SWIFT, ACH, SEPA, RTGS, and tokenised cash reuse the same escrow and confirmation stages, reducing bespoke glue code (Part II Ch 4).
- **Compliance-aligned integrations:** Policy checks and audit evidence stay in the loop for every external system, preventing blind spots when volume scales (Part III Ch 16).

Select the integration surface you need to explore implementation details, diagrams, and deployment guidance.
