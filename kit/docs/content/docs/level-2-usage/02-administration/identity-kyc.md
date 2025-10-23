---
title: Identity & KYC Operations
description: Manage OnchainID enrollment, claim topics, and verification levels
---

<!-- SOURCE: kit/dapp/src/components/account/profile/profile-kyc-card.tsx -->
<!-- SOURCE: kit/contracts/contracts/onchainid/ -->
<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 7 — User & Developer Experience (UXDX) Speed Without Chaos.md -->

# Identity & KYC Operations

> **Status:** Draft skeleton — detail UI flows, claim requirements, and regional expectations.

## Objective

Onboard platform users with verified OnchainID profiles and maintain compliant claim records.

## Prerequisites

- [ ] COMPLIANCE_ADMIN or KYC_VALIDATOR role
- [ ] Trusted issuer registry configured (see [`trusted-issuers.md`](./trusted-issuers.md))
- [ ] Access to jurisdiction-specific document lists

## Procedure

1. **Initiate OnchainID registration**
   - TODO: UI path, required fields, wallet connection steps.
2. **Collect verification documents**
   - TODO: Document checklist by jurisdiction (ID, proof of address, corporate docs).
3. **Issue claims**
   - TODO: Map claim topics to trusted issuers and describe approval flow.
4. **Set verification level**
   - TODO: Outline level definitions (e.g., basic, enhanced) and risk thresholds.
5. **Monitor expiry and renewals**
   - TODO: Describe alerting, re-verification triggers, and audit trails.

## Verification

- TODO: Provide steps to confirm claim presence on-chain and in audit logs.
- TODO: Include sample API query retrieving the verification status.

## SLA

- KYC processing target: <24 hours for standard requests, escalations within 4 hours for high-risk.

## References

- `kit/contracts/contracts/onchainid/` — identity contract structures.
- `kit/dapp/src/components/account/profile/profile-kyc-card.tsx` — UI interactions.
- Level 1 compliance guides for jurisdictional context.

## Related Guides

- [`trusted-issuers.md`](./trusted-issuers.md)
- [`compliance-failures.md`](../08-troubleshooting/compliance-failures.md) (future content)
