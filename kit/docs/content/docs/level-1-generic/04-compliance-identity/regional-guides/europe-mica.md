---
title: European Union — MiCA Playbook
description: MiCA obligations, €8M issuance limits, and automated compliance workflows for EU distribution
---

<!-- SOURCE: the-book-of-dalp/Part IV — Adoption & Execution/Chapter 20 — Regional Playbooks (EU, GCC, Singapore).md -->
<!-- SOURCE: the-book-of-dalp/Part II — The Architecture/Chapter 8 — Regulatory & Legal Framework, Turn Law Into Softwaretitled.md -->
<!-- SOURCE: the-book-of-dalp/Part V - Appendices/Appendix D — Compliance Rule Templates (CopyPaste YAML).md -->
<!-- SOURCE: kit/contracts/contracts/smart/modules/TokenSupplyLimitComplianceModule.sol -->
<!-- SOURCE: kit/docs/content/docs/level-1-generic/04-compliance-identity/index.md -->

# European Union — MiCA Playbook

**Markets in Crypto-Assets Regulation (MiCA) creates a single perimeter for crypto-assets across EU27. The Asset Tokenization Kit encodes MiCA requirements into issuance limits, disclosure workflows, passporting logic, and reserve controls so violations are blocked before execution.**

## Regulatory Snapshot

- **Scope alignment** — MiCA applies where products fall outside existing securities regimes; tokenized securities still follow MiFID II/MiFIR, Prospectus Directive, CSDR, and eWpG requirements (Chapter 20; Chapter 8).
- **Authorization choices** — Crypto-asset service providers (CASPs) decide between full authorization or lighter regimes when issuance stays below MiCA thresholds (Chapter 20).
- **Parallel compliance** — GDPR privacy handling and DLT Pilot permissions operate alongside MiCA obligations (Chapter 8).

## Key Thresholds and Caps

- **€8M lifetime issuance cap** for non-authorized issuers with automatic stop when totals reach the regulatory ceiling (TokenSupplyLimitComplianceModule.sol:18-46).
- **Rolling issuance monitoring** using supply-limit modules to enforce per-period caps and aggregate reporting (TokenSupplyLimitComplianceModule.sol:37-113).
- **Alerting near thresholds** through policy templates that trigger compliance notifications before breaches (Appendix D — EU_THRESHOLD_ALERT).

## Whitepaper and Disclosure Workflow

1. **Draft MiCA whitepaper** with risk, rights, and technology disclosures; prepare 20-day submission buffer before marketing (index.md).
2. **File with national competent authority** while the platform freezes outbound marketing until approval is confirmed (Chapter 20).
3. **Publish approved whitepaper** across distribution channels with immutable evidence stored in disclosure bundles (Chapter 8).

## Marketing and Investor Restrictions

- **Geo-fenced promotion** — marketing modules restrict outreach to EU jurisdictions until filings clear (Chapter 20).
- **Holder caps and eligibility** — investor category claims enforce professional/retail segmentation and 150-holder thresholds when using private placement wrappers (Appendix D — EU_PP_MAX_INVESTORS).
- **Alert-driven campaign control** — compliance engine pauses campaigns automatically when alerts signal threshold drift (Appendix D — EU_THRESHOLD_ALERT).

## Custody and Reserve Controls

- **Segregated reserves** for asset-referenced and e-money tokens with daily attestation hooks inside the operations runbooks (index.md).
- **On-chain reserve evidence** captured through audit bundles that pair policy configuration with balance attestations (Chapter 8).
- **Trusted custodian workflows** leveraging emergency hooks (`Custodian` extension) to freeze assets if reserve breaches are detected (TokenSupplyLimitComplianceModule.sol; Appendix D).

## Passporting and Cross-Border Distribution

- **Single authorization** unlocks distribution across EU27 with venue adapters applying local disclosures (index.md).
- **P2P board bridging** maintains the same compliance gates when listings are not possible on regulated venues (Chapter 20).
- **DLT Pilot integration** allows trading and settlement on distributed ledgers without exiting MiFID infrastructure (Chapter 20; Chapter 8).

## MiCA Compliance Checklist

| Step | What to Deliver | ATK Automation | Primary Source |
|------|-----------------|----------------|----------------|
| Authorization scope | Confirm product classification (security vs. crypto-asset) | Jurisdiction template wizard applies correct rule set | Chapter 20 |
| Issuance cap | Configure €8M limit and alert thresholds | `TokenSupplyLimitComplianceModule` enforces supply ceilings | TokenSupplyLimitComplianceModule.sol |
| Whitepaper filing | Submit draft ≥20 days before marketing | Compliance workflows block promotions until approval | 04-compliance-identity/index.md |
| Reserve management | Link attestation schedule to disclosure pack | Evidence bundles capture reserve proofs | Chapter 8 |
| Marketing controls | Geo-fence outreach and investor onboarding | Rule templates gate campaigns by jurisdiction | Chapter 20; Appendix D |
| Passporting packet | Prepare distribution kit for EU27 venues | Venue adapters reuse approved authorizations | Chapter 20 |
| Post-issuance reporting | Schedule periodic reports and event notices | Alert and filing automation handles cadence | Chapter 20 |

## ATK Modules and Integrations

- **Supply limit module** — enforces MiCA issuance thresholds with lifetime or rolling windows (TokenSupplyLimitComplianceModule.sol).
- **Identity registry + claims** — captures investor classification, geo status, and passporting eligibility for real-time enforcement (Appendix A; Chapter 4).
- **Evidence bundles** — generate regulator-ready exports with policy config, alert history, and reserve attestations (Chapter 8).

## Operational Playbook

1. Select MiCA template during asset creation to seed rule sets.
2. Upload whitepaper drafts and trigger approval workflow.
3. Configure reserve attestations and custodial integrations.
4. Enable supply limit monitoring with alert thresholds.
5. Activate passporting pack for EU27 distribution and venue adapters.
6. Schedule periodic filings and marketing review checkpoints.

The result: MiCA compliance is enforced by construction, giving distribution teams the confidence to scale inside EU guardrails without manual policing.

