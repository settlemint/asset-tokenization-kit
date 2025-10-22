---
title: Frequently Asked Questions
description: Appendix-backed answers for executives, operators, and architects
---

# Frequently Asked Questions

Every answer below cites the approved source set (Appendix Z, Appendix S, Appendix Q, Appendix R, and relevant DALP chapters). Questions are grouped by audience to accelerate search and reuse.

## General

**Q: What is the Asset Tokenization Kit (ATK)?**  
A: ATK is SettleMint’s production implementation of the SMART protocol with ERC‑3643 concepts. It ships compliant token contracts (bond, equity, deposit, fund, stablecoin), modular addons (airdrop, vault, XvP, fixed yield), and the backend services required to operate them. (Source: Appendix Z)

**Q: Which blockchains does ATK support?**  
A: Any EVM-compatible chain where ATK contracts are deployed. Helm charts include Hyperledger Besu for private networks; public EVMs (Ethereum, Polygon, Arbitrum, etc.) are supported through configuration. (Source: Appendix Z)

**Q: Is ATK open source?**  
A: The kit is published under FSL‑1.1‑MIT. Self-hosted deployments that use the packaged backend services (Transaction Signer, Portal/API) require a proprietary SettleMint licence; the same services are bundled in the managed SaaS offering. (Source: Appendix Z; Appendix S)

## Product & Operations

**Q: Which asset types and addons are available today?**  
A: Bond, Equity, Fund, Deposit, and StableCoin templates plus addons for Airdrop, Vault, XvP, and Fixed Yield schedules. Contract implementations live in `kit/contracts/contracts/assets/`. (Source: Appendix Z)

**Q: How does ATK enforce compliance?**  
A: Identity registry + signed claims feed a compliance contract that orchestrates pluggable modules (country lists, investor count, time locks, supply limits, transfer approvals). Non-compliant transfers revert with auditable reason codes. (Source: Appendix Z; Appendix A; Part I Ch 4)

**Q: Does ATK include a trading engine or fiat DvP connectors?**  
A: Not yet. Venue-grade matching engines, fiat DvP connectors, and custody provider integrations are roadmap items in Appendix R. (Source: Appendix Z; Appendix R)

**Q: What backend services ship with ATK?**  
A: Transaction Signer, Portal/API, Hasura GraphQL, The Graph indexer, ERPC/Load Balancer, Blockscout, Observability (metrics/logs/traces), MinIO/S3, PostgreSQL, Redis—delivered via Docker Compose and Helm charts. (Source: Appendix Z; Appendix S)

## Compliance & Regulatory

**Q: How does ATK maintain regulatory compliance across jurisdictions?**  
A: Compliance executes ex-ante in the token path, backed by jurisdictional rule libraries that reflect MiCA, MAS, VARA, U.S. exemptions, and Travel-Rule obligations. Rules update through governed deployments without redeploying tokens. (Source: Appendix A; Part I Ch 4; Part II Ch 8)

**Q: What evidence can auditors access?**  
A: Deterministic on-chain events, Hasura-backed audit views, ISO 20022 message logs, and observability dashboards. Compliance rejections and key actions generate traceable artefacts. (Source: Appendix Z; Appendix B)

## Commercial & Deployment

**Q: How can I deploy ATK?**  
A: Use SettleMint SaaS (console.settlemint.com) for managed operations, or self-host via Docker Compose (local/dev) and Helm charts (production on-prem/BYOC). (Source: Appendix Z; Appendix S)

**Q: What licences apply to self-hosted deployments?**  
A: Open components retain FSL‑1.1‑MIT licensing. Backend services require a proprietary SettleMint licence when self-hosted. Managed SaaS subscribers have the licence bundled. (Source: Appendix S)

**Q: Is pricing information available publicly?**  
A: No. Commercial figures—including pricing, volume discounts, and renewal terms—require direct engagement with SettleMint Sales. (Source: Appendix S)

## Implementation & Integration

**Q: How do developers integrate with ATK?**  
A: Interact directly with contracts, query data via Hasura and subgraphs, and use the Portal/API for ABIs and helper tooling. REST endpoints described in older collateral remain roadmap items. (Source: Appendix Z)

**Q: How do migration paths work if we start on SaaS and move on-prem?**  
A: Appendix Q’s “SaaS → BYOC/on-prem” playbook covers exporting configuration, provisioning infrastructure, running dual writes, cutting over at a specific block height, and auditing parity post cutover. (Source: Appendix Q)

**Q: What roadmap items are planned for integrations?**  
A: Appendix R details planned deliverables including venue-grade matching, fiat DvP connectors, custody provider adapters, and REST API expansion. (Source: Appendix R)

## Integration & Roadmap

**Q: What monitoring and audit capabilities exist today?**  
A: Observability stack (metrics/logs/traces), Blockscout explorer, deterministic events, and Hasura audit views already ship with the kit. (Source: Appendix Z)

**Q: How does ATK compare to “issuance wizards”?**  
A: ATK embeds compliance in the transfer path and ships the runtime services required for production. Point solutions often omit compliant identity handling or lack the backend needed for regulated operations. (Source: Appendix Z)

**Q: Where can I track planned enhancements?**  
A: Appendix R (“Roadmap”) outlines upcoming integrations, compliance extensions, and product surfaces. (Source: Appendix R)
