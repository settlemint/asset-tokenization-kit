---
title: Digital Custody Integration
description: Connect ATK with institutional custody providers for asset safeguarding
---

<!-- SOURCE: doc-planing-archive/c-ATK_DOCUMENTATION_MASTER_PLAN.md -->

# Digital Custody Integration

> **Status:** Draft skeleton — describe provider onboarding, API configuration, and reconciliation processes.

## Objective

Integrate ATK assets with custody platforms to secure private keys, manage approvals, and provide transparency to stakeholders.

## Prerequisites

- [ ] Custody provider contract and API credentials
- [ ] Security review completed (MPC/HSM, access controls)
- [ ] Operational playbook agreed with custodian

## Procedure

1. **Onboard provider**
   - TODO: Provide due diligence checklist, API access steps.
2. **Configure asset support**
   - TODO: Register ATK contracts, set token metadata, address whitelists.
3. **Set approval policies**
   - TODO: Define multi-sig/MPC approval rules, thresholds, participants.
4. **Reconcile holdings**
   - TODO: Map custody balances to ATK ledger, schedule reconciliations.
5. **Monitor activity**
   - TODO: Alerts for transactions, key ceremonies, and anomalies.

## Verification

- TODO: Checklist ensuring assets appear in custody dashboard, approvals enforce policy, and reconciliation matches.

## SLA

- Custody transaction approvals: within defined window (e.g., <2 hours).

## References

- Provider-specific documentation (link once selected).
- Security policy (link when published).

## Related Guides

- [`multi-sig.md`](./multi-sig.md)
- [`../../03-asset-operations/token-lifecycle.md`](../../03-asset-operations/token-lifecycle.md)
