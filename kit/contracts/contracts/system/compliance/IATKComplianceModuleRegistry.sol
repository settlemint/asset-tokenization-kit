// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

/**
 * @title IATKComplianceModuleRegistry
 * @author SettleMint
 * @notice Interface for the ATK Compliance Module Registry, managing available compliance modules
 * @dev This registry maintains a list of approved compliance modules that can be used by tokens
 *      in the ATK ecosystem. Compliance modules implement various regulatory requirements such as
 *      identity verification, country restrictions, and allowlisting.
 */
interface IATKComplianceModuleRegistry is IAccessControl {
    event ComplianceModuleRegistered(
        address indexed sender, string name, bytes32 typeId, address indexed moduleAddress, uint256 timestamp
    );

    error NoInitialAdmins();

    function registerComplianceModule(address moduleAddress) external;

    function complianceModule(bytes32 moduleTypeHash) external view returns (address);

    function initialize(address[] memory initialAdmins) external;
}
