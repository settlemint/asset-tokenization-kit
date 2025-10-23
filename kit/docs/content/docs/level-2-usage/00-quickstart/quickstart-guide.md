---
title: Platform Setup in 15 Minutes
description: Bring up the full ATK stack locally with Bun, Docker, and seeded data
---

<!-- SOURCE: kit/README.md -->
<!-- SOURCE: docker-compose.yml -->
<!-- SOURCE: kit/dapp/.env.example -->
<!-- SOURCE: kit/dapp/drizzle/ -->

# Platform Setup in 15 Minutes

> **Status:** Draft skeleton — fill in commands, screenshots, and validation outputs for each step.

## Objective

Provision a local ATK environment suitable for demos and testing in approximately 15 minutes.

## Prerequisites

- [ ] Bun installed (version per root `package.json`)
- [ ] Docker Desktop or compatible engine running
- [ ] Access to repository with submodules fetched

## Procedure

1. **Install dependencies**
   - TODO: Record exact `bun install` command and expected output.
2. **Configure environment variables**
   - TODO: Reference keys from `kit/dapp/.env.example`, note secrets handling.
3. **Start Docker services**
   - TODO: Provide `docker compose` command, document containers and ports.
4. **Run database migrations**
   - TODO: Reference Drizzle migration scripts, include commands and logs.
5. **Seed demo data**
   - TODO: Capture any seeding script or manual steps for demo accounts.
6. **Launch the dApp**
   - TODO: Document `bun run dev` or equivalent command and URL.
7. **Health check verification**
   - TODO: Outline checks for API, subgraph, and blockchain node connectivity.

## Verification

- TODO: List URLs, CLI checks, and log entries confirming environment health.
- TODO: Capture screenshot of the dashboard showing operational status.

## SLA

- Setup duration: ≤15 minutes assuming Docker images cached.
- Escalation: Log incidents if service fails to start within 5 minutes.

## References

- `kit/README.md` — official setup commands.
- `docker-compose.yml` — service definitions and ports.
- `kit/dapp/drizzle/` — database migrations.

## Next Steps

- Proceed to [`first-token-10min.md`](./first-token-10min.md) for demo issuance.
- Share environment checklist with team using [`STATUS_DASHBOARD.md`](../STATUS_DASHBOARD.md).
