---
title: Bond Workflows
description: End-to-end operations for ATK bond instruments
---

<!-- SOURCE: kit/contracts/contracts/assets/bond/ -->
<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 18 — Data, Evidence, and Operational Truth (Going Deeper).md -->

# Bond Workflows

This section outlines how operators manage the full lifecycle of ATK bond instruments—from issuance and compliance setup to maturity execution and redemption closure. Each workflow provides step-by-step runbooks, code references, and operational SLAs to ensure regulated bond operations run smoothly and on schedule.

## End-to-End Flow

- **Issuer onboarding locks identity and roles.** Platform admins provision the issuer organisation, grant `token:create` and treasury permissions, and anchor the issuer OnchainID with trusted claims so `ATKBondImplementation.initialize` accepts the identity registry (`kit/contracts/contracts/assets/bond/ATKBondImplementation.sol:74`).
- **Denomination liquidity is primed.** Treasury operators deploy or select the reserve-backed stablecoin that represents the bond face value and pre-fund it according to the allocation plan (`kit/dapp/src/components/asset-designer/asset-designer-wizard/asset-specific-details/bond.tsx:34`).
- **Asset Designer captures the term sheet.** Asset managers step through the wizard to encode coupon, maturity, supply cap, and compliance modules, resulting in a deployed bond contract tied to the denomination asset (`kit/dapp/src/orpc/routes/token/routes/mutations/create/token.create.ts`).
- **Primary issuance distributes positions.** Operations mint to investors through the bond dashboard, delivering allocations and publishing transaction hashes for audit while compliance monitors module enforcement via `orpc.token.read` and `orpc.token.statsBondStatus`.
- **Maturity and redemption settle obligations.** Custodians confirm denomination coverage, execute `token.mature`, and run the redemption playbook so outstanding supply is burned, collateral is released, and investor ledgers are reconciled (`kit/dapp/src/orpc/routes/token/routes/mutations/mature/token.mature.ts`, `kit/dapp/src/orpc/routes/token/routes/mutations/redeem/token.redeem.ts`).


## Lifecycle Map

| Stage | Read First | Why it Matters | Key Sources |
|-------|------------|----------------|-------------|
| 1. Primary issuance | [`issuance.md`](./issuance.md) | Configure the asset in the wizard and deploy with compliant parameters. | `kit/dapp/src/components/asset-designer/asset-designer-wizard/asset-specific-details/bond.tsx`, `kit/dapp/src/orpc/routes/token/routes/mutations/create/token.create.ts`, `kit/contracts/contracts/assets/bond/ATKBondImplementation.sol` |
| 2. Pre-maturity control | [`maturity.md`](./maturity.md) | Prefund denomination assets, manage trading status, and execute `mature()` once coverage is confirmed. | `kit/dapp/src/orpc/routes/token/routes/mutations/mature/token.mature.ts`, `kit/dapp/src/orpc/routes/token/routes/stats/bond-status.ts` |
| 3. Redemption window | [`redemption.md`](./redemption.md) | Burn outstanding supply, release denomination assets, and reconcile investor records. | `kit/dapp/src/orpc/routes/token/routes/mutations/redeem/token.redeem.ts`, `kit/dapp/src/orpc/routes/token/routes/stats/total-supply.ts` |

Follow the documents in sequence: issuance establishes the instrument, maturity authorises redemption, and redemption closes positions. Each runbook calls out the exact ORPC routes, contract functions, and verification queries required at that stage.

## File Overview

- `issuance.md` — Step-by-step wizard walkthrough, compliance module selection, post-deployment verification, and SLA commitments for primary allocations.
- `maturity.md` — Governance prerequisites, coverage enforcement, pause/unpause procedures, and maturity transaction execution.
- `redemption.md` — Investor communications, self-service vs custodian-led redemptions, reconciliation tooling, and lifecycle closure.


