---
title: Bond Maturity Workflow
description: Manage approaching maturity, investor notifications, and settlement for bonds
---

<!-- SOURCE: kit/docs/content/docs/21-bond-workflows-user-stories.md -->
<!-- SOURCE: kit/contracts/contracts/assets/bond/ -->

# Bond Maturity Workflow

> **Status:** Draft skeleton — add timeline charts, notification templates, and reconciliation steps.

## Objective

Coordinate bond maturity from D-30 notifications through final settlement and reporting.

## Prerequisites

- [ ] Maturity schedule loaded into operations calendar
- [ ] Treasury funds confirmed for principal repayment
- [ ] Investor contact list verified

## Procedure

1. **Pre-maturity checks (D-30 / D-10)**
   - TODO: Verify outstanding coupons, compliance status, and investor records.
2. **Notify investors**
   - TODO: Communication plan (email, portal notifications), include required disclosures.
3. **Lock transfers (if applicable)**
   - TODO: Pause secondary trading near maturity to prevent settlement issues.
4. **Execute redemption**
   - TODO: Process principal payments, update token supply, confirm blockchain events.
5. **Finalize records**
   - TODO: Provide statements, update audit logs, archive documentation.

## Verification

- TODO: Checklist ensuring all holders redeemed, payments reconciled, cap tables updated.

## SLA

- Investor notification: at least 30 days before maturity (adjust per jurisdiction).
- Settlement completion: within T+1 of maturity date.

## References

- `kit/contracts/contracts/assets/bond/` — functions supporting maturity handling.
- `kit/docs/content/docs/21-bond-workflows-user-stories.md` — scenario narratives.

## Related Guides

- [`redemption.md`](./redemption.md)
- [`../../03-asset-operations/redemption-process.md`](../../03-asset-operations/redemption-process.md)
