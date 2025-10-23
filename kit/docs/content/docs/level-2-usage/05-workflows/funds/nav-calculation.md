---
title: NAV Calculation Workflow
description: Calculate and publish net asset value for ATK funds
---

<!-- SOURCE: kit/contracts/contracts/assets/fund/ -->
<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 18 — Data, Evidence, and Operational Truth (Going Deeper).md -->

# NAV Calculation Workflow

> **Status:** Draft skeleton — provide calculation formulas, data sources, and validation steps.

## Objective

Compute and publish fund NAV on the defined schedule with full auditability.

## Prerequisites

- [ ] Pricing data sources connected
- [ ] Accounting approvals for valuation methodology
- [ ] Compliance modules confirm valuation policy

## Procedure

1. **Collect valuation inputs**
   - TODO: List data feeds, manual inputs, timestamps.
2. **Run NAV calculation**
   - TODO: Provide formulas or references to calculation scripts.
3. **Review variance reports**
   - TODO: Compare with previous NAV, tolerance thresholds.
4. **Publish NAV**
   - TODO: Update ATK dashboard, notify investors, sync with reporting systems.
5. **Archive records**
   - TODO: Store calculation worksheets, approvals, and audit evidence.

## Verification

- TODO: Checklist verifying NAV accuracy, logs, and distribution to stakeholders.

## SLA

- Publication schedule: specify (e.g., daily at 18:00 local).
- Variance investigation: initiated within 2 hours if outside tolerance.

## References

- `kit/contracts/contracts/assets/fund/` — functions referencing NAV updates.
- `the-book-of-dalp/Part III — Operating the Platform/Chapter 18 — Data, Evidence, and Operational Truth (Going Deeper).md` — NAV evidence guidance.

## Related Guides

- [`fund-creation.md`](./fund-creation.md)
- [`fee-collection.md`](./fee-collection.md)
