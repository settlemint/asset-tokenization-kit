---
title: Singapore — MAS Compliance Roadmap
description: Payment Services Act, Securities and Futures Act, and sandbox pathways encoded in the Asset Tokenization Kit
---

<!-- SOURCE: the-book-of-dalp/Part IV — Adoption & Execution/Chapter 20 — Regional Playbooks (EU, GCC, Singapore).md -->
<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 8 — Regulatory & Legal Framework, Turn Law Into Softwaretitled.md -->
<!-- SOURCE: kit/docs/content/docs/level-1-generic/04-compliance-identity/index.md -->
<!-- SOURCE: kit/docs/content/docs/level-1-generic/05-asset-classes/stablecoins.md -->

# Singapore — MAS Compliance Roadmap

**Singapore’s Monetary Authority (MAS) offers a clear framework for digital asset activities. The Asset Tokenization Kit encodes Payment Services Act (PSA) and Securities and Futures Act (SFA) requirements so classification, licensing, and reporting stay synchronized with regulatory expectations.**

## Regulatory Overview

- **Dual-regime classification** — Determine if the instrument is a Digital Payment Token under the PSA or a capital markets product under the SFA before onboarding (Chapter 20; Chapter 8).
- **Fit-and-proper checks** — MAS-aligned KYC/AML, Travel Rule messaging, and suspicious transaction monitoring run as part of onboarding and ongoing operations (Chapter 20).
- **Stablecoin framework** — Full reserve backing, prompt redemption, and disclosure of reserve composition are enforced for regulated stablecoins (index.md; stablecoins.md).

## Core Obligations

- **Payment Services Act (PSA)**
  - Licensing for Digital Payment Token (DPT) service providers (Chapter 20).
  - Implementation of Travel Rule messaging for inter-VASP transfers (Appendix D — TRAVEL_RULE_VASP_TO_VASP).
  - Technology risk management (TRM) reporting and incident notifications (Chapter 8).

- **Securities and Futures Act (SFA)**
  - Prospectus requirements unless exemptions apply (Chapter 20).
  - Capital markets services license for dealing, advising, or fund management (Chapter 8).
  - Continuous disclosure of material changes and corporate actions (index.md).

- **Sandbox & FinTech Regulatory Reboot**
  - Sandbox Express and bespoke sandbox options for novel models with defined testing windows (Chapter 20).
  - Graduated obligations that ramp to full licensing as operations scale (Chapter 20).

## Singapore Deployment Roadmap

| Phase | Objective | Key Activities | ATK Automation | Source |
|-------|-----------|----------------|----------------|--------|
| 1. Classification | Determine PSA vs. SFA pathway | Use jurisdiction wizard to map token type and services | Asset template selection | Chapter 20 |
| 2. Licensing Prep | Gather fit-and-proper documentation | Trigger KYC/KYB workflows, compile governance pack | Identity registry + evidence bundles | Chapter 20; Chapter 8 |
| 3. Sandbox Entry (optional) | Secure Sandbox Express or bespoke approval | Define testing scope, set transaction caps, configure reporting | Configurable limits + alerting | Chapter 20 |
| 4. Full Authorization | Transition to permanent license | Migrate sandbox settings to production caps, finalize TRM submissions | Automated compliance modules | Chapter 20 |
| 5. Continuous Operations | Maintain MAS reporting cadence | Schedule suspicious transaction reports, technology audits, reserve attestations | Reporting scheduler + disclosure packs | Chapter 8; index.md |

## Licensing Matrix

| Activity | PSA License | SFA License | ATK Control |
|----------|-------------|-------------|-------------|
| DPT exchange or brokerage | Major Payment Institution (DPT) | N/A | Compliance modules enforce Travel Rule and customer limits |
| Custody of digital assets | Major Payment Institution (DPT) | Capital Markets Services (custody) | Custodian extension + audit bundles |
| Tokenized securities issuance | N/A | Capital Markets Services (dealing in capital markets products) | Investor eligibility modules + prospectus tracking |
| Fund tokenization/management | N/A | Capital Markets Services (fund management) | NAV automation + reporting scheduler |

## Key Controls Implemented by ATK

- **Classification guardrails** — PSA/SFA decision tree built into asset creation flow ensures correct obligations apply (Chapter 20).
- **Identity and TRM** — Onboarding pipeline verifies KYC/AML requirements, enforces Travel Rule, and anchors audit trails (Chapter 20; Appendix D).
- **Reserve evidence** — Stablecoin templates store reserve attestations and redemption SLAs inside disclosure bundles (stablecoins.md; Chapter 8).
- **Reporting automation** — Scheduler handles MAS reporting frequencies, audit submissions, and sandbox updates (index.md).

## MAS Compliance Checklist

1. Map offering to PSA or SFA path and capture rationale.
2. Collect fit-and-proper evidence for directors, shareholders, and key staff.
3. Configure Travel Rule, suspicious activity monitoring, and TRM procedures.
4. Establish reserve attestation cadence for stablecoin or stored-value products.
5. Register for MAS sandbox if piloting innovative models; define exit criteria.
6. Transition to full licensing with updated obligations and record retention.

The roadmap keeps classification, licensing, and ongoing obligations synchronized so Singapore operations remain compliant without manual policy rewrites.

