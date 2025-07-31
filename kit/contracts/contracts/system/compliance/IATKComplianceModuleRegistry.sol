// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";

/**
 * @title IATKComplianceModuleRegistry
 * @author SettleMint
 * @notice Interface for the ATK Compliance Module Registry, managing available compliance modules
 * @dev This registry maintains a list of approved compliance modules that can be used by tokens
 *      in the ATK ecosystem. Compliance modules implement various regulatory requirements such as
 *      identity verification, country restrictions, and allowlisting.
 */
interface IATKComplianceModuleRegistry is IATKSystemAccessManaged {
    /// @notice Emitted when a new compliance module is registered
    /// @param sender The address that registered the module
    /// @param name The name of the compliance module
    /// @param typeId The unique type identifier of the module
    /// @param moduleAddress The address of the registered module
    /// @param timestamp The block timestamp when the module was registered
    event ComplianceModuleRegistered(
        address indexed sender, string name, bytes32 indexed typeId, address indexed moduleAddress, uint256 timestamp
    );

    error NoInitialAdmins();

    /// @notice Registers a new compliance module in the registry
    /// @param moduleAddress The address of the compliance module to register
    function registerComplianceModule(address moduleAddress) external;

    /// @notice Returns the address of a compliance module by its type hash
    /// @param moduleTypeHash The type hash of the compliance module
    /// @return The address of the compliance module, or zero address if not registered
    function complianceModule(bytes32 moduleTypeHash) external view returns (address);

    /// @notice Initializes the compliance module registry with initial admin accounts
    /// @param accessManager The address of the access manager
    function initialize(address accessManager) external;
}
