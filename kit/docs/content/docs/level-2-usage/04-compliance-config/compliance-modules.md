---
title: Compliance Module Catalogue
description: Configure and verify each SMART compliance module in ATK
---

<!-- SOURCE: kit/contracts/contracts/smart/modules/ -->
<!-- SOURCE: kit/dapp/src/components/compliance/ -->

# Compliance Module Catalogue

> **Status:** Draft skeleton — enumerate modules, parameters, and UI workflows.

## Objective

Document configuration steps, parameters, and verification checks for every built-in compliance module.

## Prerequisites

- [ ] COMPLIANCE_ADMIN role
- [ ] Trusted issuer framework configured
- [ ] Access to regulatory requirements per jurisdiction

## Module Guides

- **CountryAllowListComplianceModule.sol**
  - TODO: Describe country allow-list parameters, bulk import, and testing.
- **CountryBlockListComplianceModule.sol**
  - TODO: Configure deny lists for restricted jurisdictions and sanctions feeds.
- **AddressBlockListComplianceModule.sol**
  - TODO: Integrate against sanctions lists and manual overrides for specific addresses.
- **IdentityAllowListComplianceModule.sol**
  - TODO: Control transfers to identities with pre-approved claims.
- **IdentityBlockListComplianceModule.sol**
  - TODO: Prevent movement to identities flagged by compliance or investigations.
- **SMARTIdentityVerificationComplianceModule.sol**
  - TODO: Map verification levels to claim topics and enforce expirations.
- **InvestorCountComplianceModule.sol**
  - TODO: Configure holder caps, exemptions, and monitoring alerts.
- **TokenSupplyLimitComplianceModule.sol**
  - TODO: Establish max supply, adjustment process, and oversight.
- **TransferApprovalComplianceModule.sol**
  - TODO: Set thresholds, approval queues, and escalation.
- **TimeLockComplianceModule.sol**
  - TODO: Define vesting schedules, release conditions.
- **Custom Modules**
  - TODO: Provide template, testing checklist, deployment steps.
- **Custom Modules**
  - TODO: Provide template, testing checklist, deployment steps.

## Configuration Pattern

1. Identify regulatory requirement and map to module.
2. Gather parameters (trusted issuers, limits, thresholds).
3. Apply configuration in UI or via API.
4. Validate with test transactions.
5. Record configuration change in audit log.

## Verification

- TODO: Provide table of recommended test cases per module.
- TODO: Include log/event references proving enforcement.

## SLA

- New configuration deployment: <1 business day from request.
- Emergency rule updates: <1 hour with post-change review.

## References

- `kit/contracts/contracts/smart/modules/` — source code.
- `kit/dapp/src/components/compliance/` — UI components.
- Level 1 regional guides for regulatory context.
