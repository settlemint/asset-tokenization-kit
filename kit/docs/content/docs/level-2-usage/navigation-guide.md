---
title: Level 2 Navigation Guide
description: Quick reference that routes operators to the right ATK usage guide
---

<!-- SOURCE: WINNER-PLAN-FINAL.MD -->
<!-- SOURCE: doc-planing-archive/b-cursor-mixed-a-c.md-final -->
<!-- SOURCE: DALP_LANGUAGE_GUIDELINES.md -->

# Level 2 Navigation Guide

**Share this sheet during onboarding, operations rotations, or incident calls. Each row ties a critical task to the folder index that hosts the relevant runbook.**

## Quick Map

| Scenario | Start Here | Primary Audience | Notes |
|----------|------------|------------------|-------|
| Prove ATK in minutes | [`00-quickstart/index`](./00-quickstart/index) | Sales engineers, product specialists | Includes the ✳ Your First Token in 10 Minutes flow and demo-ready assets. |
| Stand up a new environment | [`01-installation/index`](./01-installation/index) | Platform admins, DevOps | Covers local Docker, staging, production Helm charts, and configuration matrices. |
| Govern users and roles | [`02-administration/index`](./02-administration/index) | Compliance officers, platform admins | 19-role matrix, OnchainID onboarding, trusted issuer registry, audit exports. |
| Launch and operate assets | [`03-asset-operations/index`](./03-asset-operations/index) | Asset managers, operations teams | Asset Designer wizard, lifecycle actions, yield, and redemption procedures. |
| Configure compliance | [`04-compliance-config/index`](./04-compliance-config/index) | Compliance officers | Module catalog, logic builder, regional templates, maker-checker controls. |
| Run asset-specific workflows | [`05-workflows/index`](./05-workflows/index) | Operations, treasury | Bond, equity, fund, stablecoin, and deposit playbooks covering issuance to maturity. |
| Keep the platform healthy | [`06-operations/index`](./06-operations/index) | SRE, operations | Monitoring dashboards, alerting, backup, recovery, upgrades, maintenance. |
| Connect external systems | [`07-integrations/index`](./07-integrations/index) | Integration leads, IT | Banking rails, exchange listings, custody bridges, ERP/CRM connectors, webhooks. |
| Fix issues fast | [`08-troubleshooting/index`](./08-troubleshooting/index) | Support, on-call engineers | Error catalogue, transaction diagnostics, wallet recovery, escalation matrix. |

## Document Explorer

### 00 — Quickstart

| File | Purpose |
|------|---------|
| [`00-quickstart/first-token-10min.md`](./00-quickstart/first-token-10min.md) | Ten-minute flagship demo with screenshots and verification steps. |
| [`00-quickstart/quickstart-guide.md`](./00-quickstart/quickstart-guide.md) | 15-minute Bun + Docker setup with health checks. |
| [`00-quickstart/video-tutorials.md`](./00-quickstart/video-tutorials.md) | Catalogue of recorded walkthroughs aligned to the written guides. |

### 01 — Installation

| File | Purpose |
|------|---------|
| [`01-installation/local-setup.md`](./01-installation/local-setup.md) | Local developer sandbox using Bun, Docker Compose, seeded chain. |
| [`01-installation/cloud-deployment.md`](./01-installation/cloud-deployment.md) | Kubernetes/Helm deployment, secrets, scaling, rollback. |
| [`01-installation/configuration.md`](./01-installation/configuration.md) | Environment variables, configuration profiles, validation scripts. |
| [`01-installation/system-requirements.md`](./01-installation/system-requirements.md) | Hardware, software, browser, and network prerequisites. |

### 02 — Administration

| File | Purpose |
|------|---------|
| [`02-administration/user-management.md`](./02-administration/user-management.md) | 19-role matrix, delegation patterns, custom roles. |
| [`02-administration/identity-kyc.md`](./02-administration/identity-kyc.md) | OnchainID onboarding, claim topics, verification levels. |
| [`02-administration/trusted-issuers.md`](./02-administration/trusted-issuers.md) | Trusted issuer governance, multi-jurisdiction controls. |
| [`02-administration/platform-settings.md`](./02-administration/platform-settings.md) | Platform configuration panels, safety toggles, maker-checker. |
| [`02-administration/audit-logging.md`](./02-administration/audit-logging.md) | Audit trail exports, retention, compliance reporting. |

### 03 — Asset Operations

