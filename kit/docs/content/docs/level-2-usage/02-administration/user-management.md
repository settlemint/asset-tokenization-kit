---
title: User & Role Management
description: Govern ATK access with 19 built-in roles and custom role extensions
---

<!-- SOURCE: kit/dapp/src/lib/db/schemas/access-control.ts -->
<!-- SOURCE: doc-planing-archive/c-ATK_DOCUMENTATION_MASTER_PLAN.md -->

# User & Role Management

> **Status:** Draft skeleton — populate role descriptions, UI paths, and API hooks.

## Objective

Administer ATK users and roles while enforcing maker-checker controls and audit requirements.

## Prerequisites

- [ ] Platform admin credentials
- [ ] Access to organisational identity provider (if federated login is enabled)

## Role Catalogue

- TODO: Table detailing each of the 19 predefined roles (source `access-control.ts`) with permissions and typical actors.
- TODO: Document process for custom role creation and approval.

## Procedure

1. **View current users and roles**
   - TODO: UI path and API references.
2. **Invite or create a user**
   - TODO: Steps for manual creation and invite workflows.
3. **Assign roles and permissions**
   - TODO: Maker-checker note, multi-role assignments, effective access preview.
4. **Deactivate or suspend users**
   - TODO: Steps, impact on pending approvals, audit logging.
5. **Periodic access review**
   - TODO: Export process, review cadence, sign-off.

## Verification

- TODO: Checklist to confirm role assignment and audit log entries.
- TODO: Include sample query or API call to validate permissions.

## SLA

- User onboarding: ≤1 business day.
- Role change: maker approval required within 4 hours.

## References

- `kit/dapp/src/lib/db/schemas/access-control.ts` — authoritative role definitions.
- `kit/dapp/src/orpc/procedures/` — future reference for API-based management.

## Related Guides

- [`identity-kyc.md`](./identity-kyc.md)
- [`audit-logging.md`](./audit-logging.md)
