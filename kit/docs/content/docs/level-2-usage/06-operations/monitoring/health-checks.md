---
title: Health Checks
description: Monitor core ATK services for availability and readiness
---

<!-- SOURCE: docker-compose.yml -->
<!-- SOURCE: kit/charts/atk/README.md -->

# Health Checks

> **Status:** Draft skeleton — provide concrete probes, endpoints, and dashboards.

## Objective

Continuously verify the health of ATK components (dApp, APIs, blockchain nodes, subgraph) across environments.

## Prerequisites

- [ ] Monitoring stack deployed (Prometheus/Grafana or equivalent)
- [ ] Access to Kubernetes/Docker metrics endpoints
- [ ] On-call rota defined

## Health Targets

- TODO: Table mapping each service to its readiness/liveness probes and SLOs.
- TODO: Include expected response codes, latency targets, and failure conditions.

## Procedure

1. **Configure probes**
   - TODO: Document readiness/liveness configuration in Helm/Docker.
2. **Set up dashboards**
   - TODO: Summarize Grafana dashboard structure and key panels.
3. **Establish alert thresholds**
   - TODO: Tie to `alerts.md` with metrics and thresholds.
4. **Run daily checks**
   - TODO: Outline daily/weekly manual review tasks.
5. **Escalate incidents**
   - TODO: Link to escalation guide; record incident in tracking system.

## Verification

- TODO: Provide checklist for verifying that probes fire correctly and dashboards refresh.

## SLA

- Detection: within 1 minute of service degradation.
- Response: on-call acknowledgement within 5 minutes.

## References

- `docker-compose.yml` — local service definitions.
- `kit/charts/atk/README.md` — production deployment references.

## Related Guides

- [`performance.md`](./performance.md)
- [`../backup-recovery/backup-procedures.md`](../backup-recovery/backup-procedures.md)
