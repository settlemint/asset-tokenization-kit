---
title: Administration & Identity
description: Govern roles, identities, trusted issuers, and audit evidence across ATK
---

<!-- SOURCE: kit/dapp/src/lib/db/schemas/access-control.ts -->
<!-- SOURCE: kit/dapp/src/components/account/ -->
<!-- SOURCE: kit/contracts/contracts/onchainid/ -->
<!-- SOURCE: kit/dapp/src/lib/db/schemas/audit.ts -->
<!-- SOURCE: doc-planing-archive/c-ATK_DOCUMENTATION_MASTER_PLAN.md -->

# Administration & Identity

**These runbooks keep ATK controlled—documenting how administrators assign roles, onboard identities, manage trusted issuers, and export audit trails.**

## Roadmap

- [ ] `user-management.md` — Role catalogue for 19 built-in roles, custom roles, and maker-checker patterns.
- [ ] `identity-kyc.md` — OnchainID registration, claim topics, and verification level handling.
- [ ] `trusted-issuers.md` — Governance of the trusted issuer registry and multi-jurisdiction controls.
- [ ] `platform-settings.md` — Platform-level configuration panels and safety toggles.
- [ ] `audit-logging.md` — Querying, exporting, and retaining audit logs for regulatory review.

## Inputs to Capture

- Role definitions and permissions from `kit/dapp/src/lib/db/schemas/access-control.ts`.
- Account and identity flows from `kit/dapp/src/components/account/`.
- Claim factories and registry logic from `kit/contracts/contracts/onchainid/`.
- Audit schema and retention hooks from `kit/dapp/src/lib/db/schemas/audit.ts`.

## Delivery Notes

- Emphasise actor-based storytelling (issuer, compliance officer, custodian) as raised in stakeholder feedback.
- Surface trusted issuer and claim concepts prominently to reduce confusion highlighted in planning discussions.
- Include example SLAs for common administrative actions (e.g., identity approval within one business day).
