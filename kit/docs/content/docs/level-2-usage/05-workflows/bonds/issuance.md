---
title: Bond Issuance Workflow
description: Launch regulated bond tokens from term definition to distribution
---

<!-- SOURCE: kit/docs/content/docs/21-bond-workflows-user-stories.md -->
<!-- SOURCE: kit/contracts/contracts/assets/bond/ -->

# Bond Issuance Workflow

> **Status:** Draft skeleton — insert specific steps, screenshots, and regulatory checklists.

## Objective

Issue a bond instrument on ATK with defined terms, investor eligibility, and compliance controls.

## Prerequisites

- [ ] Bond template configured in Asset Designer
- [ ] Offering memorandum / term sheet approved
- [ ] Compliance modules aligned with jurisdiction (MiCA, SEC, etc.)

## Procedure

1. **Define terms**
   - TODO: Capture coupon rate, maturity date, denomination, ISIN/identifiers.
2. **Configure compliance**
   - TODO: Map restrictions (country, accreditation, investor limits).
3. **Allocate investors**
   - TODO: Assign initial balances, vesting (if applicable), and distribution accounts.
4. **Approve issuance**
   - TODO: Maker-checker workflow with board/issuer approval.
5. **Deploy and distribute**
   - TODO: Execute deployment, confirm allocations, notify stakeholders.

## Verification

- TODO: Checklist verifying supply, compliance status, audit logs, and investor onboarding.

## SLA

- Issuance timeline: within project plan (e.g., T-5 days to T day distribution).

## References

- `kit/contracts/contracts/assets/bond/` — contract behaviours.
- `kit/docs/content/docs/21-bond-workflows-user-stories.md` — story-driven scenarios.

## Related Guides

- [`../asset-designer-wizard.md`](../../03-asset-operations/asset-designer-wizard.md)
- [`maturity.md`](./maturity.md)
