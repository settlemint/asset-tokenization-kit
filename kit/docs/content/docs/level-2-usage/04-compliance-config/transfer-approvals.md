---
title: Transfer Approvals
description: Manage manual review workflows for high-risk or restricted transfers
---

<!-- SOURCE: kit/contracts/contracts/smart/compliance-modules/TransferApprovalModule.sol -->
<!-- SOURCE: kit/dapp/src/components/compliance/ -->

# Transfer Approvals

> **Status:** Draft skeleton — add approval thresholds, queue operations, and notification steps.

## Objective

Implement maker-checker workflows for transfers that require manual review, ensuring regulated movements comply with policy.

## Prerequisites

- [ ] TransferApproval module enabled
- [ ] Approver roster defined with escalation contacts
- [ ] Notification channels configured

## Procedure

1. **Set approval thresholds**
   - TODO: Define transaction amount/risk triggers and jurisdiction filters.
2. **Configure approval queue**
   - TODO: Document queue assignment, priority levels, and SLA timers.
3. **Review transfer requests**
   - TODO: Outline reviewer UI, decision process, and comments.
4. **Escalate high-risk cases**
   - TODO: Provide escalation path and required documentation.
5. **Audit approvals**
   - TODO: Describe report exports and reconciliation.

## Verification

- TODO: Test scenario for approval, rejection, and timeout.
- TODO: Ensure audit log captures approver identity and decision reason.

## SLA

- Standard approval: <4 business hours.
- High-priority transfers: <1 hour.

## References

- `TransferApprovalModule.sol` — logic for manual approval enforcement.
- `kit/dapp/src/components/compliance/` — UI for queue management.

## Related Guides

- [`logic-expressions.md`](./logic-expressions.md)
- [`compliance-failures.md`](../08-troubleshooting/compliance-failures.md)
