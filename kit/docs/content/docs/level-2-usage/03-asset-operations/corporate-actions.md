---
title: Corporate Actions
description: Execute dividends, voting, splits, and other corporate events in ATK
---

<!-- SOURCE: kit/contracts/contracts/assets/equity/ -->
<!-- SOURCE: kit/contracts/contracts/assets/bond/ -->

# Corporate Actions

> **Status:** Draft skeleton — supply detailed event workflows, approvals, and notifications.

## Objective

Manage corporate events for ATK assets with full auditability and stakeholder communication.

## Prerequisites

- [ ] Asset-specific roles (e.g., CORPORATE_ACTIONS_MANAGER)
- [ ] Governance approvals captured outside ATK (board minutes, resolutions)
- [ ] Compliance modules configured for applicable restrictions

## Procedures

### Dividends / Coupon Payments

- TODO: Outline scheduling, funding, payout execution, and reconciliation.

### Shareholder or Bondholder Voting

- TODO: Set up voting event, configure quorum, monitor participation, certify results.

### Stock Splits / Reverse Splits

- TODO: Document ratio changes, supply adjustments, and investor communication.

### Buybacks / Redemption Offers

- TODO: Provide workflow for tender offers, acceptance windows, settlement.

### Emergency Actions

- TODO: Describe forced transfers, default handling, or covenant breaches.

## Verification

- TODO: Checklist for confirming corporate action completion (balances, events, audit trails).
- TODO: Include reporting exports for regulators or trustees.

## SLA

- Routine distributions: execute on scheduled date/time.
- Emergency actions: initiate within governance-defined timeframe (e.g., <1 hour).

## References

- `kit/contracts/contracts/assets/equity/` and `bond/` for governance hooks.
- Asset workflow guides under `../05-workflows/`.

## Related Guides

- [`yield-management.md`](./yield-management.md)
- [`token-lifecycle.md`](./token-lifecycle.md)
