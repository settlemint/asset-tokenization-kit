---
title: SEPA Integration
description: Enable SEPA and SEPA Instant payments for ATK deployments in Europe
---

<!-- SOURCE: kit/docs/content/docs/27-payment-rails-settlement-architecture.md -->

# SEPA Integration

> **Status:** Draft skeleton — include IBAN validation, scheme enrollment, and compliance checks.

## Objective

Connect ATK to SEPA credit transfer schemes (standard and instant) to support euro settlements across the EU.

## Prerequisites

- [ ] EU banking partner agreements (SEPA SCT/SCT Inst)
- [ ] IBAN/BIC validation service configured
- [ ] PSD2 and GDPR compliance reviewed

## Procedure

1. **Enroll with SEPA scheme**
   - TODO: Outline documentation, certification, and testing requirements.
2. **Validate account details**
   - TODO: Describe IBAN validation process and error handling.
3. **Integrate payment API**
   - TODO: Provide API endpoints, authentication, and message formats.
4. **Configure settlement windows**
   - TODO: Standard vs. instant settlement timing, cut-off times.
5. **Monitor and reconcile**
   - TODO: Logging, exception management, and daily reconciliation steps.

## Verification

- TODO: Checklist ensuring transfers execute, confirmations received, and ATK ledger reconciles with bank records.

## SLA

- SEPA Instant: expect near real-time confirmation (<10 seconds).
- Standard SEPA: same-day or next-day per bank agreement.

## References

- `kit/docs/content/docs/27-payment-rails-settlement-architecture.md`

## Related Guides

- [`core-banking.md`](./core-banking.md)
- [`../../enterprise/reporting-apis.md`](../../enterprise/reporting-apis.md)
