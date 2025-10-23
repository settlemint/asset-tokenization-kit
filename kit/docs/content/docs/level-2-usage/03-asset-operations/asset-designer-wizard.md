---
title: Asset Designer Wizard
description: Execute the six-step wizard to configure and deploy ATK assets
---

<!-- SOURCE: kit/dapp/src/components/asset-designer/ -->
<!-- SOURCE: kit/contracts/contracts/assets/ -->

# Asset Designer Wizard

> **Status:** Draft skeleton — replace TODO entries with detailed UI instructions and screenshots.

## Objective

Complete the six-step wizard to launch compliant assets without writing code.

## Prerequisites

- [ ] ASSET_MANAGER role (or equivalent)
- [ ] Compliance configuration template selected (if required)
- [ ] OnchainID claims for issuer verified

## Procedure

### Step 1: Select Asset Type

- TODO: Document options (bond, equity, fund, stablecoin, deposit) and selection criteria.
- TODO: Insert screenshots for each selection.

### Step 2: Configure Token Details

- TODO: Describe fields (name, symbol, decimals, token standard, supply).
- TODO: Include validation notes and sample values.

### Step 3: Set Compliance Rules

- TODO: Outline module selection UI, rule configuration, and eligibility previews.
- TODO: Link to compliance guides for deeper configuration.

### Step 4: Define Distribution

- TODO: Provide instructions for initial allocations, vesting schedules, and lockups.
- TODO: Mention support for bulk uploads if available.

### Step 5: Review Configuration

- TODO: Checklist of review screen items (parameters, costs, gas estimate).
- TODO: Note editing capabilities prior to deployment.

### Step 6: Deploy Token

- TODO: Describe transaction confirmation, progress indicators, and success messaging.
- TODO: Capture post-deployment actions (contract verification, event logs).

## Verification

- TODO: Add steps to confirm asset appears in dashboard, compliance modules active, and audit log recorded.

## SLA

- Standard issuance: ≤30 minutes including approvals.
- If deployment fails, escalate to `../08-troubleshooting/transaction-issues.md`.

## References

- `kit/dapp/src/components/asset-designer/` — UI implementation.
- `kit/contracts/contracts/assets/` — smart contract templates.

## Related Guides

- [`token-lifecycle.md`](./token-lifecycle.md)
- [`compliance-modules.md`](../04-compliance-config/compliance-modules.md)
