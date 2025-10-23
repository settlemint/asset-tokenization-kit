---
title: Integrations
description: Connect ATK with banking rails, exchanges, custody, and enterprise systems
---

<!-- SOURCE: WINNER-PLAN-FINAL.MD -->
<!-- SOURCE: kit/docs/content/docs/26-core-banking-integration-architecture.md -->
<!-- SOURCE: kit/docs/content/docs/27-payment-rails-settlement-architecture.md -->
<!-- SOURCE: doc-planing-archive/c-ATK_DOCUMENTATION_MASTER_PLAN.md -->

# Integrations

**These guides connect ATK to the wider ecosystem—financial rails, trading venues, custody providers, and enterprise platforms.**

## Folder Map

- [`banking`](./banking/) — Core banking connectivity, SWIFT/ACH/SEPA messaging, treasury reconciliation.
- [`exchanges`](./exchanges/) — DEX/CEX listings, liquidity provisioning, and surveillance hooks.
- [`custody`](./custody/) — Custody provider integrations, multi-sig vaults, cold storage procedures.
- [`enterprise`](./enterprise/) — ERP, CRM, reporting APIs, and webhook coordination.

## Roadmap

- [ ] `banking/core-banking.md`
- [ ] `banking/swift-integration.md`
- [ ] `banking/ach-setup.md`
- [ ] `banking/sepa-integration.md`
- [ ] `exchanges/dex-listing.md`
- [ ] `exchanges/cex-listing.md`
- [ ] `exchanges/liquidity-pools.md`
- [ ] `custody/digital-custody.md`
- [ ] `custody/multi-sig.md`
- [ ] `custody/cold-storage.md`
- [ ] `enterprise/erp-integration.md`
- [ ] `enterprise/crm-connection.md`
- [ ] `enterprise/reporting-apis.md`
- [ ] `enterprise/webhooks/configuration.md`
- [ ] `enterprise/api/authentication.md`

## Delivery Notes

- Align integration runbooks with existing architecture documents (`kit/docs/content/docs/26-*`, `27-*`).
- Document API authentication flows referencing `kit/dapp/src/lib/auth/`.
- Highlight compliance dependencies (e.g., travel rule, KYC) for each integration.
