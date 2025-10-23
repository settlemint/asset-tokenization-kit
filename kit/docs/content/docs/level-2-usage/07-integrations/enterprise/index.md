---
title: Enterprise Integrations
description: Connect ATK with ERP, CRM, reporting systems, and webhooks
---

<!-- SOURCE: doc-planing-archive/c-ATK_DOCUMENTATION_MASTER_PLAN.md -->
<!-- SOURCE: kit/subgraph/schema.graphql -->
<!-- SOURCE: kit/dapp/src/lib/auth/ -->

# Enterprise Integrations

**These guides align ATK with enterprise tooling—finance, CRM, reporting, and event-driven workflows.**

## Roadmap

- [ ] `erp-integration.md` — Data mapping, sync cadence, and reconciliation controls.
- [ ] `crm-connection.md` — Investor/issuer sync, activity logging, and permissions.
- [ ] `reporting-apis.md` — Reporting endpoints, exports, and analytics feeds.
- [ ] `webhooks/configuration.md` — Webhook event catalogue, endpoint setup, and retry policies.
- [ ] `api/authentication.md` — API key lifecycle, scopes, rate limits, and OAuth extensions.

## Delivery Notes

- Leverage event definitions in `kit/subgraph/schema.graphql` to document webhook payloads.
- Reference authentication helpers in `kit/dapp/src/lib/auth/`.
- Include data protection considerations (PII, GDPR) for enterprise connections.
