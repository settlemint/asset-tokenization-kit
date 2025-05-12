// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// openzeppelin imports
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

// SMART imports
import { SMARTExtensionAccessControlAuthorization } from
    "smart-protocol/contracts/extensions/common/SMARTExtensionAccessControlAuthorization.sol";
import { SMARTTokenAccessControlManaged } from "../SMARTTokenAccessControlManaged.sol";

// Internal implementation imports
import { _SMARTBurnableAuthorizationHooks } from
    "smart-protocol/contracts/extensions/burnable/internal/_SMARTBurnableAuthorizationHooks.sol";

/// @title Access Control Authorization for SMART Burnable Extension
/// @notice Implements authorization logic for the SMART Burnable extension using OpenZeppelin's AccessControl.
/// @dev Defines the `BURNER_ROLE` and requires the caller of burn operations to have this role.
///      Compatible with both standard and upgradeable AccessControl implementations.
abstract contract SMARTBurnableAccessControlManagerAuthorization is
    _SMARTBurnableAuthorizationHooks,
    SMARTExtensionAccessControlAuthorization,
    SMARTTokenAccessControlManaged
{
    /// @inheritdoc _SMARTBurnableAuthorizationHooks
    function _authorizeBurn() internal view virtual override {
        _getManager().authorizeBurn(_msgSender());
    }
}
