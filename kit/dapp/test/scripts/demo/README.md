# Demo Environment Script Overview

This document summarizes the demo setup performed by
[`setup-demo-environment.ts`](./setup-demo-environment.ts). It highlights the
actors that are provisioned and the assets that are created so the team can
understand the resulting environment at a glance.

> **Access credentials**: Unless otherwise noted, every demo identity is
> provisioned with the password `settlemint` and the pincode `123456`.

## Actors

### System Administrator (`ADMIN`)
- **Roles**: Granted every role required for full system management, including
  `admin`, `systemManager`, `identityManager`, `tokenManager`, `addonManager`,
  `claimIssuer`, `claimPolicyManager`, `complianceManager`, and `systemModule`.
- **Claims**: Receives both `knowYourCustomer` (`kyc-verified`) and
  `antiMoneyLaundering` (`aml-verified`) identity claims.
- **Identity & Country**: Identity is created and registered in Belgium (`BE`).

### Asset Issuer (`ISSUER`)
- **Roles**: Receives on-chain `tokenManager` and `claimIssuer` roles so the
  issuer can create tokens, attach compliance modules, and issue claims.
- **Claims**: Same KYC and AML claims as the administrator
  (`kyc-verified` and `aml-verified`).
- **Identity & Country**: Identity is created and registered in Belgium (`BE`).

### German Investor 1 (`GERMAN_INVESTOR_1`)
- **Roles**: No elevated blockchain roles are assigned.
- **Claims**: Issued both `knowYourCustomer` (`kyc-verified`) and
  `antiMoneyLaundering` (`aml-verified`) claims so they can pass bond
  compliance checks.
- **Identity & Country**: Identity is created, KYC information is stored, and it
  is registered in Germany (`DE`).

### German Investor 2 (`GERMAN_INVESTOR_2`)
- **Roles**: No elevated blockchain roles are assigned.
- **Claims**: Issued the same KYC (`kyc-verified`) and AML (`aml-verified`)
  claims as German Investor 1.
- **Identity & Country**: Identity is created, KYC information is stored, and it
  is registered in Germany (`DE`).

### Japanese Investor (`JAPANESE_INVESTOR`)
- **Roles**: No elevated blockchain roles are assigned.
- **Claims**: No claims are issued during the setup; the investor therefore
  lacks KYC/AML attestation until granted later.
- **Identity & Country**: Identity is created with Japanese (`JP`) details but
  registration is intentionally skipped to simulate an investor pending
  onboarding.

## Assets

### Proof-of-Deposit (`POD`)
- **Type & Extension**: Deposit token used as the denomination asset for bond
  issuances.
- **Claims**: No compliance claims are required; it acts as an internal
  settlement asset minted to the issuer and to the bond contract.
- **Compliance Rules**: No compliance modules are attached, so any wallet can
  hold POD.

### Bund7 (`BUND7`)
- **Type & Extension**: Bond token with ISIN `DE000BU27014` that references the
  `POD` denomination token and a yearly fixed-yield schedule (2.50%).
- **Claims**: Requires holders to present `kyc-verified` and `aml-verified`
  claims through the SMART Identity Verification module.
- **Compliance Rules**: Country allow-list restricts holders to Germany (`DE`).

### Bund10 (`BUND10`)
- **Type & Extension**: Bond token with ISIN `DE000BU2Z056` using the same
  `POD` denomination token and yearly fixed-yield schedule (2.60%).
- **Claims**: Requires the same `kyc-verified` and `aml-verified` claims via the
  SMART Identity Verification module.
- **Compliance Rules**: Country allow-list admits both Germany (`DE`) and Japan
  (`JP`).