| File | Purpose |
|------|---------|
| [`03-asset-operations/asset-designer-wizard.md`](./03-asset-operations/asset-designer-wizard.md) | Six-step wizard walkthrough with validation cues. |
| [`03-asset-operations/token-lifecycle.md`](./03-asset-operations/token-lifecycle.md) | Mint, burn, transfer, pause, maturity procedures. |
| [`03-asset-operations/corporate-actions.md`](./03-asset-operations/corporate-actions.md) | Dividends, voting, splits, buybacks. |
| [`03-asset-operations/yield-management.md`](./03-asset-operations/yield-management.md) | Interest scheduling, reconciliation, disclosures. |
| [`03-asset-operations/redemption-process.md`](./03-asset-operations/redemption-process.md) | Redemption approvals, settlement proof, investor comms. |

### 04 — Compliance Configuration

| File | Purpose |
|------|---------|
| [`04-compliance-config/compliance-modules.md`](./04-compliance-config/compliance-modules.md) | Module-by-module configuration guidance (CountryAllowList, IdentityVerification, etc.). |
| [`04-compliance-config/logic-expressions.md`](./04-compliance-config/logic-expressions.md) | Rule builder tutorial with AND/OR/NOT examples and testing. |
| [`04-compliance-config/country-restrictions.md`](./04-compliance-config/country-restrictions.md) | Geo-blocking setup, sanctions lists, overrides. |
| [`04-compliance-config/investor-limits.md`](./04-compliance-config/investor-limits.md) | Holder and exposure limits, monitoring steps. |
| [`04-compliance-config/transfer-approvals.md`](./04-compliance-config/transfer-approvals.md) | Manual review workflows, escalation SLAs, approvals UI. |

### 05 — Asset Workflows

| File | Purpose |
|------|---------|
| [`05-workflows/bonds/issuance.md`](./05-workflows/bonds/issuance.md) | Bond creation, distribution, and compliance checkpoints. |
| [`05-workflows/bonds/maturity.md`](./05-workflows/bonds/maturity.md) | Coupon servicing, maturity settlements, investor comms. |
| [`05-workflows/bonds/redemption.md`](./05-workflows/bonds/redemption.md) | Redemption approvals, payouts, reconciliation. |
| [`05-workflows/equity/share-issuance.md`](./05-workflows/equity/share-issuance.md) | Share issuance, class configuration, cap table checks. |
| [`05-workflows/equity/voting.md`](./05-workflows/equity/voting.md) | Governance event setup, ballot execution, audit trails. |
| [`05-workflows/equity/dividends.md`](./05-workflows/equity/dividends.md) | Dividend declaration, distribution, withholding. |
| [`05-workflows/funds/fund-creation.md`](./05-workflows/funds/fund-creation.md) | Fund onboarding, share classes, investor eligibility. |
| [`05-workflows/funds/nav-calculation.md`](./05-workflows/funds/nav-calculation.md) | NAV calculation cadence, valuation sources, attestations. |
| [`05-workflows/funds/fee-collection.md`](./05-workflows/funds/fee-collection.md) | Management/performance fee accrual and settlement. |
| [`05-workflows/stablecoins/minting.md`](./05-workflows/stablecoins/minting.md) | Minting approvals, collateral links, issuance logs. |
| [`05-workflows/stablecoins/collateral.md`](./05-workflows/stablecoins/collateral.md) | Collateral monitoring, rebalancing, attestations. |
| [`05-workflows/stablecoins/pegging.md`](./05-workflows/stablecoins/pegging.md) | Peg maintenance, circuit breakers, market operations. |
| [`05-workflows/deposits/certificate.md`](./05-workflows/deposits/certificate.md) | Deposit certificate lifecycle, rate setup. |
| [`05-workflows/deposits/yields.md`](./05-workflows/deposits/yields.md) | Interest accrual, payout scheduling, investor comms. |

### 06 — Monitoring & Operations

