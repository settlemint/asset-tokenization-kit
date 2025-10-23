---
title: Peg Stability Operations
description: Detect and respond to price deviations for ATK stablecoins
---

<!-- SOURCE: kit/docs/content/docs/24-stablecoin-workflows-user-stories.md -->
<!-- SOURCE: kit/contracts/contracts/assets/stablecoin/ -->

# Peg Stability Operations

> **Status:** Draft skeleton — detail monitoring rules, intervention tactics, and communication protocols.

## Objective

Maintain stablecoin price parity through monitoring, intervention, and stakeholder coordination.

## Prerequisites

- [ ] Price oracles configured and validated
- [ ] Intervention playbooks approved (mint, burn, market operations)
- [ ] Communication plan for market updates

## Procedure

1. **Monitor price feeds**
   - TODO: Define data sources (DEX, CEX, OTC), tolerance bands.
2. **Detect deviation**
   - TODO: Document alert thresholds and automated triggers.
3. **Execute stabilization action**
   - TODO: Provide steps for mint/burn, liquidity injections, or collateral adjustments.
4. **Communicate status**
   - TODO: Outline messaging to partners, regulators, and investors.
5. **Post-incident review**
   - TODO: Capture metrics, root cause analysis, and improvements.

## Verification

- TODO: Checklist ensuring peg restored, audit logs updated, reports delivered.

## SLA

- Initial response: initiate within 10 minutes of deviation alert.
- Full resolution: target within agreed window (e.g., 2 hours) unless market conditions persist.

## References

- `kit/contracts/contracts/assets/stablecoin/` — peg-related functions.
- `kit/docs/content/docs/24-stablecoin-workflows-user-stories.md` — scenario references.

## Related Guides

- [`collateral.md`](./collateral.md)
- [`../../06-operations/monitoring/alerts.md`](../../06-operations/monitoring/alerts.md)
