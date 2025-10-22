---
title: Proven Patterns
description: Reusable architectures, timelines, and integration playbooks de-risking ATK deployments
---

<!-- SOURCE: the-book-of-dalp/Part IV — Adoption & Execution/Chapter 21 — Reference Implementations (Copy These Into Your RFP).md -->
<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 16 — Integration Patterns (Banking, Custody, Venues).md -->

# Proven Patterns

**Executives and delivery leads can drop these blueprints directly into RFPs, design reviews, and project kick-offs. They capture the reference implementations that already work in production and the integration playbooks that keep bank IT happy.**

## Pattern Library (Fast Reference)

```mermaid
graph LR
    A[Capital Markets] --> B(Tokenized Bond \"Days to Launch\")
    A --> C(Exchange Settlement)
    D[Asset Management] --> E(Periodic NAV Windows)
    D --> F(Bulletin Board Liquidity)
    G[Corporate Equity] --> H(On-Chain Governance)
    G --> I(Freeze→Calculate→Pay→Burn Flow)
    J[Integration] --> K(DvP with Fiat Rails)
    J --> L(Omnibus Custody Attestation)
    J --> M(Ready-for-Exchange Adapter)
```

## Architectural Patterns

| Pattern | Where It Applies | Key Components | Proof Points |
|---------|-----------------|----------------|--------------|
| Tokenized bond spine | Capital markets issuance and servicing | Bond template, identity registry, Ready-for-Exchange adapter, ISO 20022 translator | Market-ready in days with ≥99% first-attempt settlement (Chapter 21) |
| Periodic NAV fund | Asset managers running creation/redemption windows | Fund template, NAV scheduler, rule library alerts, optional bulletin board | Automated lifecycle with alerts before limits breach (Chapter 21) |
| On-chain equity governance | Corporate issuers managing cap tables and votes | Equity template, record-date snapshots, freeze→calculate→pay→burn workflow | Zero-leak reconciliation and audit-grade voting tallies (Chapter 21) |

## Implementation Timelines

- **Tokenized bond:** deploy using stock modules, attach documentation, and go live within days (Chapter 21).
- **Private fund:** configure NAV windows and investor gates to automate subscription/redemption cycles (Chapter 21).
- **Equity governance:** digitize corporate actions immediately after template configuration (Chapter 21).

## Integration Playbooks

| Flow | Description | Why It Matters | Source |
|------|-------------|----------------|--------|
| DvP with fiat rails | Wait for bank confirmation before releasing token leg; automatic timeout and reversion | Keeps cash/token legs synchronized without manual reconciliation | Chapter 16 |
| Exchange settlement | Eligibility ticketing → venue match → compliance ticket → DvP → cap-table sync | Maintains regulatory guardrails while providing real-time settlement | Chapter 16 |
| Omnibus custody | Custodian attests sub-accounts & beneficial ownership; compliance retains veto | Ensures visibility into ultimate holders while enabling omnibus accounts | Chapter 16 |

## Best Practices Extracted from Reference Implementations

- **Use stock modules first.** Every blueprint in Chapter 21 ships without custom code—replicate that discipline to stay inside supported upgrade paths.
- **Keep compliance in the transfer path.** Whitelisting, eligibility tickets, and alerts run before state change; never move them to middleware.
- **Mirror events with ISO 20022.** It eliminates reconciliation work and gives finance teams the artefacts they already trust.
- **Automate servicing.** Whether coupons or buybacks, follow the freeze → calculate → pay → burn workflow to avoid leakage.
- **Instrument success.** Track first-attempt settlement, T+0 share, and alert efficacy against the KPI catalogue to prove control.

Reuse these patterns as templates for solution design documents, partner enablement kits, and delivery playbooks.

