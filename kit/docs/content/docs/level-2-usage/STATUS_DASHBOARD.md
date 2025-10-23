---
title: Level 2 Status Dashboard
description: Execution checklist tracking every usage runbook deliverable
---

<!-- SOURCE: WINNER-PLAN-FINAL.MD -->
<!-- SOURCE: doc-planing-archive/c-ATK_DOCUMENTATION_MASTER_PLAN.md -->
<!-- SOURCE: doc-planing-archive/a-opus-plan2-4mix.md -->
<!-- SOURCE: kit/README.md -->
<!-- SOURCE: kit/dapp/.env.example -->
<!-- SOURCE: kit/dapp/src/lib/db/schemas/access-control.ts -->
<!-- SOURCE: kit/dapp/src/components/account/ -->
<!-- SOURCE: kit/dapp/src/lib/db/schemas/audit.ts -->
<!-- SOURCE: kit/contracts/contracts/onchainid/ -->
<!-- SOURCE: kit/contracts/contracts/assets/ -->
<!-- SOURCE: kit/contracts/contracts/addons/Vault.sol -->
<!-- SOURCE: kit/contracts/contracts/smart/compliance-modules/ -->
<!-- SOURCE: kit/contracts/contracts/smart/upgradeability/ -->
<!-- SOURCE: kit/subgraph/schema.graphql -->
<!-- SOURCE: docker-compose.yml -->
<!-- SOURCE: kit/charts/atk/values.yaml -->

# Level 2 Status Dashboard

**Use this execution checklist to coordinate Level 2 delivery. Move items from unchecked to checked as soon as the runbook is drafted, reviewed, and approved.**

## Status Legend

- `[ ]` Pending — Outline required
- `[~]` Drafting — Content in progress
- `[x]` Approved — Published and reviewed

## Getting Started

### Your First Token in 10 Minutes

- [ ] `00-quickstart/first-token-10min.md` — Flagship zero-to-issuance walkthrough (**[CREATE NEW]**)
  - [ ] Step 1 screenshot — Access platform login and tenant selector
  - [ ] Step 2 screenshot — Create or assign operator account
  - [ ] Step 3 screenshot — Complete KYC / OnchainID card
  - [ ] Step 4 screenshot — Asset Designer wizard launch
  - [ ] Step 5 screenshot — Compliance configuration summary
  - [ ] Step 6 screenshot — Deployment confirmation and transaction hash
  - [ ] Verification checklist — Contract address, minted supply, audit log entry
  - [ ] Non-technical validation — Timing test documented

### Fifteen-Minute Platform Setup

- [ ] `00-quickstart/quickstart-guide.md` — Bun + Docker Compose setup with health checks (**[CREATE NEW]**)
  - [ ] Docker workflow captured from `kit/README.md`
  - [ ] Environment variables sourced from `kit/dapp/.env.example`
  - [ ] Database initialisation referencing `kit/dapp/drizzle/`
  - [ ] Local blockchain node instructions from `docker-compose.yml`
  - [ ] Service health verification procedure (**[CREATE NEW]**)

### System Requirements

- [ ] `01-installation/system-requirements.md` — Hardware, software, network baseline (**[CREATE NEW]**)
  - [ ] Hardware profile derived from `kit/README.md`
  - [ ] Software prerequisites from `kit/README.md`
  - [ ] Network requirements (**[CREATE NEW]**)
  - [ ] Browser compatibility matrix (**[CREATE NEW]**)
  - [ ] Mobile device support statement (**[CREATE NEW]**)

### Environment Configuration

- [ ] `01-installation/configuration.md` — Environment profiles and variables
  - [ ] Local development setup referencing `kit/README.md`
  - [ ] Staging configuration mapped from `kit/charts/atk/values.yaml`
  - [ ] Production configuration mapped from `kit/charts/atk/values.yaml`
  - [ ] Environment variable reference from `kit/dapp/.env.example`

## User & Identity Management

### Role Catalogue

