---
title: Fund Fee Collection
description: Process management and performance fees for ATK funds
---

<!-- SOURCE: kit/contracts/contracts/assets/fund/ -->
<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 18 — Data, Evidence, and Operational Truth (Going Deeper).md -->

# Fund Fee Collection

> **Status:** Draft skeleton — add fee schedules, calculation examples, and accounting integration steps.

## Objective

Collect management and performance fees while keeping investor records reconciled.

## Prerequisites

- [ ] Fee model configured during fund setup
- [ ] NAV calculations up to date
- [ ] Treasury accounts ready to receive fees

## Procedure

1. **Review fee schedule**
   - TODO: Confirm percentage, calculation period, applicable share classes.
2. **Calculate fee**
   - TODO: Provide calculation formula, references to NAV data.
3. **Approve fee charge**
   - TODO: Maker-checker validation, compliance review if required.
4. **Execute transfer**
   - TODO: Trigger fee transfer, note custody interactions.
5. **Record accounting entries**
   - TODO: Update ERP, investor statements, and audit logs.

## Verification

- TODO: Checklist ensuring fee amount matches policy, investors notified, and ledger balanced.

## SLA

- Management fee collection: within 2 business days after period close.
- Performance fee review: within 5 business days pending audit approval.

## References

- `kit/contracts/contracts/assets/fund/` — fee-related functions.
- `the-book-of-dalp/Part III — Operating the Platform/Chapter 18 — Data, Evidence, and Operational Truth (Going Deeper).md` — fee reporting context.

## Related Guides

- [`nav-calculation.md`](./nav-calculation.md)
- [`../../07-integrations/enterprise/erp-integration.md`](../../07-integrations/enterprise/erp-integration.md)
