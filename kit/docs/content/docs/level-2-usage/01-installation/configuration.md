---
title: Configuration Reference
description: Environment variables and configuration profiles for ATK deployments
---

<!-- SOURCE: kit/dapp/.env.example -->
<!-- SOURCE: kit/charts/atk/values.yaml -->
<!-- SOURCE: docker-compose.yml -->

# Configuration Reference

> **Status:** Draft skeleton — populate tables with concrete variable names, defaults, and scopes.

## Objective

Provide a central map of configuration parameters for local, staging, and production ATK environments.

## Prerequisites

- [ ] Access to secrets management system
- [ ] Current environment matrix documented in project tracker

## Configuration Profiles

### Local Development

- TODO: Table of environment variables sourced from `kit/dapp/.env.example`.
- TODO: Notes on optional overrides for demos or testing.

### Staging / UAT

- TODO: Parameters unique to shared staging clusters (domain, feature flags).
- TODO: Reference relevant values in `kit/charts/atk/values.yaml`.

### Production

- TODO: Highlight hardened settings, monitoring integrations, and audit requirements.
- TODO: Include SLA thresholds and links to change management policy.

## Secrets & Sensitive Values

- TODO: List secrets that must be stored outside git, with vault paths or rotation cadence.
- TODO: Document handling for API keys, database credentials, custody integrations.

## Validation Checklist

- [ ] Configuration diff reviewed before deployment.
- [ ] Secrets rotated per policy.
- [ ] Monitoring hooks updated with new endpoints.

## References

- `kit/dapp/.env.example` — base variable list.
- `kit/charts/atk/values.yaml` — Helm configuration.
- `docker-compose.yml` — service-level environment variables.
