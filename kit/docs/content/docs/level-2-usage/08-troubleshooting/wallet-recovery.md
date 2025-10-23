---
title: Wallet Recovery Procedures
description: Restore access to ATK wallets after loss or compromise
---

<!-- SOURCE: doc-planing-archive/c-ATK_DOCUMENTATION_MASTER_PLAN.md -->
<!-- SOURCE: kit/contracts/contracts/onchainid/ -->

# Wallet Recovery Procedures

> **Status:** Draft skeleton — add detailed workflows for lost credentials and security incidents.

## Objective

Recover control of ATK wallets while protecting assets and maintaining compliance audit trails.

## Prerequisites

- [ ] Identity verification procedures for wallet owners
- [ ] Emergency contact list (custody, compliance, ops)
- [ ] Backup keys or recovery mechanisms documented

## Scenarios

- **Lost access (non-custodial)** — TODO: Steps for social recovery, delegated access, or contract-based recovery.
- **Compromised wallet** — TODO: Immediate actions (freeze, revoke approvals, rotate keys).
- **Custody key loss** — TODO: Engage custody provider procedures, escalate to governance.

## Procedure

1. **Validate request**
   - TODO: Verify identity, gather incident details, log ticket.
2. **Assess impact**
   - TODO: Identify assets at risk, pending transactions, compliance implications.
3. **Execute recovery**
   - TODO: Follow scenario-specific steps, including contract calls if required.
4. **Restore access**
   - TODO: Reissue credentials, update OnchainID claims, notify stakeholders.
5. **Post-incident review**
   - TODO: Document findings, update runbooks, implement preventive controls.

## Verification

- TODO: Checklist confirming recovered assets, updated access rights, and audit logs recorded.

## SLA

- Lost access: resolved within 1 business day.
- Compromised wallet: immediate response with containment <15 minutes.

## References

- `kit/contracts/contracts/onchainid/` — identity and claims integration.
- Security policies (link when available).

## Related Guides

- [`support-escalation.md`](./support-escalation.md)
- [`../02-administration/identity-kyc.md`](../02-administration/identity-kyc.md)
