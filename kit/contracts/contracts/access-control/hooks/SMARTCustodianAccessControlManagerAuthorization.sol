// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// openzeppelin imports
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

// SMART imports
import { SMARTExtensionAccessControlAuthorization } from
    "smart-protocol/contracts/extensions/common/SMARTExtensionAccessControlAuthorization.sol";
import { SMARTTokenAccessControlManaged } from "../SMARTTokenAccessControlManaged.sol";

// Internal implementation imports
import { _SMARTCustodianAuthorizationHooks } from
    "smart-protocol/contracts/extensions/custodian/internal/_SMARTCustodianAuthorizationHooks.sol";

/// @title Access Control Authorization for SMART Custodian Extension
/// @notice Implements authorization logic for the SMART Custodian features using OpenZeppelin's AccessControl.
/// @dev Defines specific roles (FREEZER_ROLE, FORCED_TRANSFER_ROLE, RECOVERY_ROLE)
///      and implements the authorization hooks from `_SMARTCustodianAuthorizationHooks` to enforce these roles.
///      Compatible with both standard and upgradeable AccessControl implementations.
abstract contract SMARTCustodianAccessControlManagerAuthorization is
    _SMARTCustodianAuthorizationHooks,
    SMARTExtensionAccessControlAuthorization,
    SMARTTokenAccessControlManaged
{
    /// @inheritdoc _SMARTCustodianAuthorizationHooks
    function _authorizeFreezeAddress() internal view virtual override {
        _getManager().authorizeFreezeAddress(_msgSender());
    }

    /// @inheritdoc _SMARTCustodianAuthorizationHooks
    function _authorizeFreezePartialTokens() internal view virtual override {
        _getManager().authorizeFreezePartialTokens(_msgSender());
    }

    /// @inheritdoc _SMARTCustodianAuthorizationHooks
    function _authorizeForcedTransfer() internal view virtual override {
        _getManager().authorizeForcedTransfer(_msgSender());
    }

    /// @inheritdoc _SMARTCustodianAuthorizationHooks
    function _authorizeRecoveryAddress() internal view virtual override {
        _getManager().authorizeRecoveryAddress(_msgSender());
    }
}
