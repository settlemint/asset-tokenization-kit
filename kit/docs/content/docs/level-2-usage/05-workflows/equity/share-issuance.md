---
title: Equity Share Issuance
description: Launch equity tokens with governance rights and compliance controls
---

<!-- SOURCE: kit/docs/content/docs/22-equity-workflows-user-stories.md -->
<!-- SOURCE: kit/contracts/contracts/assets/equity/ -->

# Equity Share Issuance

> **Status:** Draft skeleton — complete with class structures, governance notes, and investor onboarding.

## Objective

Issue equity shares with defined voting rights, classes, and investor eligibility rules.

## Prerequisites

- [ ] Equity template configured (share classes, voting weights)
- [ ] Board/issuer approval for issuance
- [ ] Compliance modules calibrated for jurisdiction and shareholder limits

## Procedure

1. **Define share classes**
   - TODO: Document common vs. preferred, voting weights, dividends.
2. **Configure governance hooks**
   - TODO: Reference ERC20Votes settings, quorum thresholds.
3. **Allocate initial shareholders**
   - TODO: Bulk upload or manual assignment, investor verification.
4. **Deploy issuance**
   - TODO: Maker-checker sign-off, deployment steps, notifications.
5. **Post-issuance tasks**
   - TODO: Cap table export, regulatory filings, investor communications.

## Verification

- TODO: Checklist to confirm share counts, voting weights, compliance approvals.

## SLA

- Issuance completion: within planned timeline (document).
- Governance activation: ready prior to first shareholder meeting.

## References

- `kit/contracts/contracts/assets/equity/` — voting and governance logic.
- `kit/docs/content/docs/22-equity-workflows-user-stories.md` — scenario narratives.

## Related Guides

- [`../../03-asset-operations/asset-designer-wizard.md`](../../03-asset-operations/asset-designer-wizard.md)
- [`voting.md`](./voting.md)
