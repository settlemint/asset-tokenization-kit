// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// openzeppelin imports
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

// SMART imports
import { SMARTExtensionAccessControlAuthorization } from
    "smart-protocol/contracts/extensions/common/SMARTExtensionAccessControlAuthorization.sol";
import { SMARTTokenAccessControlManaged } from "../SMARTTokenAccessControlManaged.sol";
// Internal implementation imports
import { _SMARTPausableAuthorizationHooks } from
    "smart-protocol/contracts/extensions/pausable/internal/_SMARTPausableAuthorizationHooks.sol";

/// @title Access Control Authorization for SMART Pausable Extension
/// @notice Implements authorization logic for the SMART Pausable features using OpenZeppelin's AccessControl.
/// @dev Defines the `PAUSER_ROLE` and implements the `_authorizePause` hook from `_SMARTPausableAuthorizationHooks`.
///      Compatible with both standard and upgradeable AccessControl implementations.

abstract contract SMARTPausableAccessControlManagerAuthorization is
    _SMARTPausableAuthorizationHooks,
    SMARTExtensionAccessControlAuthorization,
    SMARTTokenAccessControlManaged
{
    /// @inheritdoc _SMARTPausableAuthorizationHooks
    function _authorizePause() internal view virtual override {
        _getManager().authorizePause(_msgSender());
    }
}
