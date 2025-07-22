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
    function initialize(address initialAdmin) external;
}
