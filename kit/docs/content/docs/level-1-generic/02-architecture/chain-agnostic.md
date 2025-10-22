---
title: Chain-Agnostic Deployment
description: Deploy on any EVM network without losing compliance guarantees
---

<!-- SOURCE: Book of DALP Part III/Chapter 17 — Multi‑Chain Strategy -->
<!-- SOURCE: Book of DALP Part II/Chapter 5 — Deployment & White‑Label, Your Brand, Your Environment.md -->
<!-- SOURCE: Book of DALP Part II/Chapter 7 — User & Developer Experience (UXDX) Speed Without Chaos.md -->
<!-- SOURCE: kit/charts/atk/README.md -->
<!-- SOURCE: docker-compose.yml -->
<!-- SOURCE: README.md (root) -->

# Chain-Agnostic Deployment

**“Multi-chain” means nothing if compliance falls off at the bridge. ATK only promotes assets to networks that can prove they uphold the same identity, policy, and audit guarantees as the source chain.**

## Why compliance-first multi-chain is mandatory

- **Regulators scrutinize continuity.** If a bridge mints tokens on a network without trusted issuers or rule enforcement, the chain of custody breaks—and so does the license to operate.
- **Operations need deterministic playbooks.** Deployment cannot depend on bespoke scripts per network; infrastructure teams expect charts, values files, and CI pipelines that look identical everywhere.
- **Brand and UX must follow.** Investors and issuers interact with a single portal. Moving chains cannot require separate front-ends or duplicated onboarding flows.

## Deployment models packaged with ATK

| Model | What ships | Primary use case | Control surface |
|-------|------------|------------------|-----------------|
| **Docker Compose** (`docker-compose.yml`) | Full stack in containers: Besu node, Blockscout, Hasura, ORPC services, dApp | Developer sandboxes, QA environments, demos | `.env` + Compose overrides |
| **Helm charts** (`kit/charts/atk`) | Modular Kubernetes deployment with namespaces, ingress, MinIO, observability | Production BYOC or on-prem clusters | `values*.yaml`, namespaces, network policies |
| **SettleMint Console** (managed) | Hosted instance of the same stack with tenant automation and export tooling | Institutions that want fully managed ATK now with option to migrate later | Console UI + API, still backed by Helm artefacts |

Each model shares the same contracts, schema, ORPC APIs, and CI pipeline (`bun run ci`), so migrating between them is a configuration change—not a rewrite.

## Compliance-first bridge pattern

ATK treats cross-network movement as a governance workflow, not a convenience script:

1. **Lock source token** once all policy checks pass.
2. **Run destination readiness tests**—the network must expose the identity registry, compliance modules, and observability hooks required to mirror policy.
3. **Mint mirror token** on the target chain only after proving whitelists, claim topics, and module parameters load successfully.
4. **Emit evidence** packaging both sides of the transfer so auditors see one lifecycle record.

If any prerequisite fails—missing compliance modules, unavailable identity provider, or unsupported emergency controls—the mint aborts and the source token unlocks automatically. **No compliance, no bridge.**

## Network coverage

- **EVM-first footprint.** ATK deploys to Ethereum Mainnet, Polygon, Hyperledger Besu, Quorum, and any institutionally-approved EVM network that can run the SMART contracts and supporting services (Book of DALP, Multi-Chain Strategy).
- **Selection criteria.** Institutions weigh investor distribution, transaction fees, legal recognition, and risk management posture before authorizing a network. ATK’s artifacts keep these evaluations technical, not political.
- **Identity continuity.** OnchainID identities, claim topics, trusted issuers, and freeze semantics must resolve identically on every approved network. Compliance modules rely on those artifacts, so a token cannot exist where the registry does not.

## White-label and experience parity

- **One branded surface.** The Next.js application (`kit/dapp`) exposes issuer, investor, and admin portals with theming tokens so every environment feels like the institution’s own product.
- **Consistent APIs.** ORPC procedures and Hasura GraphQL endpoints expose identical interfaces regardless of network, letting downstream systems (ERP, CRM, reporting) operate without custom branches.
- **Operational telemetry.** Helm charts embed Prometheus, Grafana, Loki, and alerting so runbooks look the same whether workloads run on cloud clusters, sovereign deployments, or the managed console.

## Operational readiness baked in

- **CI as deployment gate.** `bun run ci` compiles contracts, generates types, runs lint/tests, and validates codegen before artifacts ship to any environment.
- **Secrets and tenancy.** Helm values and Compose overrides isolate MinIO buckets, Postgres databases, and Besu nodes per tenant; the managed console enforces the same isolation boundaries.
- **Rollback discipline.** Versioned Helm releases, container tags, and policy checkpoints make rollbacks a single command without leaving orphaned assets on any chain.

## Business outcomes

- **Regulatory continuity**—compliance, identity, and audit evidence remain intact across networks.
- **Speed to market**—move from sandbox to production chains without rewriting deployment automation.
- **Brand control**—white-label experiences follow the asset wherever it trades.
- **Cost discipline**—reuse the same infrastructure-as-code footprint instead of funding bespoke builds per jurisdiction.

**ATK’s multi-chain strategy is simple: deploy anywhere that can prove compliance parity. The moment a network cannot, the bridge stays closed.**
