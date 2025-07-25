// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ISMARTTopicSchemeRegistry } from "../../smart/interface/ISMARTTopicSchemeRegistry.sol";

/**
 * @title IATKTopicSchemeRegistry
 * @author SettleMint
 * @notice Interface for the ATK Topic Scheme Registry, managing claim topic schemes
 * @dev Extends ISMARTTopicSchemeRegistry to provide ATK-specific initialization functionality
 *      for managing claim topic schemes within the ATK token ecosystem
 */
interface IATKTopicSchemeRegistry is ISMARTTopicSchemeRegistry {
    /// @notice Initializes the ATK Topic Scheme Registry contract
    /// @param initialAdmin The address that will be granted the DEFAULT_ADMIN_ROLE
    /// @param initialRegistrars Array of addresses that will be granted the REGISTRAR_ROLE
    function initialize(address initialAdmin, address[] calldata initialRegistrars) external;
}
