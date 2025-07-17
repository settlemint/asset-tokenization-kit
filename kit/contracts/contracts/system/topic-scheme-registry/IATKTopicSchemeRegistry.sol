// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ISMARTTopicSchemeRegistry } from "../../smart/interface/ISMARTTopicSchemeRegistry.sol";

/// @title Interface for ATK Topic Scheme Registry
/// @notice Extends the ISMARTTopicSchemeRegistry interface with initialization functions
/// @dev Used by the ATK system for access-controlled topic scheme management
interface IATKTopicSchemeRegistry is ISMARTTopicSchemeRegistry {
    /// @notice Initializes the ATKTopicSchemeRegistryImplementation contract
    /// @dev Sets up access control by configuring the system access manager
    /// @param systemAccessManager The address of the centralized system access manager
    /// @param initialAdmin The address that will receive admin and registrar roles
    /// @param initialRegistrars The addresses that will receive registrar roles
    function initialize(
        address systemAccessManager,
        address initialAdmin,
        address[] memory initialRegistrars
    )
        external;

    /// @notice Registers topic schemes during initialization without access control checks
    /// @dev To be used only during system bootstrap, should never be called directly by users
    /// @param names Array of topic scheme names
    /// @param signatures Array of topic scheme signatures
    function initializeTopicSchemes(string[] calldata names, string[] calldata signatures) external;
}
