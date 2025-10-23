---
title: Trusted Issuer Management
description: Administer claim issuers, topics, and jurisdictional policies in ATK
---

<!-- SOURCE: kit/contracts/contracts/onchainid/factory/ -->
<!-- SOURCE: kit/contracts/contracts/onchainid/ -->
<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 7 — User & Developer Experience (UXDX) Speed Without Chaos.md -->

# Trusted Issuer Management

> **Status:** Draft skeleton — document governance workflows, UI paths, and contract calls.

## Objective

Control which identities can issue claims for specific topics, ensuring compliance teams trust every assertion recorded in OnchainID.

## Prerequisites

- [ ] COMPLIANCE_ADMIN role
- [ ] Documented claim taxonomy (`topics` and definitions)
- [ ] Jurisdictional mapping for issuers

## Procedure

1. **Review existing issuers and topics**
   - TODO: UI path or CLI command to list current configuration.
2. **Add a trusted issuer**
   - TODO: Steps using UI or factory contract functions; include maker-checker requirement.
3. **Assign topics to issuer**
   - TODO: Document multi-topic assignments and revocation workflow.
4. **Revoke or suspend issuer**
   - TODO: Impact analysis and communication checklist.
5. **Audit issuer activity**
   - TODO: How to query claim issuance history and detect anomalies.

## Verification

- TODO: Checklist confirming issuer appears in registry and claims validate against new permissions.
- TODO: Include event log references for issuer additions/removals.

## SLA

- Issuer onboarding: ≤3 business days with due diligence.
- Emergency revocation: <1 hour from detection to enforcement.

## Governance Notes

- TODO: Link to policy documents outlining issuer qualification criteria.
- TODO: Document multi-jurisdiction considerations highlighted during stakeholder reviews.

## References

- `kit/contracts/contracts/onchainid/factory/` — factory contracts for issuer management.
- `kit/contracts/contracts/onchainid/` — core identity registry.

## Related Guides

- [`identity-kyc.md`](./identity-kyc.md)
- [`compliance-modules.md`](../04-compliance-config/compliance-modules.md)