| File | Purpose |
|------|---------|
| [`06-operations/monitoring/health-checks.md`](./06-operations/monitoring/health-checks.md) | System health indicators, dashboards, service checks. |
| [`06-operations/monitoring/performance.md`](./06-operations/monitoring/performance.md) | Transaction, user, and infrastructure KPIs. |
| [`06-operations/monitoring/alerts.md`](./06-operations/monitoring/alerts.md) | Alert thresholds, channels, on-call runbooks. |
| [`06-operations/backup-recovery/backup-procedures.md`](./06-operations/backup-recovery/backup-procedures.md) | Backup cadence, retention, verification. |
| [`06-operations/backup-recovery/disaster-recovery.md`](./06-operations/backup-recovery/disaster-recovery.md) | Disaster recovery plans, failover steps, RTO/RPO. |
| [`06-operations/backup-recovery/rollback-guide.md`](./06-operations/backup-recovery/rollback-guide.md) | Version rollback, patch reversal, validation. |
| [`06-operations/maintenance/upgrades.md`](./06-operations/maintenance/upgrades.md) | Upgrade sequencing, smoke tests, rollback triggers. |
| [`06-operations/maintenance/scheduled-tasks.md`](./06-operations/maintenance/scheduled-tasks.md) | Recurring jobs, housekeeping, task calendar. |

### 07 — Integrations

| File | Purpose |
|------|---------|
| [`07-integrations/banking/core-banking.md`](./07-integrations/banking/core-banking.md) | Core banking connectivity, treasury reconciliation. |
| [`07-integrations/banking/swift-integration.md`](./07-integrations/banking/swift-integration.md) | SWIFT onboarding, message formats, certification. |
| [`07-integrations/banking/ach-setup.md`](./07-integrations/banking/ach-setup.md) | ACH onboarding, NACHA compliance, settlement windows. |
| [`07-integrations/banking/sepa-integration.md`](./07-integrations/banking/sepa-integration.md) | SEPA flows, IBAN validation, instant vs. batch rails. |
| [`07-integrations/exchanges/dex-listing.md`](./07-integrations/exchanges/dex-listing.md) | DEX listing checklist, liquidity strategy, monitoring. |
| [`07-integrations/exchanges/cex-listing.md`](./07-integrations/exchanges/cex-listing.md) | CEX onboarding, due diligence, API connectivity. |
| [`07-integrations/exchanges/liquidity-pools.md`](./07-integrations/exchanges/liquidity-pools.md) | Liquidity provisioning, treasury policies, KPIs. |
| [`07-integrations/custody/digital-custody.md`](./07-integrations/custody/digital-custody.md) | Custody provider integration, HSM/MPC considerations. |
| [`07-integrations/custody/multi-sig.md`](./07-integrations/custody/multi-sig.md) | Multi-signature governance using ATK Vault addon. |
| [`07-integrations/custody/cold-storage.md`](./07-integrations/custody/cold-storage.md) | Cold storage procedures, audits, emergency access. |
| [`07-integrations/enterprise/erp-integration.md`](./07-integrations/enterprise/erp-integration.md) | ERP data mapping, sync cadence, reconciliation. |
| [`07-integrations/enterprise/crm-connection.md`](./07-integrations/enterprise/crm-connection.md) | CRM sync, activity logging, permissions. |
| [`07-integrations/enterprise/reporting-apis.md`](./07-integrations/enterprise/reporting-apis.md) | Reporting endpoints, analytics feeds, governance. |
| [`07-integrations/enterprise/webhooks/configuration.md`](./07-integrations/enterprise/webhooks/configuration.md) | Webhook catalogue, endpoint setup, retries, security. |
| [`07-integrations/enterprise/api/authentication.md`](./07-integrations/enterprise/api/authentication.md) | API key lifecycle, scopes, rotation, incident response. |

### 08 — Troubleshooting

| File | Purpose |
|------|---------|
| [`08-troubleshooting/common-errors.md`](./08-troubleshooting/common-errors.md) | Top 20 operational errors with fixes and SLAs. |
| [`08-troubleshooting/transaction-issues.md`](./08-troubleshooting/transaction-issues.md) | Transaction diagnostics, gas analysis, nonce handling. |
| [`08-troubleshooting/wallet-recovery.md`](./08-troubleshooting/wallet-recovery.md) | Lost access recovery, compromised wallet response. |
| [`08-troubleshooting/compliance-failures.md`](./08-troubleshooting/compliance-failures.md) | Resolving blocked transfers, module conflicts, claims. |
| [`08-troubleshooting/performance-issues.md`](./08-troubleshooting/performance-issues.md) | Performance tuning across dApp, contracts, infra. |
| [`08-troubleshooting/support-escalation.md`](./08-troubleshooting/support-escalation.md) | Escalation matrix, runbook handoffs, communication templates. |

## Quick Tips

- Pair this guide with the [status dashboard](./STATUS_DASHBOARD.md) to prioritise writing and reviews.
- When a runbook is ready for public sharing, update the **Notes** column with the go-live version or release reference.
- Capture open questions directly in the relevant folder index so the knowledge stays close to the workflow it supports.
