---
title: Your First Token in 10 Minutes
description: Provision ATK, deploy the application stack, and prepare for a corporate bond issuance demo
---

<!-- SOURCE: kit/dapp/src/components/asset-designer/ -->
<!-- SOURCE: kit/dapp/src/components/account/ -->
<!-- SOURCE: kit/contracts/contracts/onchainid/ -->
<!-- SOURCE: kit/dapp/.env.example -->

# Your First Token in 10 Minutes

> **Status:** In progress — environment provisioning is complete; stablecoin and bond issuance steps remain to be drafted.

## Why This Demo Matters

Institutional issuers expect to see both legs of a trade. The quickstart therefore pairs a **settlement stablecoin** with a **corporate bond**:

- The stablecoin template (see `kit/contracts/contracts/assets/stablecoin/`) enforces reserve backing and instant redemption. It gives sales a credible answer to “How do we settle cash?”
- The bond template (see `kit/contracts/contracts/assets/bond/`) showcases coupon scheduling, accredited-investor gating, and maturity handling in one pass.
- The compliance engine (`kit/contracts/contracts/smart/compliance-modules/`) keeps both assets inside MiCA/SEC guardrails with AccreditedInvestor, CountryAllowList, and TransferApproval modules that we will activate during issuance.
- Running them together proves ATK can deliver T+0 lifecycle automation—issuance, compliance, cash settlement—without handoffs.

## Flow at a Glance

1. Launch a fresh organization in the SettleMint Console.
2. Deploy the Asset Tokenization Kit on a Hyperledger Besu development network.
3. Mint the settlement stablecoin through the Asset Designer wizard. *(Pending write-up)*
4. Issue the corporate bond and wire coupon payouts to the stablecoin. *(Pending write-up)*

## Objective

Learn how to stand up ATK, mint a reserve-backed settlement stablecoin, and issue a corporate bond—all inside ten minutes—so you can demonstrate T+0 institutional tokenization with confidence.

## Prerequisites

- [ ] ATK sandbox environment running (see [`../01-installation/quickstart-guide.md`](../01-installation/quickstart-guide.md))
- [ ] Demo credentials with issuer permissions

## Procedure

### 1. Provision an ATK workspace (≈4 minutes)

1. **Sign in at `https://console.settlemint.com` with an Operator role.**
   - The workspace landing page should display existing organizations and the `+ Create new organization` action.

   ![Workspace dashboard showing Create new organization](../../../../static/images/level-2/quickstart/workspace-dashboard.png)
2. **Create a dedicated organization for the demo.**
   - Choose `+ Create new organization`, supply a descriptive name such as `ATK Demo`, and continue.

   ![Create organization modal filled with ATK Guide](../../../../static/images/level-2/quickstart/create-organization.png)
3. **Review the organization dashboard.**
   - Confirm credits, members, and applications panels display zero warnings; this becomes the control plane for the rest of the runbook.

   ![Organization dashboard ready for first application](../../../../static/images/level-2/quickstart/organization-dashboard.png)

### 2. Create the ATK application (≈3 minutes)

1. **Open Apps and start a new blockchain app.**
   - Navigate to `Apps`, then select `Create a new blockchain app`.

   ![Apps area before creating the first application](../../../../static/images/level-2/quickstart/apps-empty.png)
2. **Select the Asset Tokenization Kit with Hyperledger Besu.**
   - Set the app name (e.g., `ATK app`).
   - Choose **Asset Tokenization (Beta)** to load the ERC-3643 templates.
   - Select **Create permissioned network** → **Hyperledger Besu**.

   ![Create blockchain app dialog with Asset Tokenization kit and Hyperledger Besu selected](../../../../static/images/level-2/quickstart/app-kit-selection.png)
3. **Configure the runtime environment.**
   - Pick **Development** for the minimal, credit-light footprint.
   - Select the preferred cloud (example: **Google Cloud**) and region (example: **Brussels**).
   - Keep Code Studio disabled and wallet type set to `Regular` for the settlement demo.

   ![Environment configuration with Development, Google Cloud, Brussels, Regular wallet](../../../../static/images/level-2/quickstart/environment-config.png)

### 3. Monitor deployment readiness (≈3 minutes)

1. **Track the application dashboard while services start.**
   - The dashboard tiles for Blockchain networks, Nodes, Middleware, Integration tools, Storage, and Insights should read `In progress` with zero errors.

   ![Application dashboard showing deployment in progress with zero errors](../../../../static/images/level-2/quickstart/deployment-dashboard.png)
2. **Wait until every tile reports `Running`.**
   - Development provisioning normally finalises within three minutes.
   - Escalate to the platform team if any tile remains `In progress` after five minutes or raises an error.

### 4. Onboard the issuer operator *(Pending)*

> TODO: Document account creation, role assignment, and OnchainID claims with supporting screenshots.

### 5. Configure the corporate bond issuance *(Pending)*

> TODO: Capture Asset Designer wizard flow, compliance modules, and deployment confirmation.

## Verification

- Workspace dashboard shows the new organization without warnings.
- Application dashboard lists all services as `Running` before moving to issuance tasks.
- Record start and finish times to confirm provisioning completed in ≤10 minutes.
- **Pending:** Add checks for stablecoin mint transaction, bond deployment hash, audit log entry, and minted supply once issuance steps are documented.

## SLA

- Target duration: ≤10 minutes end-to-end.
- Escalate if any step exceeds 3 minutes or fails twice; capture logs for troubleshooting.

## Evidence Pack

- Screenshots referenced in this guide reside under `kit/docs/static/images/level-2/quickstart/`.
- **Pending:** Attach recorded walkthrough once stablecoin and bond issuance are scripted.

## Next Steps

- Draft the settlement stablecoin wizard walk-through (Step 3).
- Draft the corporate bond issuance walk-through (Step 4) with compliance checkpoints.
- Use `../03-asset-operations/asset-designer-wizard.md` for detailed wizard behaviour and `../04-compliance-config/compliance-modules.md` for module configuration follow-up.
