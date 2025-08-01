// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ISMARTTopicSchemeRegistry } from "../../smart/interface/ISMARTTopicSchemeRegistry.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";

/**
 * @title IATKTopicSchemeRegistry
 * @author SettleMint
 * @notice Interface for the ATK Topic Scheme Registry, managing claim topic schemes
 * @dev Extends ISMARTTopicSchemeRegistry to provide ATK-specific initialization functionality
 *      for managing claim topic schemes within the ATK token ecosystem
 */
interface IATKTopicSchemeRegistry is ISMARTTopicSchemeRegistry, IATKSystemAccessManaged {
    /// @notice Initializes the topic scheme registry with system access manager
    /// @param accessManager The address of the access manager
    function initialize(address accessManager) external;
}
