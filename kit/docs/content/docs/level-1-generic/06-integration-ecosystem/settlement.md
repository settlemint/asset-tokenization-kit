---
title: Settlement & Clearing
description: Atomic XvP workflows, liquidity management, and reconciliation evidence for T+0 operations
---

<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 4 — Settlement & Interoperability, T+0 Is the Baseline.md -->
<!-- SOURCE: the-book-of-dalp/Part I — The Why/Chapter 5 — Custody and Settlement Clarity (Bank-Grade Control & Atomic DvP).md -->
<!-- SOURCE: the-book-of-dalp/Part IV — Adoption & Execution/Chapter 22 — Metrics & OKRs, Evidence You’re Winning (or Not).md -->

# Settlement & Clearing

**Settlement risk is optional—we remove it.** Cross-asset escrow, ISO 20022 payment builders, and liquidity management turn T+0 into the default while keeping both legs reversible when rails fail.

- **Atomic everywhere:** Digital security–and fiat-linked trades follow the same initiated → reserved → executed → reversed state machine (Part I Ch 5).
- **Netting and collateral:** Liquidity management nets flows and enforces limits before settlement releases, keeping treasury exposure predictable (Part I Ch 5).
- **Roadmap clarity:** Same-network atomicity ships today; cross-network bridges stay on the roadmap with compliance continuity requirements defined (Part II Ch 4).

```mermaid
flowchart LR
    Match[Matched order] --> Escrow[XvP escrow]
    Escrow -->|cash leg| Payment[ISO 20022 payment instruction]
    Payment --> BankConfirm[pacs.002 / bank ack]
    Escrow -->|token leg| TokenRelease[Token release]
    BankConfirm --> TokenRelease
    TokenRelease --> Finality[T+0 finality]
    Escrow -->|timeout| Revert[Automatic revert]
```

Institutions receive audit-ready evidence with ≥99 % first-attempt settlement once connectors are live, no manual reconciliation queues, and a compliance plane that stays in control even as integrations multiply (Part IV Ch 22).
