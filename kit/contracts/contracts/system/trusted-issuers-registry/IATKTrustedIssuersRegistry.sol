// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IERC3643TrustedIssuersRegistry } from "../../smart/interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol";

/**
 * @title IATKTrustedIssuersRegistry
 * @author SettleMint
 * @notice Interface for the ATK Trusted Issuers Registry, managing trusted claim issuers
 * @dev Extends IERC3643TrustedIssuersRegistry to provide ATK-specific initialization functionality.
 *      This registry maintains a list of trusted entities that can issue claims for identity verification.
 */
interface IATKTrustedIssuersRegistry is IERC3643TrustedIssuersRegistry {
    /// @notice Initializes the registry with an initial admin and registrars.
    /// @param initialAdmin The address that will receive the initial `DEFAULT_ADMIN_ROLE`.
    /// This address will have full control over the registry's setup and initial population of trusted issuers.
    /// @param initialRegistrars The addresses that will receive the initial `REGISTRAR_ROLE`.
    /// These addresses will have the ability to add and remove trusted issuers.
    function initialize(address initialAdmin, address[] memory initialRegistrars) external;
}
