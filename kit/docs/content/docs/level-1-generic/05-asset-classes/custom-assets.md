---
title: Custom Asset Blueprints
description: Extend ATK with institution-specific instruments while keeping compliance and lifecycle controls intact
---

<!-- SOURCE: kit/contracts/contracts/assets/README.md -->
<!-- SOURCE: kit/contracts/contracts/smart/README.md -->
<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 1 — Issuance & Lifecycle, from Zero to Regulated Asset.md -->

# Custom Asset Blueprints

**ATK’s asset templates cover the most common institutional instruments, but the SMART protocol foundation lets you introduce new products by composing the same identity, compliance, and lifecycle controls.** This page explains how enterprises shape bespoke assets without giving up regulator-grade guarantees.

## What stays constant

- **SMART core and extensions** deliver ERC-3643 security token behaviour with plug-and-play modules for burning, pausing, voting, collateralisation, yield, and more (`kit/contracts/contracts/smart/README.md`).  
- **Lifecycle orchestration** across issuance, servicing, and redemption is already wired through the ATK asset framework (`kit/contracts/contracts/assets/README.md`).  
- **Identity-first compliance** keeps OnchainID registries, trusted issuer claims, and transfer checks in the transaction path, so new instruments reuse the same enforcement model (Chapter 1 — Issuance & Lifecycle).

These foundations guarantee that any customised instrument continues to meet the operational, audit, and governance requirements documented across Level 1.

## Where you extend

- **Select the right SMART extensions.** Combine capabilities such as `Redeemable`, `Collateral`, `Yield`, or `Votes` to express redemption flows, backing requirements, distribution logic, or governance rights found in the target product (`kit/contracts/contracts/smart/README.md`).  
- **Configure compliance modules and topics.** Map eligibility rules, jurisdictional limits, and claim topics so the compliance engine enforces the same obligations your legal teams uphold today (Chapter 1 — Issuance & Lifecycle).  
- **Define servicing rules.** Align coupon schedules, fee accrual, or maturity events with the automation hooks already present in the ATK asset layer (`kit/contracts/contracts/assets/README.md`).  
- **Wrap in an ATK factory.** Each custom asset ships through the proxy/factory pattern shown in the asset directory structure, allowing governance teams to deploy, upgrade, and monitor it alongside the stock templates (`kit/contracts/contracts/assets/README.md`).

## Business design checklist

1. **Identify the economic promises.** Document payout schedules, voting rights, redemption mechanics, and collateral expectations your instrument must honour.  
2. **Choose extension primitives.** Decide which SMART modules cover those promises and whether any additive logic belongs in the addon layer (`kit/contracts/contracts/smart/README.md`).  
3. **Bind compliance artefacts.** Link the instrument to the claim topics, trusted issuers, and rule modules that regulators require, mirroring the approach used in the existing asset templates (`kit/contracts/contracts/assets/README.md`).  
4. **Confirm servicing automation.** Ensure issuance, corporate actions, and redemption link into ATK’s historical balance tracking and audit trails, so reconciliation stays automatic (Chapter 1 — Issuance & Lifecycle).  
5. **Run governance reviews.** Because custom assets still use ATK factories and access-control roles, you can route approvals through the same board, risk, and regulator processes as any standard template (`kit/contracts/contracts/assets/README.md`).

## When to build vs. adapt

- **Adapt a stock template** if the instrument shares 80% of its lifecycle with bonds, equity, funds, stablecoins, or deposits—extend it with additional modules or addon services.  
- **Build a dedicated blueprint** when regulators expect bespoke redemption, collateral, or voting logic that is better expressed as a new SMART extension bundle.  
- **Scale safely** by treating every new instrument as part of the same release pipeline—`bun run ci` compiles, tests, and validates artefacts regardless of whether they are stock or custom (`kit/contracts/contracts/assets/README.md`).

Banks, asset managers, and corporates can therefore launch differentiated products without building compliance and identity plumbing from scratch—the SMART protocol ensures every asset, standard or bespoke, behaves like it belongs inside a regulated balance sheet.
