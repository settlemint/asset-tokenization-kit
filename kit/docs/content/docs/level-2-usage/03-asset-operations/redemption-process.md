---
title: Redemption Process
description: Manage maturity, investor notification, and settlement for ATK assets
---

<!-- SOURCE: kit/contracts/contracts/assets/bond/ -->
<!-- SOURCE: kit/contracts/contracts/assets/deposit/ -->

# Redemption Process

> **Status:** Draft skeleton — include timeline templates, investor communications, and settlement guidance.

## Objective

Execute redemptions for fixed-term assets (bonds, deposits, structured products) while maintaining compliance and accurate records.

## Prerequisites

- [ ] Asset maturity schedule defined
- [ ] Redemption funds available and reconciled
- [ ] Investor contact list current

## Procedure

1. **Initiate redemption workflow**
   - TODO: Document trigger (automatic vs. manual) and system notifications.
2. **Notify investors**
   - TODO: Provide communication templates and distribution channels.
3. **Process payouts**
   - TODO: Outline payment execution steps, custody interactions, and fallback mechanisms.
4. **Update token supply**
   - TODO: Burn or lock tokens as required; record on-chain events.
5. **Close asset records**
   - TODO: Archive documentation, update reporting systems, and confirm audit logs.

## Verification

- TODO: Checklist verifying all holders redeemed, payments reconciled, and compliance rules satisfied.

## SLA

- Investor notification: ≥5 business days before maturity (adjust per product).
- Settlement completion: within agreed timeframe (e.g., T+1).

## References

- `kit/contracts/contracts/assets/bond/` and `deposit/` for redemption-specific logic.
- `../05-workflows/bonds/maturity.md` (future) for detailed scenario guidance.

## Related Guides

- [`token-lifecycle.md`](./token-lifecycle.md)
- [`yield-management.md`](./yield-management.md)
