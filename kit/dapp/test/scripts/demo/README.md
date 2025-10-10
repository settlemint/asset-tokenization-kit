# Demo Environment Script Overview

This document summarizes the demo setup performed by
[`setup-demo-environment.ts`](./setup-demo-environment.ts). It highlights the
actors that are provisioned and the assets that are created so the team can
understand the resulting environment at a glance.

> **Access credentials**: Unless otherwise noted, every demo identity is
> provisioned with the password `settlemint` and the pincode `123456`.

## Actors

### System Administrator (`admin@settlemint.com`)

- **Who is this?** The primary platform owner who configures settings, onboards
  new teams, and generally keeps the environment running smoothly.
- **Access level:** Receives every management role, including `admin`,
  `systemManager`, `identityManager`, `tokenManager`, `addonManager`,
  `claimIssuer`, `claimPolicyManager`, `complianceManager`, and `systemModule`.
- **Compliance status:** Pre-loaded with `knowYourCustomer` (`kyc-verified`) and
  `antiMoneyLaundering` (`aml-verified`) claims.
- **Profile location:** Account identity is registered in Belgium (`BE`).

### Asset Issuer (`issuer@settlemint.com`)

- **Who is this?** The demo organization responsible for creating new asset
  tokens and attaching the right compliance modules before they reach investors.
- **Access level:** Assigned the on-chain `tokenManager` and `claimIssuer` roles
  so it can mint tokens, link compliance requirements, and issue investor
  claims.
- **Compliance status:** Receives the same KYC (`kyc-verified`) and AML
  (`aml-verified`) approvals as the administrator.
- **Profile location:** Account identity is registered in Belgium (`BE`).

### German Investor 1 (`german.investor1@settlemint.com`)

- **Who is this?** A ready-to-go German investor wallet that can participate in
  the bond demos.
- **Access level:** No administrative roles; behaves like a standard investor
  account.
- **Compliance status:** Equipped with `kyc-verified` and `aml-verified` claims
  so it easily passes bond checks.
- **Profile location:** Identity details are stored and registered in Germany
  (`DE`).

### German Investor 2 (`german.investor2@settlemint.com`)

- **Who is this?** A second German investor, useful for showing transfers or
  comparing user journeys.
- **Access level:** Same as Investor 1—no special blockchain permissions.
- **Compliance status:** Shares the `kyc-verified` and `aml-verified` claims
  from setup, mirroring the first investor.
- **Profile location:** Identity details are stored and registered in Germany
  (`DE`).

### Japanese Investor (`japanese.investor@settlemint.com`)

- **Who is this?** An investor from Japan deliberately left partially onboarded
  to demonstrate pending-compliance flows.
- **Access level:** No elevated blockchain roles; acts like a standard prospect.
- **Compliance status:** Starts without KYC/AML claims so teams can walk through
  the approval process.
- **Profile location:** Identity details use Japanese (`JP`) information, but
  registration is intentionally left unfinished to simulate onboarding.

## Assets

### Deposits

#### Proof-of-Deposit (`POD`)

- **Type & Extension**: Deposit token used as the denomination asset for bond
  issuances.
- **Claims**: No compliance claims are required; it acts as an internal
  settlement asset minted to the issuer and to the bond contract.
- **Compliance Rules**: No compliance modules are attached, so any wallet can
  hold POD.

### Bonds

#### Short-term bond (`STB`)

- **Type & Extension**: Bond token that references the `POD` denomination token
  and a yearly fixed-yield schedule (1.10%).
- **Claims**: No compliance claims are required.
- **Compliance Rules**: No compliance modules are attached, so any wallet can
  hold STB.

#### Bund7 (`BUND7`)

- **Type & Extension**: Bond token with ISIN `DE000BU27014` that references the
  `POD` denomination token and a yearly fixed-yield schedule (2.50%).
- **Claims**: Requires holders to present `kyc-verified` and `aml-verified`
  claims through the SMART Identity Verification module.
- **Compliance Rules**: Country allow-list restricts holders to Germany (`DE`).

#### Bund10 (`BUND10`)

- **Type & Extension**: Bond token with ISIN `DE000BU2Z056` using the same `POD`
  denomination token and yearly fixed-yield schedule (2.60%).
- **Claims**: Requires the same `kyc-verified` and `aml-verified` claims via the
  SMART Identity Verification module.
- **Compliance Rules**: Country allow-list admits both Germany (`DE`) and Japan
  (`JP`).
