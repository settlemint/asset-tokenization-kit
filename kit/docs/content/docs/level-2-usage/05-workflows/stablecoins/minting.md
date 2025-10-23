---
title: Stablecoin Minting Workflow
description: Authorise collateral and mint stablecoin supply on ATK
---

<!-- SOURCE: kit/docs/content/docs/24-stablecoin-workflows-user-stories.md -->
<!-- SOURCE: kit/contracts/contracts/assets/stablecoin/ -->

# Stablecoin Minting Workflow

> **Status:** Draft skeleton — include collateral checks, mint authorisation steps, and audit requirements.

## Objective

Mint stablecoin tokens backed by approved collateral while maintaining peg discipline and compliance.

## Prerequisites

- [ ] Collateral accounts funded and verified
- [ ] Minting policy approved (limits, roles, frequency)
- [ ] Compliance modules configured for eligible recipients

## Procedure

1. **Validate collateral**
   - TODO: Document valuation, custody confirmation, and risk checks.
2. **Request mint authorisation**
   - TODO: Maker-checker flow, required documentation, thresholds.
3. **Execute mint transaction**
   - TODO: UI/API steps, monitoring for transaction success.
4. **Distribute minted tokens**
   - TODO: Allocation to treasury, market makers, or distribution accounts.
5. **Update records**
   - TODO: Reflect supply changes in dashboards, notify stakeholders, log audit trail.

## Verification

- TODO: Checklist verifying collateral ratio, transaction hash, compliance approvals.

## SLA

- Mint request turnaround: within 4 hours for standard requests.
- Emergency mint (peg defence): <30 minutes with executive approval.

## References

- `kit/contracts/contracts/assets/stablecoin/` — minting logic.
- `kit/docs/content/docs/24-stablecoin-workflows-user-stories.md` — scenario references.

## Related Guides

- [`collateral.md`](./collateral.md)
- [`../../07-integrations/custody/digital-custody.md`](../../07-integrations/custody/digital-custody.md)
