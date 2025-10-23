---
title: Stablecoin Workflows
description: Operational playbooks for minting, collateral management, and peg stability
---

<!-- SOURCE: kit/contracts/contracts/assets/stablecoin/ -->
<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 18 — Data, Evidence, and Operational Truth (Going Deeper).md -->

# Stablecoin Workflows

**These guides orchestrate minting, collateral oversight, peg maintenance, and redemption for ATK stablecoins.**

## Roadmap

- [ ] `minting.md` — Authorise collateral, mint tokens, and record issuance events.
- [ ] `collateral.md` — Monitor reserves, execute adjustments, and document attestations.
- [ ] `pegging.md` — Detect price deviation, trigger stabilisation actions, and report outcomes.

## Delivery Notes

- Reference collateral and oracle hooks in `kit/contracts/contracts/assets/stablecoin/`.
- Document integration points with banking/custody runbooks for reserve movements.
- Include incident response steps for depegging scenarios.
