---
title: Rollback Guide
description: Revert ATK platform or contract changes safely with audit traceability
---

<!-- SOURCE: kit/contracts/contracts/smart/upgradeability/ -->
<!-- SOURCE: kit/charts/atk/README.md -->

# Rollback Guide

> **Status:** Draft skeleton — add concrete rollback commands, decision tree, and verification steps.

## Objective

Rollback application, infrastructure, or smart contract updates when issues arise, minimising downtime and data loss.

## Prerequisites

- [ ] Change record documenting the update to be rolled back
- [ ] Backups or previous artefacts available
- [ ] Stakeholders notified (product, compliance, support)

## Decision Flow

- TODO: Include decision tree covering minor config rollback vs. full deployment rollback vs. contract downgrade.

## Procedure

1. **Assess impact**
   - TODO: Determine scope (dApp, API, contracts) and decide rollback level.
2. **Prepare environment**
   - TODO: Scale down traffic, freeze user actions if necessary.
3. **Execute rollback**
   - TODO: Provide commands (Helm rollback, git checkout, contract upgrade proxy).
4. **Verify**
   - TODO: Run health checks, functional tests, compliance validations.
5. **Resume operations**
   - TODO: Re-enable services, communicate resolution, log incident.

## Verification

- TODO: Checklist confirming version restored, monitoring green, and audit logs updated.

## SLA

- Critical rollback: initiate within 30 minutes of decision, complete as soon as technically feasible.

## References

- `kit/contracts/contracts/smart/upgradeability/` — upgrade/rollback mechanics for contracts.
- `kit/charts/atk/README.md` — Helm rollback guidance.

## Related Guides

- [`../maintenance/upgrades.md`](../maintenance/upgrades.md)
- [`../../08-troubleshooting/transaction-issues.md`](../../08-troubleshooting/transaction-issues.md)
