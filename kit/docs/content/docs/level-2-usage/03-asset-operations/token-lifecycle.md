---
title: Token Lifecycle Operations
description: Manage minting, transfers, freezes, and maturity events for ATK assets
---

<!-- SOURCE: kit/contracts/contracts/assets/ -->
<!-- SOURCE: kit/dapp/src/components/asset-designer/ -->

# Token Lifecycle Operations

> **Status:** Draft skeleton — fill in detailed steps per lifecycle stage and asset type variations.

## Objective

Operate issued assets through day-to-day lifecycle events while maintaining compliance and auditability.

## Prerequisites

- [ ] Asset deployed and visible in console
- [ ] Appropriate roles assigned (ASSET_MANAGER, COMPLIANCE_OFFICER)
- [ ] Compliance modules active

## Lifecycle Procedures

### Mint Additional Supply

- TODO: Steps to initiate mint, approval requirements, transaction confirmation.
- TODO: Note compliance checks (SupplyCap, InvestorCount).

### Burn or Cancel Tokens

- TODO: Outline burn workflow, reconciliation steps, and reporting.

### Transfer Management

- TODO: Document restricted transfers, overrides, and manual approval involvement.

### Pause / Resume Asset

- TODO: Provide instructions for emergency pause, communication plan, and resumption verification.

### Maturity Handling

- TODO: Steps for fixed-term assets to reach maturity, investor notifications, settlement coordination.

## Verification

- TODO: Checklist for confirming lifecycle action success (events, dashboards, audit logs).

## SLA

- Routine lifecycle actions: complete within same business day.
- Emergency pause: enact within 5 minutes of decision.

## References

- `kit/contracts/contracts/assets/` — relevant functions by asset type.
- `../08-troubleshooting/compliance-failures.md` — upcoming guide for blocked transfers.

## Related Guides

- [`asset-designer-wizard.md`](./asset-designer-wizard.md)
- [`redemption-process.md`](./redemption-process.md)
