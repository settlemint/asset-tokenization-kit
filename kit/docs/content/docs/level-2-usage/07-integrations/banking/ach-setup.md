---
title: ACH Integration
description: Configure ACH rails for fiat settlement and investor payouts
---

<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 16 — Integration Patterns (Banking, Custody, Venues).md -->

# ACH Integration

> **Status:** Draft skeleton — detail bank onboarding, file formats, and settlement windows.

## Objective

Enable ACH transfers for ATK deployments to handle fiat inflows/outflows and investor distributions in the US.

## Prerequisites

- [ ] Bank sponsor agreement and ACH IDs
- [ ] NACHA compliance checklist completed
- [ ] Reconciliation process defined

## Procedure

1. **Onboard with bank**
   - TODO: Provide required documentation, testing requirements, settlement limits.
2. **Configure payment processor**
   - TODO: API or file-based integration steps (CCD/PPD), security setup.
3. **Map settlement workflows**
   - TODO: Link ACH events to ATK asset operations (subscriptions, payouts).
4. **Handle returns and exceptions**
   - TODO: Processes for NOCs, returns, and disputes.
5. **Reconcile**
   - TODO: Daily reconciliation against bank statements and ATK ledger.

## Verification

- TODO: Checklist ensuring ACH batches processed, acknowledgements received, and balances matched.

## SLA

- Settlement timing: align with ACH windows (same-day vs. standard).
- Exception resolution: <2 business days.

## References

- `the-book-of-dalp/Part III — Operating the Platform/Chapter 16 — Integration Patterns (Banking, Custody, Venues).md`

## Related Guides

- [`core-banking.md`](./core-banking.md)
- [`../../06-operations/monitoring/alerts.md`](../../06-operations/monitoring/alerts.md)
