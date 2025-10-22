---
title: Architecture Overview
description: Guided tour of the DALP foundation, infrastructure services, and delivery experience
---

<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 1 — Issuance & Lifecycle, from Zero to Regulated Asset.md -->
<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 3 — Custody & Wallet Management, Bank‑Grade Key Control.md -->
<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 4 — Settlement & Interoperability, T+0 Is the Baseline.md -->
<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 7 — User & Developer Experience (UXDX) Speed Without Chaos.md -->

# Architecture Overview

**SettleMint’s Digital Asset Lifecycle Platform (DALP) is designed as a three-layer control plane—SMART protocol, system infrastructure, and delivery interfaces—so regulated institutions can operate compliant digital securities without building glue code. Every layer is anchored to open standards such as ERC‑3643 for permissioned identity and ERC‑20 for market interoperability.**

## In This Section

- [Three-Layer Model](./three-layer-model) explains how SMART protocol primitives, system contracts, and asset templates compose into a lifecycle-controlled platform and why ERC‑3643/734/735 standards give banks a proven assurance baseline.
- [Compliance Framework](./compliance-framework) details how jurisdictional logic, eligibility checks, and audit evidence are encoded directly in the transfer path.
- [Chain-Agnostic Deployment](./chain-agnostic) covers how the kit ships on any EVM network while preserving the same controls, observability, and integration surface.
- [Enterprise Capabilities](./enterprise-capabilities) highlights IAM, automation, and operational tooling that keep deployment and runbook practices bank-grade.
- [Identity & Claims](../04-compliance-identity/identity-onchainid) shows how OnchainID, trusted issuer registries, and reusable claims underpin every policy decision.

## Why This Matters

Institutions can move from pilot to production without re-architecting. Lifecycle workflows, custody policies, ISO 20022 settlement, and UX/DX guardrails arrive pre-integrated, letting teams focus on product design and regulatory approvals instead of stitching protocols together.
