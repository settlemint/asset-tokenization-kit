---
title: Chain-Agnostic Deployment
description: Deploy on any EVM network without losing compliance guarantees
---

<!-- SOURCE: Book of DALP Part III/Chapter 17 — Multi‑Chain Strategy -->
<!-- SOURCE: Book of DALP Part II/Chapter 1 — Issuance & Lifecycle, from Zero to Regulated Asset.md -->
<!-- SOURCE: Book of DALP Part II/Chapter 5 — Deployment & White‑Label, Your Brand, Your Environment.md -->
<!-- SOURCE: Book of DALP Part II/Chapter 7 — User & Developer Experience (UXDX) Speed Without Chaos.md -->
<!-- SOURCE: kit/charts/atk/README.md -->
<!-- SOURCE: docker-compose.yml -->
<!-- SOURCE: README.md (root) -->

# Chain-Agnostic Deployment

**Deploy once, run anywhere.** ATK’s release process packages the same SMART contracts, identity services, compliance modules, and observability stack so they can be promoted from pilot sandboxes to production-grade EVM networks without rewriting code or rebuilding infrastructure. 

## ATK ships with ready-to-use deployment targets

- **Public EVM networks.** Ethereum Mainnet and EVM layer-2 ecosystems such as Polygon are first-class targets for distribution scale and integrations. 
- **Permissioned EVM ledgers.** Hyperledger Besu, Quorum, and equivalent consortium chains run the same package for private membership scenarios that still require regulator audit hooks. 
- **Additional EVM venues.** Regulator-approved chains join once they prove the SMART protocol, identity registry, compliance modules, and monitoring stack deploy and function identically; anything less stays off the promotion list. 


## Chain-agnostic means repeatable releases in practice

- **Standardized Solidity surface.** Contracts target Solidity 0.8.x with OpenZeppelin upgrade patterns, so the bytecode is portable across public and permissioned EVMs without edits. (Source: Book of DALP Part II/Chapter 1)
- **Single release artifact.** Docker Compose, Helm charts, and managed-console pipelines all derive from the same tag, letting teams switch settlement networks by swapping connection details—not regenerating stacks. 
- **Identity and compliance continuity.** OnchainID registries, claim topics, and compliance modules travel with the release. If a destination cannot host them or emit the required telemetry, promotion is blocked. 
- **Consistent user experience.** The white-label Next.js portal and ORPC/GraphQL APIs ship unchanged, so issuers and investors keep the same workflows regardless of where the contracts settle. 

## ATK includes delivery footprints for every environment

| Footprint | What’s included | Primary use | Control surface | Source |
|-----------|-----------------|-------------|-----------------|--------|
| **Docker Compose** | Local Besu node, ORPC services, Hasura, Blockscout, dApp | Developer sandboxes, QA, demos | `.env` + Compose overrides | `docker-compose.yml` |
| **Helm charts** | Modular Kubernetes deployment with namespaces, ingress, MinIO, observability, tx signer | Self-managed production clusters | `kit/charts/atk` values files | `kit/charts/atk/README.md` |
| **SettleMint Console** | Hosted implementation of the same stack with tenancy automation | Fully managed deployments with export path | Console UI & API (backed by Helm artifacts) | `kit/charts/atk/README.md`; README.md |

Each footprint runs through `bun run ci`, which compiles contracts, generates types, runs linting/tests, and validates code generation before artifacts move between environments. (Source: README.md)

## Bridge promotions run as a governed process

ATK treats cross-network promotion as a compliance workflow, not a convenience script. (Source: Book of DALP Part III/Chapter 17)

1. **Lock the source token** after pre-transfer policy checks succeed.
2. **Validate the destination environment**—identity registry, trusted issuers, compliance modules, and monitoring integrations must load successfully.
3. **Mint the mirror token** only when enforcement semantics match the source chain.
4. **Emit an evidence bundle** that links both sides of the move for auditors.

If any control fails (missing module, incomplete identity mapping, unavailable freeze semantics), the bridge aborts and the source token unlocks automatically. No compliance parity, no bridge.

## Operational guardrails travel with every deployment

- **Identity continuity.** Wallets map to the same legal person on every network via carried claims or bound identity systems. Transfers halt if the subject cannot be resolved. 
- **Emergency tooling.** Freeze, force-transfer, and pause semantics mirror across chains so governance interventions work everywhere the asset lives. 
- **Observability and audit trails.** Prometheus, Grafana, Loki, and Blockscout registries deploy alongside the contracts, keeping telemetry and evidence collections consistent. 
- **White-label continuity.** The branded issuer/investor/admin portals wake up with the same theming and navigation in each environment, minimizing change management for clients.

## Executives can brief stakeholders with these takeaways

- **Regulatory continuity:** Assets only land on chains that prove they can enforce the same rules and produce the same evidence as the origin network.
- **Operational speed:** A single release and CI pipeline covers sandboxes, private pilots, and public market launches.
- **Experience control:** Brand, workflows, and APIs remain identical as assets progress from private ledgers to public venues.
- **Cost discipline:** Institutions reuse the same infrastructure-as-code footprint rather than funding bespoke builds per jurisdiction.

**Chain-agnostic isn’t “copy contracts everywhere.” It’s one release, one governance model, and compliant lifecycle control on every network the institution trusts.** 
