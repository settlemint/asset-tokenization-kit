---
title: Deposit Certificate Workflow
description: Issue deposit certificates with collateral checks and maturity schedules
---

<!-- SOURCE: kit/docs/content/docs/25-deposit-workflows-user-stories.md -->
<!-- SOURCE: kit/contracts/contracts/assets/deposit/ -->

# Deposit Certificate Workflow

> **Status:** Draft skeleton — add collateral verification, issuance steps, and communication templates.

## Objective

Issue deposit-backed tokens representing fixed-term deposits or certificates with defined yields.

## Prerequisites

- [ ] Deposit product defined (term, rate, collateral)
- [ ] Compliance modules configured for investor eligibility
- [ ] Custody accounts ready for underlying assets

## Procedure

1. **Configure deposit parameters**
   - TODO: Term length, interest rate, early withdrawal penalties.
2. **Verify collateral**
   - TODO: Outline checks for deposit funding and custody confirmation.
3. **Issue certificates**
   - TODO: Steps to mint tokens, allocate to investors, and notify them.
4. **Record issuance**
   - TODO: Update treasury systems, audit logs, and reporting.

## Verification

- TODO: Checklist to ensure certificates reflect correct principal, compliance status, and investor acknowledgement.

## SLA

- Issuance fulfilment: <2 business days after deposit funding.

## References

- `kit/contracts/contracts/assets/deposit/` — deposit logic.
- `kit/docs/content/docs/25-deposit-workflows-user-stories.md` — scenarios.

## Related Guides

- [`yields.md`](./yields.md)
- [`../../03-asset-operations/redemption-process.md`](../../03-asset-operations/redemption-process.md)
