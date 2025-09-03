// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title ATKPeopleRoles
/// @author SettleMint
/// @notice Library defining role constants for human operators and administrators
/// @dev These roles are typically assigned to EOAs (Externally Owned Accounts)
library ATKPeopleRoles {
    /// @notice Role identifier for addresses that can manage the system
    /// @dev The one that bootstraps the system, manage upgrades, implementation references + also the
    /// update linking (used in identity registry) etc. also has access on identity registry storage to modify
    /// stuff directly there. Registering token factories, addons and compliance modules
    bytes32 public constant SYSTEM_MANAGER_ROLE = keccak256("SYSTEM_MANAGER_ROLE");

    /// @notice Role identifier for addresses that can manage the identity registry
    /// @dev Register identities, recover identities, manage user onboarding
    bytes32 public constant IDENTITY_MANAGER_ROLE = keccak256("IDENTITY_MANAGER_ROLE");

    /// @notice Role identifier for addresses that can manage the token
    /// @dev Deploy and configure tokens
    bytes32 public constant TOKEN_MANAGER_ROLE = keccak256("TOKEN_MANAGER_ROLE");

    /// @notice Role identifier for addresses that can manage the compliance
    /// @dev Register compliance modules, but also has access on the compliance modules to configure the global things,
    /// also has access to the bypass list
    bytes32 public constant COMPLIANCE_MANAGER_ROLE = keccak256("COMPLIANCE_MANAGER_ROLE");

    /// @notice Role identifier for addresses that can manage the addons
    /// @dev Can be used on the addon factories (Should this be more specific?) Maybe each add-on has it's own roles?
    bytes32 public constant ADDON_MANAGER_ROLE = keccak256("ADDON_MANAGER_ROLE");

    /// @notice Role identifier for addresses that can manage the claim policies
    /// @dev Manage trusted issuers and claim topics
    bytes32 public constant CLAIM_POLICY_MANAGER_ROLE = keccak256("CLAIM_POLICY_MANAGER_ROLE");

    /// @notice Role identifier for addresses that can manage organisation identity claims
    /// @dev Can manage claims for the organisation identity, including organisation-level KYC, AML, licenses, etc.
    bytes32 public constant ORGANISATION_IDENTITY_MANAGER_ROLE = keccak256("ORGANISATION_IDENTITY_MANAGER_ROLE");

    /// @notice Role identifier for addresses that can issue claims on identities
    /// @dev This role grants permission to create and attach claims to identity contracts.
    ///      Possessing this role does **not** automatically make the address a trusted issuer.
    ///      Trust is determined separately via the Trusted Issuers Registry, which decides
    ///      whether claims from a given issuer are considered valid in verification contexts.
    ///      Commonly assigned to institutions, auditors, or service providers responsible
    ///      for generating attestations such as KYC, AML, or collateral proofs.
    bytes32 public constant CLAIM_ISSUER_ROLE = keccak256("CLAIM_ISSUER_ROLE");

    /// @notice Role identifier for addresses that can audit the system
    /// @dev View-only role for permissions, identities, audit logs, system state
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
}
