// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ISMARTTrustedIssuersRegistry } from "../../smart/interface/ISMARTTrustedIssuersRegistry.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";

/**
 * @title IATKTrustedIssuersRegistry
 * @author SettleMint
 * @notice Interface for the ATK Trusted Issuers Registry, managing trusted claim issuers
 * @dev Extends ISMARTTrustedIssuersRegistry to provide ATK-specific initialization functionality.
 *      This registry maintains a list of trusted entities that can issue claims for identity verification.
 */
interface IATKTrustedIssuersRegistry is ISMARTTrustedIssuersRegistry, IATKSystemAccessManaged {
    /// @notice Initializes the registry with an initial admin and registrars.
    /// @param accessManager The address of the access manager
    function initialize(address accessManager) external;
}