- [ ] `02-administration/user-management.md` — 19 roles plus custom roles
  - [ ] Role data extracted from `kit/dapp/src/lib/db/schemas/access-control.ts`
  - [ ] Super Admin permissions (**[DOCUMENT from code]**)
  - [ ] Platform Admin permissions (**[DOCUMENT from code]**)
  - [ ] Asset Manager permissions (**[DOCUMENT from code]**)
  - [ ] Compliance Officer permissions (**[DOCUMENT from code]**)
  - [ ] KYC Validator permissions (**[DOCUMENT from code]**)
  - [ ] Investor permissions (**[DOCUMENT from code]**)
  - [ ] Auditor permissions (**[DOCUMENT from code]**)
  - [ ] Transfer Agent permissions (**[DOCUMENT from code]**)
  - [ ] Custodian permissions (**[DOCUMENT from code]**)
  - [ ] Market Maker permissions (**[DOCUMENT from code]**)
  - [ ] Legal Officer permissions (**[DOCUMENT from code]**)
  - [ ] Risk Manager permissions (**[DOCUMENT from code]**)
  - [ ] Operations permissions (**[DOCUMENT from code]**)
  - [ ] Treasury permissions (**[DOCUMENT from code]**)
  - [ ] Support Agent permissions (**[DOCUMENT from code]**)
  - [ ] Developer permissions (**[DOCUMENT from code]**)
  - [ ] Read-only User permissions (**[DOCUMENT from code]**)
  - [ ] Guest permissions (**[DOCUMENT from code]**)
  - [ ] Custom role creation guidance (**[CREATE NEW]**)

### User Creation & Governance

- [ ] `02-administration/user-management.md` — User onboarding workflows
  - [ ] UI walkthrough derived from `kit/dapp/src/components/account/`
  - [ ] ORPC procedure coverage from `kit/dapp/src/orpc/procedures/`
  - [ ] Bulk user import process (**[CREATE NEW]**)
  - [ ] User invitation flow (**[CREATE NEW]**)
  - [ ] Password requirements (**[DOCUMENT from code]**)
  - [ ] Two-factor authentication setup (**[CREATE NEW]**)

### KYC / OnchainID

- [ ] `02-administration/identity-kyc.md`
  - [ ] OnchainID registration described using `kit/dapp/src/components/account/profile/profile-kyc-card.tsx`
  - [ ] Claim types documented from `kit/contracts/contracts/onchainid/`
  - [ ] Verification levels (**[CREATE NEW]**)
  - [ ] Jurisdiction-specific document requirements (**[CREATE NEW]**)
  - [ ] Verification timeline expectations (**[CREATE NEW]**)

### Trusted Issuers

- [ ] `02-administration/trusted-issuers.md`
  - [ ] Adding issuers referencing `kit/contracts/contracts/onchainid/factory/`
  - [ ] Removing issuers (**[DOCUMENT from code]**)
  - [ ] Issuer verification process (**[CREATE NEW]**)
  - [ ] Multi-jurisdiction configuration (**[CREATE NEW]**)

### Multi-Signature Workflows

- [ ] `02-administration/platform-settings.md`
  - [ ] Approval thresholds (**[DOCUMENT from code]**)
  - [ ] Signer management (**[DOCUMENT from code]**)
  - [ ] Approval notifications (**[CREATE NEW]**)
  - [ ] Emergency bypass procedures (**[CREATE NEW]**)

### Audit Logging

- [ ] `02-administration/audit-logging.md`
  - [ ] Activity catalogue from `kit/dapp/src/lib/db/schemas/audit.ts`
  - [ ] Log retention policies (**[CREATE NEW]**)
  - [ ] Audit export process (**[CREATE NEW]**)
  - [ ] Compliance reporting templates (**[CREATE NEW]**)

## Asset Designer Wizard

- [ ] `03-asset-operations/asset-designer-wizard.md`
  - [ ] Step 1 — Asset type selection (UI from `kit/dapp/src/components/asset-designer/`)
  - [ ] Step 2 — Token details (**[DOCUMENT from UI]**)
  - [ ] Step 3 — Compliance rules (**[DOCUMENT from UI]**)
  - [ ] Step 4 — Distribution planning (**[DOCUMENT from UI]**)
  - [ ] Step 5 — Review summary (**[CREATE NEW]**)
  - [ ] Step 6 — Deployment procedure (**[CREATE NEW]**)
  - [ ] Bond, equity, fund, stablecoin, deposit configuration references from `kit/contracts/contracts/assets/`

## Compliance Configuration

- [ ] `04-compliance-config/compliance-modules.md` — Module catalogue
  - [ ] CountryAllowList (`CountryAllowModule.sol`)
  - [ ] IdentityVerification (`IdentityModule.sol`)
  - [ ] InvestorCount (`MaxBalanceModule.sol`)
  - [ ] TransferApproval (`TransferApprovalModule.sol`)
  - [ ] TimeLock (`TimeLockModule.sol`)
  - [ ] SupplyCap (`SupplyCapModule.sol`)
  - [ ] TransferLimit (`TransferLimitModule.sol`)
  - [ ] AddressBlocking (`BlocklistModule.sol`)
  - [ ] AccreditedInvestor (`AccreditedModule.sol`)
  - [ ] Custom modules framework (**[CREATE NEW]**)
