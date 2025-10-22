---
title: Deployment Options
description: SaaS, Docker Compose, and Helm pathways with sanctioned migration playbooks
---

<!-- SOURCE: the-book-of-dalp/Part V - Appendices/Appendix S — Licensing & Deployment Options.md -->
<!-- SOURCE: the-book-of-dalp/Part V - Appendices/Appendix Q — Migration Playbooks.md -->

# Deployment Options

| Deployment model | What ships | Control surface |
|------------------|------------|-----------------|
| **SettleMint SaaS** | Managed backend services via console.settlemint.com | SettleMint operates runtime; customers configure compliance, identity, and asset lifecycle |
| **Self-hosted (Docker Compose)** | Local/dev stack for evaluation and pilot builds | Runs inside customer perimeter; ideal for proofs of concept and regulated sandboxes |
| **Self-hosted (Helm on Kubernetes)** | Full production footprint for on-prem or BYOC deployments | Customer controls infrastructure, networking, and data residency |

**Key considerations**

- Contracts, charts, and other open components remain available under their published licences in every model.
- Backend services (Transaction Signer, Portal/API, runtime services) require a proprietary SettleMint licence when self-hosted.
- SaaS subscribers do not sign a separate on-prem licence; usage is covered in the subscription agreement.
- Contact `support@settlemint.com` for licensing questions tied to self-hosted deployments.

## Migration Pathways

Appendix Q (“SaaS → BYOC/on-prem”) defines the sanctioned migration flow:

1. Export tenant configuration, rotate secrets, and stage infrastructure.
2. Hydrate services, connect the identity provider, and dry-run lifecycle operations.
3. Execute a dual-write cutover at a defined block height, verify queues, and flip DNS.
4. Audit events, webhooks, and cap-table state post cutover.
