---
title: GCC — Regional Regulatory Matrix
description: ADGM, DFSA, VARA, Saudi CMA, and Bahrain CBB requirements with Sharia-compliant controls
---

<!-- SOURCE: the-book-of-dalp/Part IV — Adoption & Execution/Chapter 20 — Regional Playbooks (EU, GCC, Singapore).md -->
<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 8 — Regulatory & Legal Framework, Turn Law Into Softwaretitled.md -->
<!-- SOURCE: kit/docs/content/docs/level-1-generic/04-compliance-identity/index.md -->
<!-- SOURCE: kit/docs/content/docs/level-1-generic/02-architecture/compliance-framework.md -->

# GCC — Regional Regulatory Matrix

**Gulf Cooperation Council jurisdictions operate under license-first regimes. The Asset Tokenization Kit delivers ADGM, DFSA/VARA, Saudi CMA, and Bahrain CBB templates so offerings inherit the correct licensing, data residency, and Shariah controls from day one.**

## Regulatory Overview

- **License-first onboarding** — ADGM, DFSA, and VARA require activity-specific permissions before launch; the setup wizard locks obligations to the selected license (Chapter 20).
- **Regional differentiation** — Saudi CMA mandates local presence and ownership thresholds, while Bahrain CBB offers sandbox pathways for innovation (Chapter 20; Chapter 8).
- **Data residency & IAM** — On-prem/BYOC deployments satisfy regional residency rules, with enterprise IAM integration for bank-grade audit trails (Chapter 20).
- **Islamic finance alignment** — Built-in Shariah eligibility checks ensure profit distribution structures align with Islamic finance requirements (compliance-framework.md).

## GCC Compliance Comparison Matrix

| Jurisdiction | License Focus | Key Regulatory Obligations | Shariah Considerations | ATK Automation |
|--------------|---------------|----------------------------|------------------------|----------------|
| **ADGM (Abu Dhabi)** | Financial Services Permission (multiclass) | Risk-based capital, client asset segregation, ongoing reporting to FSRA | Supports Sukuk structures with profit-sharing templates | License wizard sets obligations; audit bundles capture FSRA filings |
| **DFSA / VARA (Dubai)** | Separate permissions for dealing, arranging, advising, managing | Venue pre-approval, marketing restrictions, technology risk assessments | Shariah screening via claim topics for trading pairs | Venue allow-lists, marketing geofencing, TRM evidence packs |
| **Saudi CMA** | Capital Market Institution license, local office | Majority Saudi ownership, board approvals, transaction reporting | Profit distribution aligned with Tawarruq/Murabaha structures | OnchainID role controls, localized reporting scheduler |
| **Bahrain CBB** | Crypto Asset Service Provider (Class A/B) & sandbox | Cybersecurity audits, financial resource requirements, sandbox reporting cadence | Shariah-compliant sandbox testing with capped exposures | Sandbox mode with capped transaction limits and auto-reports |

## Shariah Compliance Implementation

- **Eligibility claims** — Claim topics capture Shariah board approvals and asset screening results before tokens are tradeable (compliance-framework.md).
- **Profit distribution controls** — Yield modules support profit-sharing schedules that align with Murabaha and Ijara structures (index.md).
- **Audit-ready evidence** — Reporting bundles include Shariah board opinions and profit allocation proofs for Islamic finance committees (Chapter 20).

## Operational Playbook

1. **Select jurisdiction template** — Choose ADGM, DFSA/VARA, Saudi CMA, or Bahrain CBB to seed licensing requirements and reporting cadence (Chapter 20).
2. **Configure deployment model** — Apply on-prem or BYOC topology to meet data residency mandates (Chapter 20).
3. **Attach Shariah claims** — Require Islamic finance approval claims before investor onboarding where applicable (compliance-framework.md).
4. **Enable venue fencing** — Restrict secondary trading to regulator-approved venues and P2P boards (Chapter 20).
5. **Schedule regulator filings** — Automate FSRA, DFSA, CMA, or CBB submissions with evidence bundles (Chapter 20; Chapter 8).

## Checklist for GCC Launch

- [ ] License application submitted with supporting compliance documentation.
- [ ] Operational policies aligned with local AML/CFT standards and record retention.
- [ ] Shariah governance committee engaged with outcomes stored in evidence bundles.
- [ ] Data residency controls validated by infrastructure team.
- [ ] Venue and counterparty lists approved by regulator.
- [ ] Reporting calendar configured for ongoing supervision.

By encoding license obligations, Shariah checks, and venue controls into platform workflows, ATK accelerates GCC go-lives while keeping regulators and Islamic finance stakeholders aligned.

