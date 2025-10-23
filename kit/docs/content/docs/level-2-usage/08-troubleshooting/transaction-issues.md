---
title: Transaction Troubleshooting
description: Diagnose failed on-chain transactions and restore normal operations
---

<!-- SOURCE: kit/contracts/contracts/ -->
<!-- SOURCE: kit/dapp/src/lib/ -->

# Transaction Troubleshooting

> **Status:** Draft skeleton — fill in detailed investigation steps, tooling, and remediation.

## Objective

Identify the root cause of failed or stuck transactions and implement corrective actions across ATK.

## Prerequisites

- [ ] Access to block explorer and node logs
- [ ] Knowledge of relevant contract addresses and ABI
- [ ] Monitoring alerts attached to transaction pipelines

## Procedure

1. **Collect error context**
   - TODO: Capture transaction hash, error message, user impact.
2. **Inspect failure**
   - TODO: Use block explorer or `cast/viem` to decode revert reason.
3. **Check gas parameters**
   - TODO: Review gas price/limit, network congestion, fee policies.
4. **Validate state**
   - TODO: Confirm balances, approvals, compliance module status.
5. **Apply fix**
   - TODO: Provide options (retry with adjusted gas, sequence nonce reset, manual override).
6. **Document outcome**
   - TODO: Update incident tracker, notify stakeholders, log in knowledge base.

## Verification

- TODO: Ensure successful transaction confirmed, no residual pending operations, and monitoring cleared.

## SLA

- Standard transaction issue: resolution within 2 hours.
- Critical (blocking issuance/redemption): escalate immediately; target <30 minutes.

## Tools & Commands

- TODO: Include sample CLI commands (`cast tx`, `viem debug`, `bun run scripts`) and log locations.

## References

- Contract repositories under `kit/contracts/contracts/`.
- Future automation scripts (link once created).

## Related Guides

- [`common-errors.md`](./common-errors.md)
- [`compliance-failures.md`](./compliance-failures.md)
