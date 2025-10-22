---
title: Trading Venues
description: Exchange adapters, eligibility tickets, and DvP orchestration for primary and secondary markets
---

<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 16 — Integration Patterns (Banking, Custody, Venues).md -->
<!-- SOURCE: the-book-of-dalp/Part V - Appendices/Appendix H — Integration Playbooks.md -->

# Trading Venues

**Ready-for-exchange adapters give venues eligibility tickets, deterministic settlement, and instant cap-table synchronisation.** Matching engines request a time-bound eligibility ticket, execute fills, and hand settlement back to ATK so compliance, custody, and DvP stay unified.

- **Eligibility first:** `/exchange/eligibility` issues time-to-live tickets; trades without tickets never match (Appendix H).
- **DvP on every fill:** Settlement runs escrow, confirmation, and cap-table update in one workflow (Part III Ch 16).
- **P2P without shortcuts:** Optional bulletin boards reuse the same pre-transfer compliance gates for OTC or bilateral liquidity (Part III Ch 16).

```mermaid
flowchart LR
    Venue[ATS / P2P venue] -->|request| Ticket[/exchange/eligibility]
    Ticket --> Match[Venue match]
    Match --> Settle[/exchange/settlement]
    Settle --> DvP[Atomic DvP]
    DvP --> CapTable[Cap-table sync]
```
