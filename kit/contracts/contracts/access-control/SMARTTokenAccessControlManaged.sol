// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol"; // Or use different access control if needed
import { ISMARTTokenAccessControlManager } from "./interfaces/ISMARTTokenAccessControlManager.sol";
import { SMARTExtensionAccessControlAuthorization } from
    "smart-protocol/contracts/extensions/common/SMARTExtensionAccessControlAuthorization.sol";
/// @title Abstract contract for SMART tokens managed by a central Access Control Manager
/// @notice Provides storage and basic management for linking a token contract to its
///         `SMARTTokenAccessControlManager` instance.
/// @dev Inheriting contracts should call the constructor with the manager address and
///      implement the required authorization hooks by delegating to the manager.

abstract contract SMARTTokenAccessControlManaged is SMARTExtensionAccessControlAuthorization {
    /// @notice The address of the central access control manager contract.
    ISMARTTokenAccessControlManager internal _accessManager;

    /// @notice Emitted when the access manager address is changed.
    event AccessManagerUpdated(address indexed oldManager, address indexed newManager);

    /// @dev Error thrown if the provided manager address is the zero address.
    error ZeroAddressManager();

    /// @dev Sets the initial access manager address during deployment.
    /// @param manager The address of the `SMARTTokenAccessControlManager` instance.
    constructor(address manager) {
        if (manager == address(0)) revert ZeroAddressManager();
        _accessManager = ISMARTTokenAccessControlManager(manager);
        emit AccessManagerUpdated(address(0), manager);
    }

    /// @notice Returns the address of the current access manager.
    /// @return The address of the manager.
    function getAccessManager() public view returns (address) {
        return address(_accessManager);
    }

    /// @dev Internal function to retrieve the manager interface instance.
    /// @return The `ISMARTTokenAccessControlManager` instance.
    function _getManager() internal view returns (ISMARTTokenAccessControlManager) {
        return _accessManager;
    }

    function hasRole(bytes32 role, address account) public view virtual override returns (bool) {
        return _accessManager.hasRole(role, account);
    }
}
