---
title: Platform Settings
description: Configure global ATK settings, feature toggles, and maker-checker options
---

<!-- SOURCE: kit/dapp/src/components/ -->
<!-- SOURCE: doc-planing-archive/c-ATK_DOCUMENTATION_MASTER_PLAN.md -->

# Platform Settings

> **Status:** Draft skeleton — identify configuration panels, API endpoints, and audit trails.

## Objective

Adjust platform-wide settings—feature flags, notification policies, and operational guardrails—without redeploying the system.

## Prerequisites

- [ ] PLATFORM_ADMIN or SUPER_ADMIN role
- [ ] Approved change request (if required by governance)

## Procedure

1. **Access settings console**
   - TODO: Document navigation path and access control checks.
2. **Update general configuration**
   - TODO: List configurable fields (branding, contact info, time zones).
3. **Manage feature toggles**
   - TODO: Detail toggle list, risk impact, and verification steps.
4. **Configure notifications**
   - TODO: Email/SMS/webhook options; integrate with monitoring.
5. **Apply and review changes**
   - TODO: Maker-checker workflow, approval screen, rollback path.

## Verification

- TODO: Checklist ensuring changes persisted (API query, UI refresh).
- TODO: Confirm audit log entry recorded (link to `audit-logging.md`).

## SLA

- Standard configuration change: <2 hours including approval.
- Emergency toggle: <15 minutes with post-change review within 24 hours.

## References

- Locate relevant components in `kit/dapp/src/components/` once exact files identified.
- Link to change management policy (add once documented).

## Related Guides

- [`configuration.md`](../01-installation/configuration.md)
- [`audit-logging.md`](./audit-logging.md)
