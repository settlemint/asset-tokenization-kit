---
title: Cloud Deployment
description: Deploy ATK to Kubernetes using the packaged Helm charts
---

<!-- SOURCE: kit/charts/atk/README.md -->
<!-- SOURCE: kit/charts/atk/values.yaml -->


# Cloud Deployment

> **Status:** Draft skeleton — add cluster prerequisites, Helm commands, and verification steps.

## Objective

Deploy the ATK platform to a managed Kubernetes cluster using the official Helm chart.

## Prerequisites

- [ ] Kubernetes cluster meeting sizing requirements (document in `system-requirements.md`)
- [ ] `kubectl` and `helm` configured with cluster access
- [ ] Secrets stored in approved vault or secret manager

## Procedure

1. **Prepare namespace and secrets**
   - TODO: Commands for creating namespaces and injecting secrets.
2. **Review configuration values**
   - TODO: Highlight key fields in `kit/charts/atk/values.yaml` (domain, image tags, resources).
3. **Install or upgrade release**
   - TODO: Provide `helm upgrade --install` command with placeholders.
4. **Validate pods**
   - TODO: Describe `kubectl get pods` checks, readiness/wait logic.
5. **Configure ingress / load balancer**
   - TODO: Document ingress controller integration, TLS configuration.
6. **Run post-deployment scripts**
   - TODO: Include migration job or manual triggers required after install.
7. **Smoke test endpoints**
   - TODO: Outline checks for dApp, API, ORPC, subgraph, and monitoring endpoints.

## Verification

- TODO: Provide expected pod statuses, service endpoints, and health URLs.
- TODO: Include guidance for running `helm test` or custom smoke tests.

## SLA

- Provisioning target: ≤45 minutes for greenfield deploys once cluster is ready.
- Escalation: If pod readiness exceeds 10 minutes, gather logs and contact platform engineering.

## References

- `kit/charts/atk/README.md` — chart usage instructions.
- `kit/charts/atk/values.yaml` — default configuration.
- `docker-compose.yml` — reference service set for parity with local environments.

## Next Steps

- Configure monitoring per [`../06-operations/monitoring/health-checks.md`](../06-operations/monitoring/health-checks.md) (once populated).
- Document tenant onboarding using [`../02-administration/user-management.md`](../02-administration/user-management.md).
