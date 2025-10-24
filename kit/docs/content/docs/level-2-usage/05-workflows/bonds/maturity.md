---
title: Bond Maturity Workflow
description: Manage approaching maturity, investor notifications, and settlement for bonds
---

<!-- SOURCE: kit/contracts/contracts/assets/bond/ -->
<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 18 — Data, Evidence, and Operational Truth (Going Deeper).md -->

# Bond Maturity Workflow

**Maturity is a governed action—ATK blocks the transaction until coverage and timing checks pass.**

## Objective

Drive a bond from D-30 preparations through the `mature()` transaction so redemptions can execute on time and with full coverage.

## Prerequisites

- [ ] Governance operator on the bond holds the `governance` permission required by `TOKEN_PERMISSIONS.mature` (`kit/dapp/src/orpc/routes/token/token.permissions.ts:20`).
- [ ] Wallet verification method ready for the maturity signer (`kit/dapp/src/orpc/routes/common/schemas/mutation.schema.ts:35`).
- [ ] Denomination asset treasury plan ensures `denominationAssetBalanceAvailable` will reach 100% of the required amount (`kit/dapp/src/orpc/routes/token/routes/stats/bond-status.ts:11`).
- [ ] Outstanding coupon schedule reconciled through the yield module if one is active (`kit/dapp/src/orpc/routes/token/routes/mutations/yield/token.set-yield-schedule.ts`).

## Procedure

1. **Monitor the maturity countdown**
   - Query `orpc.token.read({ tokenAddress })` weekly starting D-30 to review `bond.maturityDate` and confirm the instrument has not already matured.
   - Use portfolio dashboards to surface the `timeToMaturity()` metric exposed in `ATKBondImplementation` (`kit/contracts/contracts/assets/bond/ATKBondImplementation.sol:189`).
2. **Prefund the denomination asset**
   - Transfer the redemption currency into the bond contract using the denomination asset address returned by `token.read`.
   - Re-run `orpc.token.statsBondStatus` until `coveredPercentage` is at or above 100%; the maturity handler refuses to run while coverage is below target (`kit/dapp/src/orpc/routes/token/routes/mutations/mature/token.mature.ts:64`).
3. **Freeze secondary actions if policy requires**
   - If governance wants to stop transfers before maturity, execute `orpc.token.pause`—the contract exposes `pause()` guarded by the `emergency` role (`kit/contracts/contracts/assets/bond/ATKBondImplementation.sol:535`).
   - Record the pause event in the operations log.
4. **Execute the maturity transaction**
   - Launch the **Mature bond** action from the token page. The ORPC handler validates bond type, maturity timestamp, and coverage before calling `ATKBondImplementationMature` (`token.mature.ts:38`).
   - Approve the challenge with the wallet verification code; the mutation emits `BondMatured` on success (`ATKBondImplementation.sol:216`).
5. **Post-maturity housekeeping**
   - Resume transfers if they were paused (`orpc.token.unpause`) once redemption batches finish.
   - Update investor communications to reference the matured status and next redemption steps.

## Verification

- `orpc.token.read` returns `bond.isMatured === true` and `bond.status` flags the instrument as matured in the UI.
- `orpc.token.statsBondStatus` still reports 100% coverage post-maturity; any shortfall must be escalated immediately.
- Portal audit log includes the `ATKBondImplementationMature` transaction hash alongside the operator identity.

## SLA

- Prefund coverage and lock maturity approvals no later than **D-5**.
- Submit the maturity transaction within **12 hours** of the contractual maturity timestamp.
- Publish investor notifications and updated lifecycle evidence within **T+1 business day**.

## References

- `kit/dapp/src/orpc/routes/token/routes/mutations/mature/token.mature.ts`
- `kit/dapp/src/orpc/routes/token/routes/stats/bond-status.ts`
- `kit/contracts/contracts/assets/bond/ATKBondImplementation.sol`
- `kit/dapp/src/orpc/routes/token/token.permissions.ts`

## Related Guides

- [`redemption.md`](./redemption.md)
- [`../../03-asset-operations/redemption-process.md`](../../03-asset-operations/redemption-process.md)
