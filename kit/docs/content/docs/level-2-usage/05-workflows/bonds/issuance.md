---
title: Bond Issuance Workflow
description: Launch regulated bond tokens from term definition to distribution
---

<!-- SOURCE: kit/contracts/contracts/assets/bond/ -->
<!-- SOURCE: the-book-of-dalp/Part III — Operating the Platform/Chapter 18 — Data, Evidence, and Operational Truth (Going Deeper).md -->

# Bond Issuance Workflow

**Run this checklist when you need to stand up a compliant corporate bond in the Asset Designer and hand it off for allocations.**

## Outcome

When you finish this workflow you will have:

- A deployed bond contract aligned with the signed term sheet.
- Compliance controls wired to the issuer's policy stack.
- The denomination asset linked and ready so the treasury team can fund primary mints.

## Before you begin

Confirm these items so the wizard flow completes without rework:

- [ ] The operator account has `token:create` and `factory:deploy` permissions (the wizard validates them in `kit/dapp/src/orpc/routes/token/routes/mutations/create/token.create.test.ts:62`).
- [ ] Multi-factor wallet verification is active and exposes a `walletVerification` payload to the dApp (`kit/dapp/src/orpc/routes/common/schemas/mutation.schema.ts:35`).
- [ ] The denomination stablecoin is live, funded, and you have the contract address (`bondFields` pulls metadata in `kit/dapp/src/components/asset-designer/asset-designer-wizard/asset-specific-details/bond.tsx:34`).
- [ ] The compliance template (or module checklist) for the target jurisdiction is approved (`kit/contracts/contracts/smart/compliance-modules/`).
- [ ] Issuer OnchainID and trusted issuer claims are finalized so `ATKBondImplementation.initialize` accepts your identity registry (`kit/contracts/contracts/assets/bond/ATKBondImplementation.sol:74`).

## Step-by-step

1. **Launch the bond flow**
   - Go to **Assets → Designer**, choose `Securities`, then select **Bond**. The six-step journey is orchestrated in `use-asset-designer-steps.ts:44`.
   - Skim the breadcrumb to make sure the flow includes Compliance and Summary checkpoints—you will revisit them later.
2. **Enter the term sheet basics**
   - Fill in `name`, `symbol`, `decimals`, and `countryCode`; these hydrate the `TokenBaseSchema` (`kit/dapp/src/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema.ts:17`).
   - Enter the issuance cap in **Cap** (required via `bondFields`, `bond.tsx:47`).
   - Capture the maturity date (UTC) and face value. The form ensures the maturity is future-dated and scales the face value using the denomination asset decimals (`bond.tsx:67`).
3. **Link the denomination asset**
   - Select the stablecoin from the dropdown or paste the contract address. The wizard verifies the metadata with `orpc.token.read.call` (`bond.tsx:34`).
   - On the summary preview, double-check the denomination symbol and decimals—`ATKBondImplementation` will revert if the asset is misconfigured (`ATKBondImplementation.sol:107`).
4. **Attach compliance controls**
   - On **Compliance**, load the jurisdiction template or add modules individually:
     - `CountryAllowList` for geo gating (`kit/contracts/contracts/smart/compliance-modules/CountryAllowModule.sol`).
     - `AccreditedModule` for professional investor eligibility (`…/AccreditedModule.sol`).
     - `SupplyCapModule` to enforce prospectus limits (`…/SupplyCapModule.sol`, connected via `_SMARTCapped_init` at `ATKBondImplementation.sol:140`).
   - Layer any additional policy modules (TransferApproval, InvestorCount, etc.) that the program requires.
5. **Review and deploy**
   - Use the summary card to confirm cap, maturity, denomination asset, and face value (`kit/dapp/src/components/asset-designer/asset-designer-wizard/summary/bond.tsx:19`).
   - Deploy. The wizard signs the ORPC `token.create` mutation using your `walletVerification` payload and executes the Portal GraphQL mutation (`kit/dapp/src/orpc/routes/token/routes/mutations/create/token.create.ts:67`).
   - Wait for confirmation—the factory response includes the newly deployed bond address.
6. **Prepare primary allocations**
   - In the asset dashboard, open **Supply → Mint**. The handler chooses single or batch minting automatically (`kit/dapp/src/orpc/routes/token/routes/mutations/mint/token.mint.ts:102`).
   - Share mint transaction hashes with compliance and investor relations for their records and confirm the minted supply matches the allocation schedule.

## Quality checks

- Run `orpc.token.read({ tokenAddress })` and confirm:
  - `type === "bond"`, and `bond.faceValue`, `bond.denominationAsset`, and `bond.maturityDate` reflect the approved term sheet (`kit/dapp/src/orpc/routes/token/routes/token.read.schema.ts`).
  - `compliance.modules` list the expected module addresses.
- Query `orpc.token.statsBondStatus` to confirm coverage metrics and ensure `coveredPercentage ≥ 100%` once the treasury wallet funds the denomination asset (`kit/dapp/src/orpc/routes/token/routes/stats/bond-status.ts:11`).
- Review portal audit logs for the `TokenCreated` event and subsequent mint transactions; ERC-20 transfers emit during minting (`kit/contracts/contracts/assets/bond/ATKBondImplementation.sol:511`).


## References

- `kit/dapp/src/components/asset-designer/asset-designer-wizard/asset-specific-details/bond.tsx`
- `kit/dapp/src/orpc/routes/token/routes/mutations/create/token.create.ts`
- `kit/dapp/src/orpc/routes/token/routes/mutations/mint/token.mint.ts`
- `kit/dapp/src/orpc/routes/token/routes/stats/bond-status.ts`
- `kit/contracts/contracts/assets/bond/ATKBondImplementation.sol`
