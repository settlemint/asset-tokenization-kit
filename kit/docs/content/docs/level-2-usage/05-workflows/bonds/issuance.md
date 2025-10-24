---
title: Bond Issuance Workflow
description: Launch regulated bond tokens from term definition to distribution
---

<!-- SOURCE: kit/contracts/contracts/assets/bond/ -->
<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 18 — Data, Evidence, and Operational Truth (Going Deeper).md -->

# Bond Issuance Workflow

**ATK launches regulated bonds in one wizard run—no bespoke scripting, no compliance gaps.**

## Objective

Put a term-sheet-approved corporate bond on chain with denomination, eligibility, and coupon scaffolding ready for distribution.

## Prerequisites

- [ ] Issuer operator holds the `token:create` and `factory:deploy` permissions enforced by the wizard (`kit/dapp/src/orpc/routes/token/routes/mutations/create/token.create.test.ts:62`).
- [ ] Multi-factor wallet verification is configured; Asset Designer surfaces `walletVerification` from `kit/dapp/src/orpc/routes/common/schemas/mutation.schema.ts:35`.
- [ ] Denomination stablecoin contract is deployed, funded, and the address is accessible—the bond wizard fetches metadata via `bondFields` (`kit/dapp/src/components/asset-designer/asset-designer-wizard/asset-specific-details/bond.tsx:34`).
- [ ] Compliance template for the target jurisdiction is available (module contracts live under `kit/contracts/contracts/smart/compliance-modules/`).
- [ ] Issuer OnchainID and trusted issuer claims are approved so the identity registry supplied to `ATKBondImplementation.initialize` validates actors (`kit/contracts/contracts/assets/bond/ATKBondImplementation.sol:74`).

## Procedure

1. **Open Asset Designer and lock in the asset type**
   - Navigate to **Assets → Designer**, select `Securities`, then choose **Bond**; the six-step flow is defined in `use-asset-designer-steps.ts:44`.
   - Confirm the wizard displays compliance and summary checkpoints before deployment.
2. **Enter bond basics**
   - Provide `name`, `symbol`, `decimals`, and `countryCode`. These map to `TokenBaseSchema` (`kit/dapp/src/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema.ts:17`).
   - Set the issuance cap in the **Cap** field; the UI marks it required through `bondFields` (`bond.tsx:47`).
   - Capture the maturity date (UTC) and face value. Validation ensures the date is in the future and scales face value against the denomination asset decimals (`bond.tsx:67`).
3. **Select the denomination asset**
   - Pick the stablecoin from the dropdown or paste its address; the wizard queries `orpc.token.read.call` to confirm decimals and symbol (`bond.tsx:34`).
   - Verify the summary displays the denomination asset—`ATKBondImplementation` reverts if the address is invalid or the ERC-20 is missing (`ATKBondImplementation.sol:107`).
4. **Attach compliance modules**
   - On the **Compliance** step, load the jurisdiction template or add modules manually:
     - `CountryAllowList` for geo gating (`kit/contracts/contracts/smart/compliance-modules/CountryAllowModule.sol`).
     - `AccreditedModule` for professional investor checks (`…/AccreditedModule.sol`).
     - `SupplyCapModule` to enforce prospectus limits (`…/SupplyCapModule.sol`, wired via `_SMARTCapped_init` at `ATKBondImplementation.sol:140`).
   - Additional modules (TransferApproval, InvestorCount, etc.) can be layered per policy.
5. **Review and deploy**
   - Inspect the summary card for cap, maturity, denomination asset, and face value (`kit/dapp/src/components/asset-designer/asset-designer-wizard/summary/bond.tsx:19`).
   - Submit the transaction. The wizard signs an ORPC `token.create` mutation with the stored `walletVerification` payload and executes the Portal GraphQL call (`kit/dapp/src/orpc/routes/token/routes/mutations/create/token.create.ts:67`).
   - Wait for the deployment confirmation; the factory returns the new bond address to the UI.
6. **Distribute primary allocations**
   - From the asset dashboard, open **Supply → Mint**. The handler auto-selects single or batch minting (`kit/dapp/src/orpc/routes/token/routes/mutations/mint/token.mint.ts:102`).
   - Record transaction hashes for investor files and compliance evidence.

## Verification

- Run `orpc.token.read({ tokenAddress })` and confirm:
  - `type === "bond"`, and `bond.faceValue`, `bond.denominationAsset`, `bond.maturityDate` match the term sheet (`kit/dapp/src/orpc/routes/token/routes/token.read.schema.ts`).
  - `compliance.modules` contain the expected module addresses.
- Query `orpc.token.statsBondStatus` to view coverage metrics and ensure `coveredPercentage ≥ 100%` once the treasury wallet has funded the denomination asset (`kit/dapp/src/orpc/routes/token/routes/stats/bond-status.ts:11`).
- Review portal audit logs for `TokenCreated` plus mint events—the contract emits ERC-20 transfers during minting (`kit/contracts/contracts/assets/bond/ATKBondImplementation.sol:511`).

## SLA

- Complete the wizard, approvals, and deployment within **30 minutes**.
- Finish initial investor allocations and reconciliation within **1 hour** of deployment.

## References

- `kit/dapp/src/components/asset-designer/asset-designer-wizard/asset-specific-details/bond.tsx`
- `kit/dapp/src/orpc/routes/token/routes/mutations/create/token.create.ts`
- `kit/dapp/src/orpc/routes/token/routes/mutations/mint/token.mint.ts`
- `kit/dapp/src/orpc/routes/token/routes/stats/bond-status.ts`
- `kit/contracts/contracts/assets/bond/ATKBondImplementation.sol`
