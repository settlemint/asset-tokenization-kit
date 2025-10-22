---
title: Enterprise Capabilities
description: Bank-grade governance, identity, and operations shipped with ATK
---

<!-- SOURCE: Book of DALP Part I/Chapter 6 — Enterprise Control and Governance -->
<!-- SOURCE: Book of DALP Part II/Chapter 6 — Enterprise Authentication -->
<!-- SOURCE: Book of DALP Part II/Chapter 9 — Data, Reporting & Audit -->
<!-- SOURCE: Book of DALP Part III/Chapter 14 — Security Model & Controls -->
<!-- SOURCE: Book of DALP Part IV/Chapter 22 — Metrics & OKRs, Evidence You’re Winning (or Not).md -->
<!-- SOURCE: kit/contracts/contracts/system/README.md -->
<!-- SOURCE: kit/contracts/contracts/system/ATKPeopleRoles.sol -->
<!-- SOURCE: kit/contracts/contracts/system/ATKSystemRoles.sol -->
<!-- SOURCE: kit/contracts/contracts/assets/ATKAssetRoles.sol -->
<!-- SOURCE: kit/charts/atk/README.md -->

# Enterprise Capabilities

**Institutions judge tokenization platforms on governance, evidence, and operational discipline. ATK ships enterprise controls as part of the product, not as a roadmap promise.**

## Why enterprises reject commodity stacks

- **No separation of duties.** If the same account can mint supply, change compliance rules, and approve onboarding, the platform fails SOX and DORA reviews on day one.
- **Identity chaos.** Without federated SSO/MFA and SCIM, security operations cannot connect the platform to corporate IAM and audit who did what.
- **Missing evidence.** Boards and regulators expect immutable logs, reporting packs, and SLAs. Screenshots and spreadsheets are not evidence.

## Control framework at a glance

| Dimension | What ships | Evidence | Outcome |
|-----------|-----------|----------|---------|
| **Access control** | 21 distinct roles across human operators and modules (`ATKPeopleRoles.sol`, `ATKAssetRoles.sol`, `ATKSystemRoles.sol`) | On-chain role grants + access manager events | **Separation of duties aligned with SOX/DORA expectations** |
| **Identity & authentication** | SSO/MFA/SAML/OIDC, SCIM provisioning, session governance (Book of DALP, Enterprise Authentication) | IAM integration runbooks, audit logs | **Corporate IAM embeds directly; no shadow directories** |
| **Change management** | Upgrade checkpoints, governance approvals, CI/CD pipeline with `bun run ci` | Versioned artifacts, approval records | **No silent mutations of live securities** |
| **Evidence & reporting** | Immutable compliance logs, Hasura/GraphQL data access, pre-built regulator packs | Audit exports, telemetry dashboards | **Respond to regulator requests in minutes, not weeks** |
| **Operational resilience** | Helm chart topologies with HA services, observability stack, backup policies (`kit/charts/atk/README.md`) | Metrics ≥99.9% uptime, failover drills | **Availability and recovery SLAs that pass procurement review** |

## Role-based separation of duties

- **Human-operated roles (14).** `SYSTEM_MANAGER_ROLE`, `IDENTITY_MANAGER_ROLE`, `TOKEN_MANAGER_ROLE`, `COMPLIANCE_MANAGER_ROLE`, `CLAIM_POLICY_MANAGER_ROLE`, `CLAIM_ISSUER_ROLE`, `AUDITOR_ROLE`, and others govern onboarding, policy, and oversight without overlapping authority.
- **Asset governance roles (5).** `DEFAULT_ADMIN_ROLE`, `GOVERNANCE_ROLE`, `SUPPLY_MANAGEMENT_ROLE`, `CUSTODIAN_ROLE`, and `EMERGENCY_ROLE` regulate lifecycle events such as minting, redemption, freeze, and force-transfer actions.
- **Automated module roles (7).** `SYSTEM_MODULE_ROLE`, `IDENTITY_REGISTRY_MODULE_ROLE`, `TOKEN_FACTORY_MODULE_ROLE`, `ADDON_FACTORY_MODULE_ROLE`, and peers constrain factory automation so code executes under least privilege.

Each role is administered through the on-chain access manager, producing auditable grants and revocations that map directly to enterprise segregation-of-duty matrices.

## Identity and access management

- **Federated authentication.** The platform integrates with corporate identity providers via SAML 2.0, OpenID Connect, OAuth 2.0, and enforces MFA policies—exactly what DALP customers expect for regulated workloads.
- **SCIM provisioning.** Automated user lifecycle management keeps platform roles synchronized with HR and IAM systems, eliminating manual user cleanup.
- **Session governance.** Configurable timeout, IP restrictions, and concurrency limits prevent orphaned access.
- **OnchainID convergence.** Investor and issuer identities in OnchainID mirror corporate IAM assertions, linking legal personas to wallet addresses with trusted issuer attestations.

Result: **security teams control the platform with the same tooling they use across payments, core banking, and trading systems.**

## Governance and change control

- **Versioned deployments.** Every contract upgrade or policy change moves through proxy checkpoints and governance approval flows. No asset mutates without a recorded vote.
- **CI-driven releases.** `bun run ci` validates formatting, contract compilation, type generation, linting, and tests before artifacts ship to Helm charts, Compose bundles, or the managed console.
- **Policy checkpoints.** Compliance configurations include “frozen” flags; once a security goes live, changes require explicit governance acknowledgement.

Auditors receive machine-readable evidence showing who approved what, when, and with which artifacts.

## Evidence, reporting, and analytics

- **Immutable audit trail.** Compliance and identity actions emit events that downstream SIEMs capture. Hasura and ORPC APIs expose structured data for risk monitoring and reconciliation.
- **Regulator packs.** MiCA, SEC, MAS, and GCC templates bundle transfer histories, claim states, and decision logs so regulatory filings are export operations, not data projects.
- **Operational dashboards.** Built-in Prometheus/Grafana integrations track settlement latency, API performance, uptime, and alert thresholds; metrics exceed **99.9% availability** targets noted in DALP benchmarks.

## Security posture and resilience

- **Zero-trust networking.** Network policies, mTLS, and ingress controls isolate workloads per tenant; the same patterns run in customer-managed clusters and SettleMint’s managed console.
- **Secrets and key custody.** Helm values integrate with enterprise secret stores, and custody workflows leverage multi-sig vault add-ons for treasury operations.
- **Backup and recovery.** Automated Postgres snapshots, MinIO object replication, and documented disaster recovery drills deliver predictable RTO/RPO commitments.

## Deployment and tenancy flexibility

- **Bring-your-own infrastructure.** Kubernetes Helm charts package the entire stack for self-hosted or sovereign deployments.
- **Managed service with exit ramps.** SettleMint Console runs the identical stack, giving teams a fast start with the option to lift-and-shift onto their own clusters when procurement mandates it.
- **Dedicated tenancy.** Namespaces, resource quotas, and observability pipelines isolate tenants—no noisy neighbors, no shared databases.

## Business outcomes

- **Procurement-ready from day one.** IAM, compliance, and audit answers are built in, reducing diligence cycles from months to weeks.
- **Operational leverage.** Automation keeps teams focused on exceptions while the platform maintains guardrails and evidence automatically.
- **Regulator confidence.** Demonstrable control over change, access, and data residency persuades supervisors that ATK is market infrastructure, not an experiment.

**Enterprise teams need more than smart contracts—they need a governed, observable, identity-aware platform. ATK delivers that foundation out of the box.**
