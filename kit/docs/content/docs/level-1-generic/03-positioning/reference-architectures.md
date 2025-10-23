---
title: Reference Architectures
description: Client-ready blueprints that show how institutions launch ATK with predictable timelines, integrations, and outcomes
---

<!-- SOURCE: the-book-of-dalp/Part IV — Adoption & Execution/Chapter 21 — Reference Implementations (Copy These Into Your RFP).md -->
<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 16 — Integration Patterns (Banking, Custody, Venues).md -->

# Reference Architectures

**These reference architectures show how institutions structure ATK deployments end to end—what goes live, why stakeholders back the programme, and which artefacts satisfy boards and regulators.**

---

## Institutional Bond Spine — Launch Regulated Debt in Days

- **Designed for:** Capital-markets teams that want to issue €100M-class bonds without multi-vendor programmes.
- **Value delivered:** ≥99% first-attempt settlement with T+0 finality wherever tokenized cash is connected, plus ready-made audit evidence. ✓ Chapter 21
- **What goes live:** Bond template, trusted issuer-backed identity registry, Ready-for-Exchange adapter, ISO 20022 cash translator, automated coupon servicing.
- **Integration highlights:** Straight-through ISO 20022 messaging, eligibility ticket sync to ATS/MTF venues, regulator-ready evidence bundles.
- **Typical timeline:** Offering documents, KYC/AML onboarding, and allocation minting complete in a go-live measured in days (Chapter 21).

Clients retain full control while replacing manual reconciliation with programmable settlement.

---

## Periodic NAV Fund Automation — Keep Windows On Schedule

- **Designed for:** Asset managers who need predictable subscription/redemption windows and real-time regulatory oversight.
- **Value delivered:** Lifecycle automation with alerts before thresholds breach; investor classes enforced without extra headcount. ✓ Chapter 21
- **What goes live:** Fund template, NAV scheduler, rule-library alerts, optional bulletin-board liquidity module, AUM threshold monitoring.
- **Integration highlights:** Treasury flows for subscriptions/redemptions, portfolio valuation feeds, compliance dashboards for alert review.
- **Typical timeline:** NAV windows and investor gates configured in a phased rollout measured in weeks rather than quarters (Chapter 21).

Investors enjoy reliable liquidity, while compliance teams monitor every step from one control plane.

---

## On-Chain Equity Governance — Make the Cap Table Canonical

- **Designed for:** Corporates replacing spreadsheets with a regulated, audit-grade equity stack.
- **Value delivered:** Record-date voting, instant buybacks/redemptions, and zero cap-table drift after settlement. ✓ Chapter 21
- **What goes live:** Equity template with governance hooks, record-date snapshot service, freeze → calculate → pay → burn corporate-action engine.
- **Integration highlights:** HRIS/ERP roster feeds, board portal notifications, treasury payout rails, legal approvals.
- **Typical timeline:** Governance digitisation begins as soon as templates are live; corporate actions deploy once notification flows are authorised (Chapter 21).

Boards receive real-time visibility, and regulators see evidence for every decision.

---

## Banking & Venue Connectivity — Keep Compliance in Every Hand-Off

- **Designed for:** Institutions that need fiat rails, custodians, and trading venues tied into the same compliance engine.
- **Value delivered:** Seamless Delivery-versus-Payment, exchange-grade settlement, and custodial transparency without manual reconciliation. ✓ Chapter 16
- **What goes live:** Fiat DvP bridge, venue settlement loop, omnibus custody attestation service.
- **Integration highlights:** ISO 20022-confirmed cash instructions, venue eligibility tickets, custodian attestations that maintain beneficial-ownership visibility.
- **Typical timeline:** Connectivity activates as soon as counterparties complete onboarding and reconciliation tests (Chapter 16).

Regulators receive the same evidence regardless of which external party touches the asset.

---

## Why clients rely on these blueprints

- **Predictable delivery:** Budgets and timelines stay within the windows above because the implementations avoid bespoke forks (Chapter 21).
- **Evidence on demand:** Every architecture ships with the metrics and artefacts referenced in the Level 1 KPI catalogue, simplifying board and regulator briefings.
- **Scalable foundation:** Once live, the same controls extend to new jurisdictions and asset types without rebuilding policy, identity, or integration layers.

These reference architectures help institutions move from exploration to production with confidence that every stakeholder—commercial, operational, and regulatory—can verify the outcome.
