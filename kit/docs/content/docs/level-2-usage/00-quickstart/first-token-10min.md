---
title: Your First Token in 10 Minutes
description: Provision ATK, deploy the application stack, and prepare for a corporate bond issuance demo
---

<!-- SOURCE: kit/dapp/src/components/asset-designer/ -->
<!-- SOURCE: kit/dapp/src/components/account/ -->
<!-- SOURCE: kit/contracts/contracts/onchainid/ -->
<!-- SOURCE: kit/dapp/.env.example -->

# Your First Token in 10 Minutes

> **Status:** In progress — provisioning is documented; stablecoin + bond issuance flow follows next iteration.

**Objective:** stand up an ATK sandbox, launch a settlement stablecoin, and prepare a corporate bond issuance demo in under ten minutes.

**Outcomes we target**
- ATK control plane live on a dedicated organization.
- ERC-3643 Asset Tokenization Kit application deployed on Hyperledger Besu (development footprint).
- Stablecoin template ready to mint demo liquidity (next section).
- Corporate bond template configured to reference the stablecoin as settlement currency (next section).

**How we get there**
1. Provision an organization in the SettleMint Console.
2. Deploy the ATK application stack with default development resources.
3. Use the Asset Designer to launch a settlement stablecoin (*pending write-up*).
4. Run the corporate bond wizard and connect it to the stablecoin (*pending write-up*).

## Objective

Issue a demo asset from a fresh ATK account in ≤10 minutes, capturing every screen for sales and customer validation.

## Prerequisites

- [ ] ATK sandbox environment running (see [`../01-installation/quickstart-guide.md`](../01-installation/quickstart-guide.md))
- [ ] Demo credentials with issuer permissions

## Procedure

### 1. Provision an ATK workspace (≈4 minutes)

1. **Sign in at `https://console.settlemint.com` with an Operator role.**
   - Confirm the landing page lists existing organizations and shows `+ Create new organization`.

   ![Workspace dashboard showing Create new organization](/images/level-2/quickstart/workspace-dashboard.png)
2. **Create a dedicated organization for the demo.**
   - Select `+ Create new organization`.
   - Enter a descriptive name such as `ATK Guide` and continue.

   ![Create organization modal filled with ATK Guide](/images/level-2/quickstart/create-organization.png)
3. **Review the organization dashboard.**
   - Ensure credits, members, and applications panels render without warnings.

   ![Organization dashboard ready for first application](/images/level-2/quickstart/organization-dashboard.png)

### 2. Create the ATK application (≈3 minutes)

1. **Open Apps and start a new blockchain app.**
   - Click `Apps` → `Create a new blockchain app`.

   ![Apps area before creating the first application](/images/level-2/quickstart/apps-empty.png)
2. **Select the Asset Tokenization Kit with Hyperledger Besu.**
   - Set the app name (e.g., `ATK app`).
   - Choose **Asset Tokenization (Beta)** to enable the ERC-3643 bond templates.
   - Select **Create permissioned network** → **Hyperledger Besu**.

   ![Create blockchain app dialog with Asset Tokenization kit and Hyperledger Besu selected](/images/level-2/quickstart/app-kit-selection.png)
3. **Configure the runtime environment.**
   - Pick **Development** to deploy the minimal footprint used for demos.
   - Select your preferred cloud (example: **Google Cloud**) and region (example: **Brussels**).
   - Leave Code Studio disabled for this quickstart; keep wallet type `Regular`.

   ![Environment configuration with Development, Google Cloud, Brussels, Regular wallet](/images/level-2/quickstart/environment-config.png)

### 3. Monitor deployment readiness (≈3 minutes)

1. **Track the application dashboard while services start.**
   - The dashboard tiles should list Blockchain networks, Nodes, Middleware, Integration tools, Storage, and Insights as `In progress`.
   - Expect zero errors.

   ![Application dashboard showing deployment in progress with zero errors](/images/level-2/quickstart/deployment-dashboard.png)
2. **Wait until every tile reports `Running`.**
   - Development provisioning completes in ≤3 minutes in most regions.
   - Escalate to the platform team if any tile remains `In progress` after 5 minutes or reports an error.

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

- Link to `../03-asset-operations/asset-designer-wizard.md` for deeper guidance.
- Link to `../04-compliance-config/compliance-modules.md` for module configuration follow-up.
