---
title: Level 2 Status Dashboard
description: Checklist tracking every operations document in progress, drafted, or pending
---

<!-- SOURCE: WINNER-PLAN-FINAL.MD -->
<!-- SOURCE: doc-planing-archive/c-ATK_DOCUMENTATION_MASTER_PLAN.md -->
<!-- SOURCE: doc-planing-archive/a-opus-plan2-4mix.md -->
<!-- SOURCE: DALP_LANGUAGE_GUIDELINES.md -->

# Level 2 Status Dashboard

**Use this checklist to coordinate Level 2 delivery. Update the status markers as soon as a guide moves from planning to draft to approved.**

## Status Legend

- `[ ]` Pending — Outline required
- `[~]` Drafting — Content in progress
- `[x]` Approved — Published and reviewed

## 00 — Quickstart

- [ ] `first-token-10min.md` — Zero-to-issuance walkthrough with screenshots and validation steps for non-technical reviewers.
- [ ] `quickstart-guide.md` — 15-minute platform setup covering Docker services, environment variables, and service checks.
- [ ] `video-tutorials.md` — Curated index of recorded demos and future video assets.

## 01 — Installation

- [ ] `local-setup.md` — Bun install, Docker Compose bootstrap, and local chain initialization.
- [ ] `cloud-deployment.md` — Kubernetes/Helm deployment runbook with secrets management notes.
- [ ] `configuration.md` — Environment variable catalogue and configuration matrix.
- [ ] `system-requirements.md` — Hardware, software, network, and browser prerequisites.

## 02 — Administration

- [ ] `user-management.md` — Role matrix for the 19 built-in roles plus custom role creation.
- [ ] `identity-kyc.md` — OnchainID onboarding, claim topics, and verification levels.
- [ ] `trusted-issuers.md` — Trusted issuer registry governance and multi-jurisdiction setup.
- [ ] `platform-settings.md` — System configuration surfaces and maker-checker controls.
- [ ] `audit-logging.md` — Audit trail exports, retention policy, and compliance reporting.

## 03 — Asset Operations

- [ ] `asset-designer-wizard.md` — Six-step wizard walkthrough with UI cues and validation checks.
- [ ] `token-lifecycle.md` — Create, mint, transfer, pause, and mature lifecycle operations.
- [ ] `corporate-actions.md` — Dividends, voting, splits, and buybacks from the operator console.
- [ ] `yield-management.md` — Interest and distribution scheduling procedures.
- [ ] `redemption-process.md` — Maturity handling, payouts, and settlement confirmation.

## 04 — Compliance Configuration

- [ ] `compliance-modules.md` — Configuration guides for CountryAllowList, IdentityVerification, InvestorCount, etc.
- [ ] `logic-expressions.md` — Rule builder tutorial with AND/OR/NOT patterns and testing guidance.
- [ ] `country-restrictions.md` — Geo-blocking setup and sanctions handling.
- [ ] `investor-limits.md` — Holder and exposure limits with monitoring steps.
- [ ] `transfer-approvals.md` — Manual review workflows and escalation SLAs.

## 05 — Asset Workflows

- [ ] `bonds/issuance.md`
- [ ] `bonds/maturity.md`
- [ ] `bonds/redemption.md`
- [ ] `equity/share-issuance.md`
- [ ] `equity/voting.md`
- [ ] `equity/dividends.md`
- [ ] `funds/fund-creation.md`
- [ ] `funds/nav-calculation.md`
- [ ] `funds/fee-collection.md`
- [ ] `stablecoins/minting.md`
- [ ] `stablecoins/collateral.md`
- [ ] `stablecoins/pegging.md`
- [ ] `deposits/certificate.md`
- [ ] `deposits/yields.md`

## 06 — Monitoring & Operations

- [ ] `monitoring/health-checks.md` — System health indicators and dashboards.
- [ ] `monitoring/performance.md` — Transaction, user, and service performance metrics.
- [ ] `monitoring/alerts.md` — Alert thresholds, channels, and on-call policies.
- [ ] `backup-recovery/backup-procedures.md` — Data backup cadence and verification.
- [ ] `backup-recovery/disaster-recovery.md` — Business continuity and failover runbook.
- [ ] `backup-recovery/rollback-guide.md` — Version rollback and patch reversal steps.
- [ ] `maintenance/upgrades.md` — Platform upgrade sequencing and rollback checks.
- [ ] `maintenance/scheduled-tasks.md` — Routine operations, cron jobs, and housekeeping.

## 07 — Integrations

- [ ] `banking/core-banking.md` — ISO 20022 alignment, SWIFT/ACH messaging, and reconciliation.
- [ ] `banking/swift-integration.md` — SWIFT configuration specifics and certification path.
- [ ] `banking/ach-setup.md` — ACH rails onboarding and settlement controls.
- [ ] `banking/sepa-integration.md` — SEPA onboarding, IBAN validation, and compliance controls.
- [ ] `exchanges/dex-listing.md` — DEX deployment, liquidity provisioning, and monitoring.
- [ ] `exchanges/cex-listing.md` — CEX onboarding requirements and operational SLAs.
- [ ] `exchanges/liquidity-pools.md` — Market-making playbooks and treasury oversight.
- [ ] `custody/digital-custody.md` — Custody provider integration with HSM/MPC context.
- [ ] `custody/multi-sig.md` — Multi-signature governance using the Vault addon.
- [ ] `custody/cold-storage.md` — Offline storage workflows and audit evidence.
- [ ] `enterprise/erp-integration.md` — ERP data sync and reconciliation flows.
- [ ] `enterprise/crm-connection.md` — CRM integration for issuer and investor touchpoints.
- [ ] `enterprise/reporting-apis.md` — Reporting endpoints and data export cadence.
- [ ] `enterprise/webhooks/configuration.md` — Webhook endpoint setup, retries, and security.
- [ ] `enterprise/api/authentication.md` — API key management, scopes, and OAuth extensions.

## 08 — Troubleshooting

- [ ] `common-errors.md` — Top 20 failure modes with fixes and SLA expectations.
- [ ] `transaction-issues.md` — Transaction debugging, gas diagnostics, nonce handling.
- [ ] `wallet-recovery.md` — Lost access procedures and compromised wallet response.
- [ ] `compliance-failures.md` — Resolving blocked transfers and module conflicts.
- [ ] `performance-issues.md` — Performance tuning across dApp, contracts, and infra.
- [ ] `support-escalation.md` — Escalation matrix, support tiers, and communication templates.

## Next Review

- **Owner:** `@operations-docs`
- **Cadence:** Update status after every daily stand-up during the Level 2 sprint.
- **Open Questions:** Confirm hosting runbooks (local/SaaS/on-prem) belong under Installation or Integrations before drafting.
