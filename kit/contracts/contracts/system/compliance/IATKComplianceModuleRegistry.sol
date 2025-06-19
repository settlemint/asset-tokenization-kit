// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

interface IATKComplianceModuleRegistry is IAccessControl {
    event ComplianceModuleRegistered(
        address indexed sender, string name, bytes32 typeId, address indexed moduleAddress, uint256 timestamp
    );

    function registerComplianceModule(address moduleAddress) external;

    function complianceModule(bytes32 moduleTypeHash) external view returns (address);

    function initialize(address[] memory initialAdmins) external;
}
