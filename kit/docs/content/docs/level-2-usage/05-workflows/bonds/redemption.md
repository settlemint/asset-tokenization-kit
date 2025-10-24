---
title: Bond Redemption Workflow
description: Execute bond redemptions, reconcile payments, and close lifecycle records
---

<!-- SOURCE: kit/contracts/contracts/assets/bond/ -->
<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 18 — Data, Evidence, and Operational Truth (Going Deeper).md -->

# Bond Redemption Workflow

**Redemption drains liabilities only after maturity and coverage checks succeed—ATK enforces cash-before-burn discipline.**

## Objective

Execute scheduled or exceptional bond redemptions, reconcile denomination asset payouts, and close lifecycle records.

## Prerequisites

- [ ] Bond already marked as matured (`bond.isMatured === true`) via the previous workflow.
- [ ] Coverage remains at 100% (`orpc.token.statsBondStatus`), so each redemption can settle without treasury intervention.
- [ ] Investor ledger exported for communication—use `statsWalletDistribution` to size holder cohorts (`kit/dapp/src/orpc/routes/token/routes/stats/wallet-distribution.ts`).
- [ ] Custodian operators with the `custodian` permission are available for forced recovery scenarios (`kit/dapp/src/orpc/routes/token/token.permissions.ts:22`).
- [ ] Wallet verification factors ready for every account that will submit redemptions (`kit/dapp/src/orpc/routes/token/routes/mutations/redeem/token.redeem.ts:63`).

## Procedure

1. **Validate redemption readiness**
   - Confirm `bond.isMatured` and `coveredPercentage ≥ 100%`. If coverage dipped, top up the denomination asset before proceeding (`ATKBondImplementation.sol:189`).
   - Check that transfer pause state reflects policy—if bonds remain paused, keep them paused so outstanding holders cannot transfer away before redeeming.
2. **Publish the redemption window**
   - Notify investors with the redemption open/close dates, the denomination asset they will receive, and the verification method they must present.
   - Provide links to the ATK portal redemption screen so self-service investors can act immediately.
3. **Process investor-initiated redemptions**
   - Investors (or managed accounts) open the bond page and run **Redeem All** or specify an amount. The ORPC route selects `redeem` or `redeemAll` and checks for zero-amount/error conditions (`token.redeem.ts:61`).
   - Each successful redemption burns the holder’s balance, transfers denomination assets from the bond contract, and emits `BondRedeemed` with the payout value (`kit/contracts/contracts/assets/bond/ATKBondImplementation.sol:700`).
4. **Handle custodial or lost-key cases**
   - If an investor cannot sign, use `orpc.token.forcedRecover` to move their balance to a new, verified wallet under custodian control (`token.forced-recover.ts:32`).
   - Redeem from the recovered wallet using the standard flow; record both transactions in the incident register.
5. **Track progress and reconcile**
   - Monitor total supply with `orpc.token.statsTotalSupply` (`kit/dapp/src/orpc/routes/token/routes/stats/total-supply.ts`). Outstanding supply should trend toward zero.
   - Export redemption events from the portal audit log and match payouts against banking statements if parallel cash settlements occur.
6. **Close the issuance**
   - When `totalSupply` reaches zero, confirm `bondRedeemed` counters reflect full redemption in on-chain analytics.
   - Unpause the bond (if it was frozen) and archive the lifecycle packet for auditors.

## Verification

- `orpc.token.read` shows `totalSupply === 0` and `bond.isMatured === true`.
- `orpc.token.statsBondStatus` indicates `denominationAssetBalanceAvailable === 0` once the last investor redeems.
- Portal audit logs contain a `BondRedeemed` entry for every investor, plus any `forcedRecover` events executed by custodians.

## SLA

- Complete the main redemption window within **T+1 business day** after opening.
- Resolve exceptions (lost keys, compliance holds) within **2 business days** of notification.

## References

- `kit/dapp/src/orpc/routes/token/routes/mutations/redeem/token.redeem.ts`
- `kit/dapp/src/orpc/routes/token/routes/mutations/recovery/token.forced-recover.ts`
- `kit/dapp/src/orpc/routes/token/routes/stats/total-supply.ts`
- `kit/dapp/src/orpc/routes/token/routes/stats/wallet-distribution.ts`
- `kit/contracts/contracts/assets/bond/ATKBondImplementation.sol`

## Related Guides

- [`maturity.md`](./maturity.md)
- [`../../03-asset-operations/redemption-process.md`](../../03-asset-operations/redemption-process.md)
