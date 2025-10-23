---
title: Scheduled Operations
description: Routine jobs and maintenance activities that keep ATK running smoothly
---

<!-- SOURCE: doc-planing-archive/c-ATK_DOCUMENTATION_MASTER_PLAN.md -->
<!-- SOURCE: kit/charts/atk/README.md -->

# Scheduled Operations

> **Status:** Draft skeleton — add calendar entries, owners, and automation scripts.

## Objective

Define recurring operational tasks (cron jobs, data hygiene, index maintenance) to sustain ATK reliability.

## Prerequisites

- [ ] Operations calendar shared with team
- [ ] Owners assigned for each recurring task
- [ ] Automation scripts stored in version control

## Task Catalogue

- TODO: Weekly database vacuum/analyze (include commands).
- TODO: Subgraph reindex cadence.
- TODO: Compliance template reviews (e.g., sanctions list updates).
- TODO: Certificate/identity expiry audits.
- TODO: Infrastructure patching windows.

## Procedure

1. **Plan schedule**
   - TODO: Document frequencies, preferred windows, and blackout periods.
2. **Execute task**
   - TODO: Provide scripts/commands and expected outcomes.
3. **Log completion**
   - TODO: Capture evidence (logs, screenshots) and update ticketing system.
4. **Review**
   - TODO: Monthly review of task effectiveness, adjust cadence.

## Verification

- TODO: Checklist ensuring tasks completed on time and documented.

## SLA

- Missed task escalation: within 24 hours.
- Critical tasks (e.g., sanction updates): no misses tolerated.

## References

- `kit/charts/atk/README.md` — infrastructure tasks reference.
- `../monitoring/health-checks.md` — connect tasks to monitoring metrics.

## Related Guides

- [`upgrades.md`](./upgrades.md)
- [`../backup-recovery/backup-procedures.md`](../backup-recovery/backup-procedures.md)
