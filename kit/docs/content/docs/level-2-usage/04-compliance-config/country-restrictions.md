---
title: Country Restrictions
description: Configure geo-blocking and sanctions enforcement for ATK assets
---

<!-- SOURCE: kit/contracts/contracts/smart/compliance-modules/CountryAllowModule.sol -->
<!-- SOURCE: Level 1 regional compliance guides -->

# Country Restrictions

> **Status:** Draft skeleton — add concrete configuration steps, data sources, and verification checks.

## Objective

Control where assets can be distributed by configuring country allow/deny lists and sanctions enforcement.

## Prerequisites

- [ ] CountryAllowList module enabled
- [ ] Sanction list data source identified (OFAC, EU, UN, etc.)
- [ ] Compliance policy mapping for targeted jurisdictions

## Procedure

1. **Load country templates**
   - TODO: Reference Level 1 regional templates and applicable ISO codes.
2. **Configure allow/deny settings**
   - TODO: Document UI fields, bulk upload options, and manual overrides.
3. **Sync sanctions list**
   - TODO: Outline data ingestion, update cadence, and alerting for changes.
4. **Publish configuration**
   - TODO: Maker-checker approval, effective date, rollback action.
5. **Test eligibility**
   - TODO: Run sample transfers from allowed and blocked countries.

## Verification

- TODO: Checklist confirming blocked transactions produce `COUNTRY_BLOCKED` errors.
- TODO: Provide logging references for compliance evidence.

## SLA

- Routine updates: apply within 1 business day of policy change.
- Sanctions emergency update: apply within 1 hour of advisory.

## References

- `CountryAllowModule.sol` — enforcement logic.
- `kit/docs/content/docs/level-1-generic/04-compliance-identity/regional-guides/` — jurisdiction context.

## Related Guides

- [`logic-expressions.md`](./logic-expressions.md)
- [`compliance-failures.md`](../08-troubleshooting/compliance-failures.md)
