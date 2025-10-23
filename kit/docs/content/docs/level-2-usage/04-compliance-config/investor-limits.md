---
title: Investor Limits
description: Configure holder and exposure limits with automated monitoring
---

<!-- SOURCE: kit/contracts/contracts/smart/compliance-modules/MaxBalanceModule.sol -->
<!-- SOURCE: kit/dapp/src/components/compliance/ -->

# Investor Limits

> **Status:** Draft skeleton — detail limit scenarios, monitoring dashboards, and escalation steps.

## Objective

Set and enforce investor-level limits (holder counts, exposure caps) that satisfy regulatory thresholds and fund mandates.

## Prerequisites

- [ ] InvestorCount / MaxBalance module enabled
- [ ] Policy defining thresholds per asset type
- [ ] Test accounts representing edge cases

## Procedure

1. **Define limit parameters**
   - TODO: Document inputs (max holders, max balance per investor, classes).
2. **Configure exemptions**
   - TODO: Explain how to flag exempt investors (e.g., market makers).
3. **Enable monitoring**
   - TODO: Describe dashboards or alerts for approaching limits.
4. **Deploy configuration**
   - TODO: Maker-checker approval workflow.
5. **Respond to breaches**
   - TODO: Outline steps when limits exceeded (auto-lock, manual intervention).

## Verification

- TODO: Provide tests to confirm enforcement and notification.
- TODO: Include SQL or API samples to monitor current usage.

## SLA

- Limit changes: <1 business day from policy approval.
- Breach response: immediate notification, resolution within 4 hours.

## References

- `MaxBalanceModule.sol` — implementation details.
- `kit/dapp/src/components/compliance/` — configuration UI.

## Related Guides

- [`compliance-modules.md`](./compliance-modules.md)
- [`transfer-approvals.md`](./transfer-approvals.md)
