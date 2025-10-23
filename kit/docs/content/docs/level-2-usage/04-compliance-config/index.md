---
title: Compliance Configuration
description: Configure policy modules, logic expressions, and regional templates
---

<!-- SOURCE: kit/contracts/contracts/smart/modules/ -->
<!-- SOURCE: kit/dapp/src/components/compliance/ -->
<!-- SOURCE: doc-planing-archive/c-ATK_DOCUMENTATION_MASTER_PLAN.md -->
<!-- SOURCE: ASSET_TOKENIZATION_LANGUAGE_GUIDE.md -->

# Compliance Configuration

**These guides translate regulation into policy modules—covering configuration surfaces, logic expressions, and region-ready templates.**

## Roadmap

- [ ] `compliance-modules.md` — Module-by-module configuration, parameters, and verification steps.
- [ ] `logic-expressions.md` — Rule builder tutorial with AND/OR/NOT composition and testing workflow.
- [ ] `country-restrictions.md` — Geo-blocking setup, sanctions lists, and bulk management.
- [ ] `investor-limits.md` — Holder limits, exposure caps, and monitoring dashboards.
- [ ] `transfer-approvals.md` — Manual review queues, SLAs, and escalation loops.

## Inputs to Capture

- Module implementations from `kit/contracts/contracts/smart/modules/`.
- Operator UX from `kit/dapp/src/components/compliance/` and related forms.
- Regional guardrails from Level 1 compliance pages and plan artefacts.

## Delivery Notes

- Each guide must open with the Level 2 procedural pattern (Objective, Prerequisites, Procedure, Verification, SLA).
- Document trusted issuer dependencies prominently, aligning with stakeholder feedback.
- Provide sample logic expressions for MiCA, SEC, MAS, and GCC templates referencing corresponding Level 1 guides.
