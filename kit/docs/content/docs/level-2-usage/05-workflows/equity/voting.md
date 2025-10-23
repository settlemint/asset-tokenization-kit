---
title: Equity Voting Workflow
description: Run shareholder votes from proposal creation to certification
---

<!-- SOURCE: kit/docs/content/docs/22-equity-workflows-user-stories.md -->
<!-- SOURCE: kit/contracts/contracts/assets/equity/ -->

# Equity Voting Workflow

> **Status:** Draft skeleton — insert detailed steps, quorum calculations, and reporting outputs.

## Objective

Facilitate shareholder voting events on ATK, ensuring eligibility, quorum, and auditability.

## Prerequisites

- [ ] Governance proposal approved by board/company secretary
- [ ] Shareholder registry current
- [ ] Voting parameters defined (quorum, majority rules)

## Procedure

1. **Create proposal**
   - TODO: Document UI/API steps, metadata fields, attachments.
2. **Configure voting window**
   - TODO: Define start/end times, timezone handling, notification schedule.
3. **Publish to shareholders**
   - TODO: Notify eligible voters, provide documentation, mention proxy options.
4. **Monitor participation**
   - TODO: Dashboard views, threshold alerts, support for re-issuance of ballots.
5. **Close and certify results**
   - TODO: Confirm final tally, export certificates, update governance records.

## Verification

- TODO: Checklist verifying quorum achieved, vote results recorded on-chain, audit log entries.

## SLA

- Ballot setup: within 2 business days of proposal submission.
- Result certification: within 24 hours of vote closure.

## References

- `kit/contracts/contracts/assets/equity/` — voting mechanics (ERC20Votes).
- `kit/docs/content/docs/22-equity-workflows-user-stories.md` — scenario references.

## Related Guides

- [`share-issuance.md`](./share-issuance.md)
- [`../../03-asset-operations/corporate-actions.md`](../../03-asset-operations/corporate-actions.md)
