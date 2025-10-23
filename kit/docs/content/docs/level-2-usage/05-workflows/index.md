---
title: Asset Workflows
description: End-to-end operational playbooks for each ATK asset class
---

<!-- SOURCE: kit/contracts/contracts/assets/bond/ -->
<!-- SOURCE: kit/contracts/contracts/assets/equity/ -->
<!-- SOURCE: kit/contracts/contracts/assets/fund/ -->
<!-- SOURCE: kit/contracts/contracts/assets/stablecoin/ -->
<!-- SOURCE: kit/contracts/contracts/assets/deposit/ -->
<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 18 — Data, Evidence, and Operational Truth (Going Deeper).md -->
<!-- SOURCE: doc-planing-archive/c-ATK_DOCUMENTATION_MASTER_PLAN.md -->

# Asset Workflows

**These runbooks sequence every operational step—from issuance to maturity—for each supported asset class.**

## Folder Map

- [`bonds`](./bonds/) — Issuance, coupon servicing, maturity, and emergency procedures.
- [`equity`](./equity/) — Share issuance, voting, dividends, buybacks, and governance overrides.
- [`funds`](./funds/) — Fund creation, NAV calculation, fee collection, and suspension handling.
- [`stablecoins`](./stablecoins/) — Minting, collateral management, peg maintenance, and redemption.
- [`deposits`](./deposits/) — Certificate issuance, yield management, maturity, and early withdrawal.

## Roadmap

- [ ] `bonds/issuance.md`
- [ ] `bonds/maturity.md`
- [ ] `bonds/redemption.md`
- [ ] `equity/share-issuance.md`
- [ ] `equity/voting.md`
- [ ] `equity/dividends.md`
- [ ] `funds/fund-creation.md`
- [ ] `funds/nav-calculation.md`
- [ ] `funds/fee-collection.md`
- [ ] `stablecoins/minting.md`
- [ ] `stablecoins/collateral.md`
- [ ] `stablecoins/pegging.md`
- [ ] `deposits/certificate.md`
- [ ] `deposits/yields.md`

## Delivery Notes

- Cross-reference Level 1 asset overviews for business context and compliance expectations.
- Highlight prerequisites (roles, compliance modules, integrations) at the top of each workflow.
- Include contingency procedures (pause, freeze, emergency transfer) within each asset guide.
