---
title: Bond Workflows
description: End-to-end operations for ATK bond instruments
---

<!-- SOURCE: kit/contracts/contracts/assets/bond/ -->
<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 18 — Data, Evidence, and Operational Truth (Going Deeper).md -->

# Bond Workflows

This section outlines how operators manage the full lifecycle of ATK bond instruments—from issuance and compliance setup to maturity execution and redemption closure. Each workflow provides step-by-step runbooks, code references, and operational SLAs to ensure regulated bond operations run smoothly and on schedule.


## Lifecycle Map

| Stage | Read First | Why it Matters | Key Sources |
|-------|------------|----------------|-------------|
| 1. Primary issuance | [`issuance.md`](./issuance.md) | Configure the asset in the wizard and deploy with compliant parameters. | `kit/dapp/src/components/asset-designer/asset-designer-wizard/asset-specific-details/bond.tsx`, `kit/dapp/src/orpc/routes/token/routes/mutations/create/token.create.ts`, `kit/contracts/contracts/assets/bond/ATKBondImplementation.sol` |
| 2. Pre-maturity control | [`maturity.md`](./maturity.md) | Prefund denomination assets, manage trading status, and execute `mature()` once coverage is confirmed. | `kit/dapp/src/orpc/routes/token/routes/mutations/mature/token.mature.ts`, `kit/dapp/src/orpc/routes/token/routes/stats/bond-status.ts` |
| 3. Redemption window | [`redemption.md`](./redemption.md) | Burn outstanding supply, release denomination assets, and reconcile investor records. | `kit/dapp/src/orpc/routes/token/routes/mutations/redeem/token.redeem.ts`, `kit/dapp/src/orpc/routes/token/routes/stats/total-supply.ts` |

Follow the documents in sequence: issuance establishes the instrument, maturity authorises redemption, and redemption closes positions. Each runbook calls out the exact ORPC routes, contract functions, and verification queries required at that stage.

## File Overview

- `issuance.md` — Step-by-step wizard walkthrough, compliance module selection, post-deployment verification, and SLA commitments for primary allocations.
- `maturity.md` — Governance prerequisites, coverage enforcement, pause/unpause procedures, and maturity transaction execution.
- `redemption.md` — Investor communications, self-service vs custodian-led redemptions, reconciliation tooling, and lifecycle closure.

Use the guides together with:

- Level 2 quickstart for environment provisioning (`../00-quickstart/first-token-10min.md`).
- Level 2 compliance modules reference (`../../04-compliance-config/compliance-modules.md`, once available) to confirm rule sets applied during issuance.
- Troubleshooting runbooks for transaction or compliance errors (`../../08-troubleshooting/transaction-issues.md` planned).

## Roadmap

- [x] `issuance.md` — Create bond tokens, configure terms, and distribute allocations.
- [x] `maturity.md` — Track approaching maturity, notify investors, and prepare settlement funds.
- [x] `redemption.md` — Execute redemption, reconcile payments, and close out positions.

## Delivery Notes

- Align terminology with bond market conventions (coupon, face value, ISIN).
- Reference contract functions in `kit/contracts/contracts/assets/bond/` for verification steps.
- Highlight the enforcement of denomination asset coverage prior to maturity and redemption.
- Use SLA expectations for maturity execution and redemption exception handling to drive operational readiness.
