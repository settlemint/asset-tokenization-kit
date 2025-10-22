---
title: Metrics & ROI
description: KPI catalogue, ROI calculator, and expansion evidence for executive diligence
---

<!-- SOURCE: the-book-of-dalp/Part IV — Adoption & Execution/Chapter 22 — Metrics & OKRs, Evidence You're Winning (or Not).md -->
<!-- SOURCE: the-book-of-dalp/Part IV — Adoption & Execution/Chapter 23 — Execution Blueprint, From First Markets to Scale.md -->
<!-- SOURCE: the-book-of-dalp/Part I — The Why/Chapter 2 — The Digital Asset Lifecycle Platform (DALP).md -->
<!-- SOURCE: kit/docs/content/docs/level-1-generic/01-overview/platform-capabilities.md -->

# Metrics & ROI

> **Documentation Status Note:** Some ROI metrics below are illustrative targets pending validation with production deployments. Metrics directly sourced from Chapter 22 are marked with ✓. Illustrative targets are marked with [PENDING VALIDATION].

**ATK proves value with measurable outcomes. This dashboard captures every KPI we monitor, the ROI deltas that win procurement cycles, and a reusable calculator for customer conversations.**

## KPI Catalogue

| Domain | KPI | Target | Source |
|--------|-----|--------|--------|
| Trust & Compliance | Regulatory incidents | 0 | ✓ Chapter 22 |
| Trust & Compliance | Compliance block rate | 100% blocked / >95% automated approvals | ✓ Chapter 22 |
| Trust & Compliance | KYC turnaround | < 1 day (minutes for low-risk) | ✓ Chapter 22 |
| Liquidity & Execution | First-attempt settlement | ≥ 99% | ✓ Chapter 22 |
| Liquidity & Execution | T+0 share | ~99% where tokenized cash exists | ✓ Chapter 22 |
| Operations | Platform uptime | ≥ 99.9% | ✓ Chapter 22 |
| Operations | Custody integration latency | < 1 second | ✓ Chapter 22 |
| Operations | Corporate actions on schedule | 100% | ✓ Chapter 22 |
| Adoption | Issuances per quarter & AUM | Tracked per jurisdiction | ✓ Chapter 22 |
| Adoption | White-label tenants & migrations | SaaS ↔ BYOC ↔ on-prem | ✓ Chapter 22 |
| Adoption | Developer DX | >90% wizard completion; high documentation satisfaction | ✓ Chapter 22 |

## Verified ROI Outcomes

| Business Impact | Traditional Baseline | ATK Outcome | Improvement | Source |
|-----------------|---------------------|-------------|-------------|--------|
| Settlement success rate | Manual reconciliation with inconsistent finality | ≥99% first-attempt settlement | **Reliability ≥99%** | ✓ Chapter 22 |
| Settlement timing | T+2 batch processing | T+0 where tokenized cash exists | **Move from T+2 to T+0** | ✓ Chapter 22 |
| Compliance throughput | Manual review queues | >95% approvals auto-handled | **Automation >95%** | ✓ Chapter 22 |
| Governance reconciliation | Fragmented cap table updates | 0 cap-table drift post-settlement | **Real-time accuracy** | ✓ Part I, Chapter 2 |

## Targets Pending Validation

| Target | Traditional Baseline | Aspirational ATK Outcome | Status |
|--------|---------------------|---------------------------|--------|
| Total cost of ownership reduction | $2–5M initial + $100K/month OpEx | $50–250K initial + <$10K/month (≈95% reduction) | [PENDING VALIDATION — requires finance confirmation] |
| Operations efficiency gain | 20–40% of operations on reconciliation | <2% oversight effort (≈90% efficiency gain) | [PENDING VALIDATION — awaiting production telemetry] |

*Note: Targets above are business hypotheses and do not appear in Chapter 22. Keep them segregated from verified metrics until finance and delivery teams provide source data. The “99% faster settlement” claim remains deprecated; the validated statement is T+0 capability where tokenized cash exists.*

## ROI Calculator (Reusable Tool)

> **Note:** This calculator provides formulas for ROI estimation. An interactive Excel/web tool is pending development.

| Step | What to Capture | Formula / Guidance |
|------|-----------------|--------------------|
| 1. Baseline Costs | Annualised OpEx + amortised CapEx for existing stack | `Baseline = (Annual OpEx × 3) + CapEx` |
| 2. ATK Scenario | Annualised OpEx + subscription/hosting for ATK deployment | `ATK = (ATK OpEx × 3) + Deployment Fee` |
| 3. ROI Summary | Savings + Payback | `Savings = Baseline – ATK`<br>`ROI % = (Savings / ATK) × 100`<br>`Payback (months) = Deployment Fee / (Monthly Savings)` |

> **How to use:** Populate the table in customer workshops, drop the formulas into a spreadsheet, and pair results with the KPI catalogue to evidence operational improvements.

## Volume & Adoption Tracker

> **Note:** Actual volume statistics require production deployment data. Framework provided for tracking.

- **Issuances & AUM:** Monitor quarterly issuance count, assets under management, and cumulative on-chain exposure per jurisdiction (✓ Chapter 22).
- **Tenant Mix:** Track number of branded enterprise stacks versus white-label partners and migrations between SaaS, BYOC, and on-prem deployments (✓ Chapter 22).
- **Developer Activation:** Watch time-to-first-call, sandbox usage, and wizard completion rate (>90%) to prove market readiness (✓ Chapter 22).

## Geographic Expansion Evidence

| Phase | Focus Markets | Outcome Signals | Source |
|-------|---------------|-----------------|--------|
| Phase 1 – Spine | Initial jurisdiction | KYC < 1 day, uptime ≥ 99.9% | ✓ Chapter 23 |
| Phase 2 – Distribution | Multi-region (EU, SG, GCC) | 0 post-facto compliance incidents | ✓ Chapter 23 |
| Phase 3 – Liquidity & Custody | Venue integration + custody partners | ≥99% first-attempt settlement, custody uptime ≥99.9% | ✓ Chapter 23 |
| Phase 4 – Scale | EU, GCC, SG expansion + additional jurisdictions | T+0 standard, regulators accept e-filings | ✓ Chapter 23 |

## Evidence Kit Checklist

- [x] KPI catalogue updated with latest operational telemetry
- [ ] ROI calculator tool to be developed (formulas provided)
- [ ] Volume dashboard awaiting production data
- [x] Geographic expansion metrics reviewed against phase gates

Use this page as the single source of truth for board packs, procurement reviews, and commercial negotiations.
