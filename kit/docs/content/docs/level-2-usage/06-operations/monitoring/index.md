---
title: Monitoring Playbooks
description: Dashboards, metrics, and alerting for ATK operations
---

<!-- SOURCE: kit/charts/atk/README.md -->
<!-- SOURCE: docker-compose.yml -->
<!-- SOURCE: doc-planing-archive/a-opus-plan2-4mix.md -->

# Monitoring Playbooks

**Monitor ATK proactively with defined health checks, performance metrics, and alert routes.**

## Roadmap

- [ ] `health-checks.md` — Service availability checks for dApp, API, contracts, and supporting services.
- [ ] `performance.md` — Transaction throughput, gas analysis, user engagement metrics.
- [ ] `alerts.md` — Alert policies, notification channels, and on-call rotations.

## Delivery Notes

- Align dashboards with the services defined in `docker-compose.yml` and Helm charts.
- Include sample Prometheus/Grafana queries for metrics coverage.
- Document notification paths (email, Slack, PagerDuty) with escalation timers.
