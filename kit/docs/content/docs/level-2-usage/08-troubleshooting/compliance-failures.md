---
title: Compliance Failure Resolution
description: Diagnose and resolve compliance-related transaction blocks
---

<!-- SOURCE: kit/contracts/contracts/smart/compliance-modules/ -->
<!-- SOURCE: kit/dapp/src/components/compliance/ -->

# Compliance Failure Resolution

> **Status:** Draft skeleton — populate with module-specific diagnostics and resolution playbooks.

## Objective

Resolve compliance block events quickly while preserving regulatory evidence and system integrity.

## Prerequisites

- [ ] Access to compliance configuration console
- [ ] Logs or event history for blocked transactions
- [ ] Contact list for compliance officers and trusted issuers

## Procedure

1. **Identify blocking module**
   - TODO: Interpret error codes, locate module causing block.
2. **Review configuration**
   - TODO: Inspect module parameters, logic expressions, and recent changes.
3. **Validate participant data**
   - TODO: Check OnchainID claims, investor limits, jurisdiction status.
4. **Apply resolution**
   - TODO: Options include updating claims, adjusting limits, granting overrides.
5. **Document decision**
   - TODO: Record resolution in audit log, notify stakeholders, update knowledge base.

## Module-Specific Notes

- CountryAllowList — TODO: steps to update allowlists or override.
- IdentityVerification — TODO: reissue claims or escalate to trusted issuer.
- InvestorCount — TODO: manage exemptions or share transfers.
- TransferApproval — TODO: manual approval workflow and escalation.

## Verification

- TODO: Checklist confirming transaction processed, compliance logs updated, and monitoring cleared.

## SLA

- Standard compliance issue: resolved within 4 hours.
- Regulatory breach risk: immediate escalation; target <1 hour.

## References

- `kit/contracts/contracts/smart/compliance-modules/`
- `kit/dapp/src/components/compliance/`

## Related Guides

- [`../04-compliance-config/compliance-modules.md`](../04-compliance-config/compliance-modules.md)
- [`common-errors.md`](./common-errors.md)
