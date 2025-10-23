---
title: Compliance Logic Builder
description: Compose AND/OR/NOT rules and validate expressions in ATK
---

<!-- SOURCE: kit/dapp/src/components/compliance/ -->
<!-- SOURCE: kit/contracts/contracts/smart/compliance-modules/ -->

# Compliance Logic Builder

> **Status:** Draft skeleton — add walkthrough screenshots, sample expressions, and testing steps.

## Objective

Build and validate complex compliance expressions that combine multiple modules and jurisdictional rules.

## Prerequisites

- [ ] COMPLIANCE_ADMIN role
- [ ] Modules configured and enabled
- [ ] Test accounts covering each rule branch

## Procedure

1. **Open logic builder**
   - TODO: UI navigation path and access controls.
2. **Add modules to expression**
   - TODO: Describe drag-and-drop or selection mechanics.
3. **Configure operators**
   - TODO: Provide examples for AND, OR, NOT combinations.
4. **Validate expression**
   - TODO: Describe built-in validation, sample test cases.
5. **Publish changes**
   - TODO: Maker-checker approval, effective time, rollback options.

## Sample Templates

- **MiCA EU distribution**
  - TODO: Expression snippet referencing CountryAllowList, SupplyCap, TransferApproval.
- **SEC Reg D compliance**
  - TODO: Combine AccreditedInvestor and InvestorCount modules.
- **MAS retail offering**
  - TODO: Example with IdentityVerification levels and transfer limits.

## Verification

- TODO: Provide procedure to run test transfers and confirm expected outcomes.
- TODO: Document how to interpret error codes returned to users.

## SLA

- Logic updates: <4 hours including testing and approval.

## References

- `kit/dapp/src/components/compliance/` — rule builder implementation.
- Module documentation (`./compliance-modules.md`).

## Related Guides

- [`country-restrictions.md`](./country-restrictions.md)
- [`transfer-approvals.md`](./transfer-approvals.md)
