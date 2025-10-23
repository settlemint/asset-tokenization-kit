---
title: Installation & Deployment
description: Runbooks for local, staging, and production ATK environments
---

<!-- SOURCE: kit/README.md -->
<!-- SOURCE: kit/charts/atk/README.md -->
<!-- SOURCE: kit/charts/atk/values.yaml -->
<!-- SOURCE: docker-compose.yml -->
<!-- SOURCE: doc-planing-archive/c-ATK_DOCUMENTATION_MASTER_PLAN.md -->

# Installation & Deployment

**Installers use these guides to stand up ATK across laptops, staging sandboxes, and production clusters with consistent configuration and verification.**

## Roadmap

- [ ] `local-setup.md` — Bun install, workspace bootstrap, Docker Compose orchestration, and smoke tests.
- [ ] `cloud-deployment.md` — Helm chart deployment for Kubernetes clusters, secret management, and scaling guidance.
- [ ] `configuration.md` — Environment variable catalogue, configuration profiles, and validation scripts.
- [ ] `system-requirements.md` — Hardware, software, browser, and network baselines for ATK operations.

## Inputs to Capture

- Local workflow from `kit/README.md` and `docker-compose.yml`.
- Production deployment parameters from `kit/charts/atk/README.md` and `kit/charts/atk/values.yaml`.
- Host-specific notes (SaaS vs. on-prem) from platform architecture discussions in `doc-planing-archive/c-ATK_DOCUMENTATION_MASTER_PLAN.md`.

## Delivery Notes

- Document hosting models (local sandbox, SaaS tenancy, on-prem) with clear decision points.
- Attach pre-flight checklists so operators confirm readiness before executing commands.
- Include rollback instructions in every deployment runbook to keep Level 2 consistent.