- [ ] `04-compliance-config/logic-expressions.md`
  - [ ] AND operator usage (**[CREATE NEW]**)
  - [ ] OR operator usage (**[CREATE NEW]**)
  - [ ] NOT operator usage (**[CREATE NEW]**)
  - [ ] Complex expression examples (**[CREATE NEW]**)
  - [ ] Logic testing procedures (**[CREATE NEW]**)
- [ ] `04-compliance-config/country-restrictions.md`
  - [ ] Geo-blocking setup and sanctions integration
- [ ] `04-compliance-config/investor-limits.md`
  - [ ] Holder and exposure monitoring procedures
- [ ] `04-compliance-config/transfer-approvals.md`
  - [ ] Manual review queue, auto-approval rules, escalation SLAs
- [ ] Regional templates (**[CREATE NEW]**)
  - [ ] MiCA
  - [ ] SEC
  - [ ] MAS
  - [ ] GCC

## Asset Workflows

- [ ] `05-workflows/bonds/issuance.md` (reference `kit/docs/content/docs/21-bond-workflows-user-stories.md`)
- [ ] `05-workflows/bonds/maturity.md`
- [ ] `05-workflows/bonds/redemption.md`
- [ ] `05-workflows/equity/share-issuance.md` (reference `kit/docs/content/docs/22-equity-workflows-user-stories.md`)
- [ ] `05-workflows/equity/voting.md`
- [ ] `05-workflows/equity/dividends.md`
- [ ] `05-workflows/funds/fund-creation.md` (reference `kit/docs/content/docs/23-fund-workflows-user-stories.md`)
- [ ] `05-workflows/funds/nav-calculation.md`
- [ ] `05-workflows/funds/fee-collection.md`
- [ ] `05-workflows/stablecoins/minting.md` (reference `kit/docs/content/docs/24-stablecoin-workflows-user-stories.md`)
- [ ] `05-workflows/stablecoins/collateral.md`
- [ ] `05-workflows/stablecoins/pegging.md`
- [ ] `05-workflows/deposits/certificate.md` (reference `kit/docs/content/docs/25-deposit-workflows-user-stories.md`)
- [ ] `05-workflows/deposits/yields.md`

## Integrations

### Banking

- [ ] `07-integrations/banking/core-banking.md` (reference `kit/docs/content/docs/26-core-banking-integration-architecture.md`)
- [ ] `07-integrations/banking/swift-integration.md`
- [ ] `07-integrations/banking/ach-setup.md` (reference `kit/docs/content/docs/27-payment-rails-settlement-architecture.md`)
- [ ] `07-integrations/banking/sepa-integration.md` (**[CREATE NEW]**)

### Exchanges

- [ ] `07-integrations/exchanges/dex-listing.md` (**[CREATE NEW]**)
- [ ] `07-integrations/exchanges/cex-listing.md` (**[CREATE NEW]**)
- [ ] `07-integrations/exchanges/liquidity-pools.md`

### Custody

- [ ] `07-integrations/custody/digital-custody.md` (**[CREATE NEW]**)
- [ ] `07-integrations/custody/multi-sig.md` (reference `kit/contracts/contracts/addons/Vault.sol`)
- [ ] `07-integrations/custody/cold-storage.md` (**[CREATE NEW]**)

### Enterprise

- [ ] `07-integrations/enterprise/erp-integration.md` (**[CREATE NEW]**)
- [ ] `07-integrations/enterprise/crm-connection.md` (**[CREATE NEW]**)
- [ ] `07-integrations/enterprise/reporting-apis.md`
- [ ] `07-integrations/enterprise/webhooks/configuration.md`
  - [ ] Event catalogue from `kit/subgraph/schema.graphql`
  - [ ] Endpoint setup (**[CREATE NEW]**)
  - [ ] Authentication guidance (**[CREATE NEW]**)
  - [ ] Retry policies (**[CREATE NEW]**)
- [ ] `07-integrations/enterprise/api/authentication.md`
  - [ ] API key lifecycle from `kit/dapp/src/lib/auth/`
  - [ ] Permission scopes and rate limiting
  - [ ] OAuth extensions (**[CREATE NEW]**)

### Hosting Options

- [ ] Hosting models documented (local sandbox, SaaS tenancy, on-prem) (**[CREATE NEW]**)
  - [ ] Placement decision — reference in Installation or Integrations

