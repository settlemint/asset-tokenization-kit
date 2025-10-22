---
title: United States — SEC Exemptions
description: Structuring U.S. offerings across Reg D, Reg S, Reg CF, and Reg A+ with automated compliance guardrails
---

<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 8 — Regulatory & Legal Framework, Turn Law Into Softwaretitled.md -->
<!-- SOURCE: the-book-of-dalp/Part I — The Why/Chapter 4 — Compliance as Code (ERC‑3643 inside the DALP).md -->
<!-- SOURCE: kit/docs/content/docs/level-1-generic/04-compliance-identity/index.md -->
<!-- SOURCE: kit/contracts/contracts/smart/modules/README.md -->
<!-- SOURCE: kit/contracts/contracts/system/ATKTopics.sol -->

# United States — SEC Exemptions

**The United States requires clear exemption selection and airtight transfer controls. The Asset Tokenization Kit packages Reg D, Reg S, Reg CF, and Reg A+ pathways into configurable templates so offerings stay compliant from subscription through secondary liquidity.**

## Offering Decision Tree

```mermaid
flowchart TD
    A[Start: Define U.S. Offering] --> B{Target investors?}
    B -->|Accredited only| C[Consider Regulation D 506(b)/(c)]
    B -->|Global, exclude U.S.| D[Consider Regulation S]
    B -->|Retail, <$5M| E[Consider Regulation CF]
    B -->|Scaled retail, <$75M| F[Consider Regulation A+]
    C --> G{Need general solicitation?}
    G -->|Yes| C1[Use 506(c) with verification claims]
    G -->|No| C2[Use 506(b) with pre-existing relationships]
    E --> H[Set issuer limits & Form C filings]
    F --> I{Tier?}
    I -->|Tier 1 ≤ $20M| I1[State review + Form 1-A]
    I -->|Tier 2 ≤ $75M| I2[SEC review + ongoing reports]
    D --> J[Apply distribution compliance period]
    C1 --> K[Issue accreditation claims via ATKTopics]
    C2 --> K
    J --> L[Maintain non-US person claims]
```

## Regulation D (Rules 506(b) and 506(c))

- **Who it serves** — Accredited investors or up to 35 sophisticated investors without general solicitation (index.md).
- **Key limits** — 506(c) mandates third-party or documented accreditation verification before closing (index.md; ATKTopics.sol:38-56).
- **ATK enforcement** — Accreditation claims attach to OnchainID identities, investor-count and lock-up modules manage 6–12 month holding periods (Chapter 4; modules/README.md).
- **Filing cadence** — Form D automation populates required fields and timestamps submissions for EDGAR evidence bundles (index.md).

## Regulation S (Offshore Offerings)

- **Who it serves** — Non-U.S. persons with risk-based distribution compliance periods (index.md).
- **Key limits** — Category 1/2/3 classifications determine how long tokens remain restricted; venue controls block U.S.-linked venues (Chapter 8).
- **ATK enforcement** — Geo-fencing claims identify non-U.S. status while venue-allow lists limit trading to approved platforms (Chapter 4; modules/README.md).

## Regulation CF (Crowdfunding)

- **Who it serves** — Broad retail participation up to **$5 million** in a 12-month period (index.md; modules/README.md).
- **Key limits** — Investor-level caps based on income/net worth, use of registered funding portals, annual reporting obligations (index.md).
- **ATK enforcement** — Supply-limit module tracks the $5M ceiling in USD and investor-count module enforces per-investor limits (modules/README.md).

## Regulation A+ (Mini-IPOs)

- **Who it serves** — Retail investors via Tier 1 (≤$20M) and Tier 2 (≤$75M) offerings with lighter ongoing obligations than full S-1 (index.md).
- **Key limits** — Tier 2 requires ongoing audited financials and Form 1-K/1-SA filings; Tier 1 involves state-level review (index.md; Chapter 8).
- **ATK enforcement** — Reporting scheduler tracks periodic filings, while transfer controls maintain secondary trading locks until qualification (Chapter 4).

## State-Level Coordination (Blue Sky)

- **Notice filings** — Index automation prepares state notice filings for Tier 1 Reg A+ and 506 offerings where required (index.md).
- **Pre-emption logic** — Platform flags states without federal pre-emption so legal can coordinate NASAA registrations (Chapter 8).
- **Audit evidence** — Evidence bundles capture filing confirmations, timestamps, and jurisdictional coverage for state regulators (Chapter 4).

## Operational Checklist

| Step | Action | ATK Control | Source |
|------|--------|-------------|--------|
| 1 | Choose exemption (Reg D/S/CF/A+) | Jurisdiction template wizard | Chapter 8 |
| 2 | Configure investor claims (accreditation, non-US, portal eligibility) | OnchainID + ATKTopics claims | ATKTopics.sol; Chapter 4 |
| 3 | Set supply/investor limits (e.g., $5M Reg CF, lock-ups) | Supply & investor-count modules | modules/README.md |
| 4 | File required forms (Form D, Form C, Form 1-A) | Filing automation & evidence bundles | 04-compliance-identity/index.md |
| 5 | Activate secondary trading controls (distribution compliance, ATS gating) | Venue allow-lists & time-based locks | Chapter 4; Chapter 8 |
| 6 | Schedule ongoing reports (annual/semi-annual) | Reporting scheduler + alerts | 04-compliance-identity/index.md |

## Control Library Highlights

- **ATKTopics accreditation + non-US claims** connect identity checks directly to exemption eligibility (ATKTopics.sol).
- **SupplyLimitComplianceModule** enforces $5M caps, lockups, and tiered limits per exemption (modules/README.md).
- **Evidence bundles** compile filings, approvals, reason codes, and timestamps for regulators and auditors (Chapter 4; Chapter 8).

By codifying U.S. exemptions into identity claims, investor limits, and automated filings, teams can scale compliant distribution without recreating legal and operational workflows for every offering.

