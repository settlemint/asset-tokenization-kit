---
title: Deposit Yield Workflow
description: Calculate and distribute yield for deposit certificates
---

<!-- SOURCE: kit/docs/content/docs/25-deposit-workflows-user-stories.md -->
<!-- SOURCE: kit/contracts/contracts/assets/deposit/ -->

# Deposit Yield Workflow

> **Status:** Draft skeleton — supply calculation methods, payout schedules, and reconciliation steps.

## Objective

Manage periodic yield accrual and payouts for deposit certificates, including early withdrawal handling.

## Prerequisites

- [ ] Deposit products active with investor balances
- [ ] Treasury funds earmarked for upcoming payouts
- [ ] Compliance checks for distribution recipients

## Procedure

1. **Calculate accrued yield**
   - TODO: Provide formula based on principal, rate, day count convention.
2. **Approve payout schedule**
   - TODO: Maker-checker workflow, notification plan.
3. **Execute payment**
   - TODO: Trigger distribution, handle partial payouts if necessary.
4. **Process early withdrawal**
   - TODO: Outline penalty calculation, approval steps, settlement.
5. **Update records**
   - TODO: Record accrual, adjust outstanding balance, update reporting systems.

## Verification

- TODO: Checklist ensuring payouts match accrual, investors notified, and audit log updated.

## SLA

- Regular payout execution: on scheduled date/time.
- Early withdrawal processing: within 2 business days of request.

## References

- `kit/contracts/contracts/assets/deposit/` — yield logic.
- `kit/docs/content/docs/25-deposit-workflows-user-stories.md` — workflow stories.

## Related Guides

- [`certificate.md`](./certificate.md)
- [`../../03-asset-operations/yield-management.md`](../../03-asset-operations/yield-management.md)
