---
title: DEX Listing Workflow
description: List ATK assets on decentralized exchanges and manage liquidity pools
---

<!-- SOURCE: WINNER-PLAN-FINAL.MD -->
<!-- SOURCE: kit/contracts/contracts/assets/ -->

# DEX Listing Workflow

> **Status:** Draft skeleton — articulate pool deployment steps, compliance checks, and monitoring.

## Objective

Deploy ATK assets to decentralized exchanges (e.g., Uniswap, Balancer) while maintaining compliance controls and liquidity health.

## Prerequisites

- [ ] Compliance review approving venue usage
- [ ] Liquidity budget approved by treasury
- [ ] Deployment wallet with required permissions

## Procedure

1. **Select target DEX**
   - TODO: Criteria (chain, liquidity, compliance requirements).
2. **Deploy liquidity pool**
   - TODO: Contract interactions, pool parameters (fee tier, weights).
3. **Seed liquidity**
   - TODO: Provide mint/add-liquidity steps, initial allocation sizes.
4. **Announce listing**
   - TODO: Communication checklist, update dashboards, notify partners.
5. **Monitor pool**
   - TODO: Track volume, slippage, price deviations; link to monitoring metrics.

## Verification

- TODO: Checklist verifying pool address, liquidity metrics, and compliance approvals.

## SLA

- Pool deployment timeline: coordinate within 1 business day after approvals.
- Liquidity monitoring: daily review, alerts for low liquidity thresholds.

## References

- Smart contracts for targeted DEX (document when specific).
- `kit/contracts/contracts/assets/` — token standard compatibility.

## Related Guides

- [`liquidity-pools.md`](./liquidity-pools.md)
- [`../../05-workflows/stablecoins/pegging.md`](../../05-workflows/stablecoins/pegging.md)
