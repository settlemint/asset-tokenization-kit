// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ISMARTTopicSchemeRegistry } from "../../smart/interface/ISMARTTopicSchemeRegistry.sol";

/**
 * @title IATKTopicSchemeRegistry
 * @author SettleMint
 * @notice Interface for the ATK Topic Scheme Registry, managing claim topic schemes
 * @dev Extends ISMARTTopicSchemeRegistry to provide ATK-specific initialization functionality
 *      for managing claim topic schemes within the ATK token ecosystem
 */
interface IATKTopicSchemeRegistry is ISMARTTopicSchemeRegistry {
    function initialize(address initialAdmin, address[] memory initialRegistrars) external;
}
