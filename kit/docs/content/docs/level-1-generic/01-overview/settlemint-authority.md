---
title: SettleMint Authority & Evidence
description: Proof that SettleMint’s Asset Tokenization Kit runs the Digital Asset Lifecycle Platform in production today
---

<!-- SOURCE: Part 0 - Category Design/2. The Solution + Category Name.md -->
<!-- SOURCE: Part II — The Architecture/Chapter 5 — Deployment & White‑Label, Your Brand, Your Environment.md -->
<!-- SOURCE: Part III — Operating the Platform/Chapter 14 — Security Model & Controls.md -->
<!-- SOURCE: Part IV — Adoption & Execution/Chapter 21 — Reference Implementations (Copy These Into Your RFP).md -->
<!-- SOURCE: Part IV — Adoption & Execution/Chapter 22 — Metrics & OKRs, Evidence You’re Winning (or Not).md -->
<!-- SOURCE: Part V - Appendices/Appendix S — Licensing & Deployment Options.md -->
<!-- SOURCE: README.md -->
<!-- STATUS: UPDATED -->

# SettleMint Authority

**SettleMint’s Asset Tokenization Kit (ATK) is the production-grade slice of the Digital Asset Lifecycle Platform (DALP): compliance-native assets, deterministic settlement, lifecycle automation, and the operational stack needed to run them.**

## What Ships Today

- **Compliance-native assets** — SMART protocol / ERC‑3643 primitives with identity registry, claims, compliance contracts, and emergency controls keep eligibility in the transfer path.  
- **Lifecycle automation** — Bond, equity, deposit, fund, and stablecoin templates bundle issuance flows, role-based operations, corporate actions, and add-ons like airdrops, vaults, and XvP settlement.  
- **Deterministic settlement services** — Transaction signer, policy engine, and rail adapters coordinate cash and token legs with atomic guarantees and reconciliation feeds.  
- **Operational stack** — Next.js portal, ORPC API, Hasura, The Graph indexer, ERPC/LB, Blockscout, Prometheus/Grafana/Loki, and scripted automation via Docker Compose and Helm.  
- **Licensing clarity** — Code is published under FSL‑1.1‑MIT while proprietary backend services (transaction signer, portal runtime) license through SettleMint for on‑prem or run managed in console.settlemint.com.

## Security, Compliance, and Operations Evidence

- **Defense-in-depth security** — MPC/HSM key management, policy-driven approvals, and dual-control enforcement prevent unilateral movements; every sensitive action is logged to SIEM systems.  
- **Enterprise identity & access** — SSO/SAML/OIDC integration, MFA, and RBAC/ABAC down to action scopes mirror bank identity doctrine, producing zero critical audit findings on access control.  
- **Pre-transfer compliance gates** — Jurisdictional rules, allowlists, holding periods, and concentration caps execute before any state change; violations revert on-chain with full audit trails.  
- **Data protection by design** — PII stays off-chain, data in transit and at rest is encrypted, and network policies enforce least privilege across services.  
- **Incident playbooks that pass the 3 a.m. test** — Automated responses pause affected flows, rotate keys, and generate regulator-ready evidence without manual heroics.

## Metrics Risk Committees Expect

| KPI | Target | Source |
|-----|--------|--------|
| Regulatory incidents | **0** | DALP metrics & OKRs |
| Compliance block rate | **100%** of restricted transfers stopped; >95% approvals automated | DALP metrics & OKRs |
| First-attempt settlement | **≥99%** | DALP metrics & OKRs |
| T+0 settlement share | ~**99%** where tokenized cash exists | DALP metrics & OKRs |
| KYC turnaround | Median **<1 day** | DALP metrics & OKRs |
| Platform uptime | **≥99.9%** with no outages >1 h | DALP metrics & OKRs |
| Corporate-action accuracy | **100% on schedule, zero reconciliation leaks** | DALP metrics & OKRs |

Every metric is instrumented in event-sourced logs and ISO 20022 mirrors, exposed through the regulatory dashboard rather than manual reporting.

## Deployment Control and Licensing

- **Self-hosted Kubernetes** — Helm charts in `kit/charts/atk` deploy the full stack (dApp, ORPC, Besu, Blockscout, Hasura, observability) with isolation policies, backups, and disaster recovery guidance.  
- **Developer & QA automation** — `docker-compose.yml` plus `bun run dev:up` reproduce the same artifacts locally so sandbox environments mirror production behaviour.  
- **Managed SettleMint Console** — Identical stack operated by SettleMint for teams that prefer SaaS while retaining the option to migrate to BYOC or on‑prem.  
- **Licensing model** — Source components remain FSL‑1.1‑MIT; proprietary backend services license through SettleMint for on‑prem deployments or run as part of the managed Console offer (Appendix S).  
- **CI discipline** — `bun run ci` enforces formatting, compilation, codegen, linting, and tests; these workflows underpin both customer pipelines and Console releases, creating a single definition of “ready.”

## Reference Implementations in Production

- **Tokenized bond launch** — Deploy bond template, onboard investors through the identity registry, run Ready‑for‑Exchange adapters for secondary trading, and execute ISO 20022 mirrored atomic DvP with ≥99% first-attempt settlement.  
- **Private fund infrastructure** — Mint fund units, schedule NAV windows, automate subscriptions/redemptions and payouts, enforce investor class rules, and expose optional verified holder bulletin boards.  
- **Equity registry & governance** — Maintain the canonical cap table, run on-chain voting with record-date snapshots, execute buybacks/redemptions with instant reconciliation, and deliver audit-grade tallies.

These blueprints run without glue code because eligibility, venue adapters, DvP, and corporate-action engines are native to ATK.

## Ecosystem Integrations

- **Custody providers** — Fireblocks, Coinbase, Copper, Metaco, and bespoke custodians connect through standardized APIs so banks keep their existing control rooms while preserving DALP compliance gates.  
- **Banking & payment rails** — ISO 20022 adapters coordinate fiat settlement with token legs, enabling deterministic DvP whether cash is on-chain or delivered through RTGS/SWIFT/SEPA instructions.  
- **Observability & identity** — Prometheus/Grafana/Loki ship by default; OAuth flows, MFA, and granular roles in the dApp and ORPC backend tie into enterprise identity providers without custom builds.

## Engage with SettleMint

For licensing, deployment planning, or managed Console onboarding, contact **support@settlemint.com**. The same team maintains the public repository (`README.md`) and operating guides so every engagement starts from the documented, production-ready stack.
