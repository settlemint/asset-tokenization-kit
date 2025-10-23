---
title: Bond Redemption Workflow
description: Execute bond redemptions, reconcile payments, and close lifecycle records
---

<!-- SOURCE: kit/docs/content/docs/21-bond-workflows-user-stories.md -->
<!-- SOURCE: kit/contracts/contracts/assets/bond/ -->

# Bond Redemption Workflow

> **Status:** Draft skeleton — detail payment channels, reconciliation, and regulatory filings.

## Objective

Carry out bond redemption events—scheduled or early—with full transparency and compliance.

## Prerequisites

- [ ] Redemption event approved by issuer governance
- [ ] Compliance modules adjusted for redemption window (if required)
- [ ] Custody/treasury instructions confirmed

## Procedure

1. **Initiate redemption event**
   - TODO: Describe UI/API to start redemption and configure amount.
2. **Coordinate cash settlement**
   - TODO: Outline treasury instructions, payment rails, and timelines.
3. **Process on-chain redemption**
   - TODO: Execute burns/transfers, monitor transaction confirmations.
4. **Handle exceptions**
   - TODO: Provide steps for failed payments, unresponsive investors, partial redemptions.
5. **Close out issuance**
   - TODO: Update reporting, share certificates, and compliance filings.

## Verification

- TODO: Checklist verifying total redeemed amount, investor acknowledgement, audit entries.

## SLA

- Redemption completion: within agreed window (document specifics).
- Exception resolution: within 2 business days.

## References

- `kit/contracts/contracts/assets/bond/` — redemption-related functions.
- `kit/docs/content/docs/21-bond-workflows-user-stories.md` — workflows and stories.

## Related Guides

- [`maturity.md`](./maturity.md)
- [`../../03-asset-operations/redemption-process.md`](../../03-asset-operations/redemption-process.md)
