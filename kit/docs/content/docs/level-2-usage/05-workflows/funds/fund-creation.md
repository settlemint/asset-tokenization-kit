---
title: Fund Creation Workflow
description: Configure and launch tokenized funds with subscription and redemption windows
---

<!-- SOURCE: kit/docs/content/docs/23-fund-workflows-user-stories.md -->
<!-- SOURCE: kit/contracts/contracts/assets/fund/ -->

# Fund Creation Workflow

> **Status:** Draft skeleton — add parameter tables, compliance checkpoints, and investor communications.

## Objective

Launch a tokenized fund on ATK, including class structure, subscription rules, and compliance controls.

## Prerequisites

- [ ] Fund governance documents approved
- [ ] Custody accounts linked for NAV assets
- [ ] Compliance modules configured for investor eligibility

## Procedure

1. **Define fund structure**
   - TODO: Share classes, lock periods, subscription/redemption windows.
2. **Configure fee model**
   - TODO: Management/performance fees, calculation frequency.
3. **Set NAV data sources**
   - TODO: Outline connection to pricing oracles, manual inputs, reconciliation.
4. **Deploy fund contracts**
   - TODO: Maker-checker approval, deployment steps, initial seeding.
5. **Open for subscriptions**
   - TODO: Investor onboarding, allocation process, communication.

## Verification

- TODO: Checklist confirming parameters align with term sheet, compliance modules active, reporting ready.

## SLA

- Fund launch timeline per project plan; document critical milestones (e.g., T-14, T-7, T).

## References

- `kit/contracts/contracts/assets/fund/` — fund mechanics.
- `kit/docs/content/docs/23-fund-workflows-user-stories.md` — scenario references.

## Related Guides

- [`nav-calculation.md`](./nav-calculation.md)
- [`../../07-integrations/enterprise/erp-integration.md`](../../07-integrations/enterprise/erp-integration.md)
