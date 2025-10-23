---
title: Audit Logging
description: Capture, export, and retain ATK audit trails for regulatory review
---

<!-- SOURCE: kit/dapp/src/lib/db/schemas/audit.ts -->
<!-- SOURCE: ASSET_TOKENIZATION_LANGUAGE_GUIDE.md -->

# Audit Logging

> **Status:** Draft skeleton — add specific log types, export commands, and retention policies.

## Objective

Operate ATK audit trails to satisfy regulatory obligations and streamline investigations.

## Prerequisites

- [ ] AUDITOR or COMPLIANCE_ADMIN role
- [ ] Access to secure storage for exports

## Audit Scope

- TODO: Enumerate activity types captured (`audit.ts`) such as user actions, compliance changes, contract deployments.
- TODO: Note correlation with on-chain events and external systems.

## Procedure

1. **Review audit dashboard**
   - TODO: UI path, filtering options, and permissions.
2. **Run targeted queries**
   - TODO: Example filters or API calls for common investigations.
3. **Export audit reports**
   - TODO: Steps to export CSV/JSON, secure transfer guidance.
4. **Schedule recurring exports**
   - TODO: Automation hooks, storage locations, and verification.
5. **Retention & purging**
   - TODO: Define retention policy, archival process, and deletion approvals.

## Verification

- TODO: Checklist confirming export integrity (hash, row counts).
- TODO: Document reconciliation with compliance rules or incidents.

## SLA

- Ad-hoc request fulfilment: within 1 business day.
- Scheduled export processing: within 2 hours of scheduled time.

## References

- `kit/dapp/src/lib/db/schemas/audit.ts` — schema and enumerations.
- `../08-troubleshooting/support-escalation.md` — escalation path when audit anomalies detected (future link).

## Related Guides

- [`platform-settings.md`](./platform-settings.md)
- [`compliance-failures.md`](../08-troubleshooting/compliance-failures.md)