## Monitoring & Operations

### Monitoring

- [ ] `06-operations/monitoring/health-checks.md` (**[CREATE NEW]**)
  - [ ] System health metrics catalogue
  - [ ] DB, blockchain, API indicators
- [ ] `06-operations/monitoring/performance.md` (**[CREATE NEW]**)
  - [ ] Transaction metrics (TPS, gas usage)
  - [ ] User metrics (active accounts, session duration)
- [ ] `06-operations/monitoring/alerts.md` (**[CREATE NEW]**)
  - [ ] Alert types (system, security, compliance, performance)
  - [ ] Notification channels (email, SMS, Slack, PagerDuty)

### Backup & Recovery

- [ ] `06-operations/backup-recovery/backup-procedures.md` (**[CREATE NEW]**)
  - [ ] Database backups
  - [ ] Configuration backups
  - [ ] Verification procedures
- [ ] `06-operations/backup-recovery/disaster-recovery.md` (**[CREATE NEW]**)
  - [ ] Recovery procedures (RTO/RPO)
  - [ ] Failover steps
  - [ ] Business continuity communications
- [ ] `06-operations/backup-recovery/rollback-guide.md`
  - [ ] Version rollback workflows
  - [ ] Migration reversal scripts

### Maintenance

- [ ] `06-operations/maintenance/upgrades.md`
  - [ ] Platform updates (**[CREATE NEW]**)
  - [ ] Smart contract upgrades (reference `kit/contracts/contracts/smart/upgradeability/`)
  - [ ] Testing procedures
- [ ] `06-operations/maintenance/scheduled-tasks.md` (**[CREATE NEW]**)
  - [ ] Routine task calendar
  - [ ] Automation scripts

## Troubleshooting & Support

- [ ] `08-troubleshooting/common-errors.md` (**[CREATE NEW]**)
  - [ ] Insufficient gas
  - [ ] KYC not verified
  - [ ] Transfer blocked by compliance
  - [ ] Blockchain connectivity failure
  - [ ] Invalid signature
  - [ ] Contract paused
  - [ ] Nonce too low
  - [ ] Deadline exceeded
  - [ ] Insufficient token balance
  - [ ] Not authorised
  - [ ] Compliance module not found
  - [ ] Database connection lost
  - [ ] API rate limited
  - [ ] Subgraph indexing lag
  - [ ] Contract deployment failed
  - [ ] Migration failed
  - [ ] Backup corrupted
  - [ ] Performance degraded
  - [ ] Security alert triggered
  - [ ] Integration timeout
- [ ] `08-troubleshooting/transaction-issues.md` (**[CREATE NEW]**)
  - [ ] Error code interpretation
  - [ ] Gas analysis and nonce resets
  - [ ] State verification steps
  - [ ] Retry strategies
- [ ] `08-troubleshooting/wallet-recovery.md` (**[CREATE NEW]**)
  - [ ] Lost access recovery
  - [ ] Verification workflows
  - [ ] Compromised wallet response
- [ ] `08-troubleshooting/compliance-failures.md` (**[CREATE NEW]**)
  - [ ] Module conflict diagnosis
  - [ ] Violation analysis and remediation
- [ ] `08-troubleshooting/performance-issues.md` (**[CREATE NEW]**)
  - [ ] Database optimisation
  - [ ] Blockchain optimisation
- [ ] `08-troubleshooting/support-escalation.md` (**[CREATE NEW]**)
  - [ ] Severity classification
  - [ ] Self-help references
  - [ ] Escalation criteria
  - [ ] Support channels

## Next Review

- **Owner:** `@operations-docs`
- **Cadence:** Update status after every daily stand-up during the Level 2 sprint.
- **Open Questions:** Confirm stewardship of hosting runbooks and coordinating screenshots repository under `kit/docs/static/images/level-2/`.

## Source Legend

- `kit/docs/` — Runbook references and existing user stories
- `kit/contracts/` — Smart contract implementations and compliance modules
- `kit/dapp/` — Frontend flows, ORPC procedures, authentication, and audit schemas
- `kit/subgraph/` — Event catalogue for reporting and webhooks
- `docker-compose.yml` — Local infrastructure definition
- `kit/charts/` — Deployment configuration for Kubernetes environments
- `[CREATE NEW]` — Content to be authored from scratch
- `[DOCUMENT from code]` / `[DOCUMENT from UI]` — Extract authoritative behaviour from the codebase or UI implementation
