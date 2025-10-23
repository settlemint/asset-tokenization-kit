---
title: Local Setup
description: Bring the ATK stack online on a workstation for development and demos
---

<!-- SOURCE: kit/README.md -->
<!-- SOURCE: docker-compose.yml -->
<!-- SOURCE: kit/dapp/drizzle/ -->

# Local Setup

> **Status:** Draft skeleton — replace TODO sections with concrete commands, outputs, and screenshots.

## Objective

Provision a fully functional ATK environment on a local machine for development, QA, or demos.

## Prerequisites

- [ ] Supported operating system (list in `system-requirements.md`)
- [ ] Docker engine running with allocated CPU/RAM
- [ ] Bun installed and repository cloned

## Procedure

1. **Install dependencies**
   - TODO: `bun install` command and expected success output.
2. **Copy environment template**
   - TODO: `cp kit/dapp/.env.example kit/dapp/.env.local` with variables to update.
3. **Start infrastructure services**
   - TODO: `docker compose up` parameters, container list, health expectations.
4. **Run database migrations**
   - TODO: Drizzle command and sample console output.
5. **Seed reference data**
   - TODO: Provide script or manual entries for demo identities and assets.
6. **Launch the application**
   - TODO: `bun run dev` command, port, and login URL.
7. **Smoke tests**
   - TODO: Document minimal checks (dashboard access, contract deployment sandbox, API ping).

## Verification

- TODO: Checklist referencing service health endpoints and logs.
- TODO: Include screenshot of dashboard verifying readiness.

## SLA

- Provisioning target: ≤20 minutes on first run, ≤5 minutes on subsequent runs with cached images.
- Escalate to platform engineering if containers fail health checks twice.

## Troubleshooting Hooks

- TODO: Link to `../08-troubleshooting/common-errors.md` once populated.
- TODO: Note log commands (`docker compose logs`, `bun --silent`).

## References

- `kit/README.md` sections “Local Development” and “Running Services”.
- `docker-compose.yml` for service details.
- `kit/dapp/drizzle/` migration scripts.
