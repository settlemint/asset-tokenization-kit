---
title: Asset Operations
description: Day-to-day procedures for designing, launching, and servicing ATK assets
---

<!-- SOURCE: kit/dapp/src/components/asset-designer/ -->
<!-- SOURCE: kit/contracts/contracts/assets/ -->
<!-- SOURCE: doc-planing-archive/b-cursor-mixed-a-c.md-final -->
<!-- SOURCE: doc-planing-archive/c-ATK_DOCUMENTATION_MASTER_PLAN.md -->

# Asset Operations

**Operators use these guides to configure new assets, manage lifecycles, execute corporate actions, and distribute value without touching code.**

## Roadmap

- [ ] `asset-designer-wizard.md` — Six-step walkthrough of the Asset Designer with UI cues and validation prompts.
- [ ] `token-lifecycle.md` — Procedures for minting, burning, transfers, pauses, and maturity handling.
- [ ] `corporate-actions.md` — Dividend, voting, splits, and buyback operations from the console.
- [ ] `yield-management.md` — Interest scheduling, distribution windows, and reconciliation.
- [ ] `redemption-process.md` — Redemption approvals, settlement proof, and investor notifications.

## Inputs to Capture

- UI flows from `kit/dapp/src/components/asset-designer/` and supporting hooks.
- Asset contract behaviours from `kit/contracts/contracts/assets/`.
- Lifecycle insights from existing workflow stories in `kit/docs/content/docs/21-25-*`.

## Delivery Notes

- Document prerequisites (roles, compliance modules) at the top of each runbook.
- Include verification steps leveraging on-chain events and audit logs.
- Note how custom asset templates (see `05-asset-classes/custom-assets.md`) extend these operations.
