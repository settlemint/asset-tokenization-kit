// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// openzeppelin imports
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

// SMART imports
import { SMARTExtensionAccessControlAuthorization } from
    "smart-protocol/contracts/extensions/common/SMARTExtensionAccessControlAuthorization.sol";
import { SMARTTokenAccessControlManaged } from "../SMARTTokenAccessControlManaged.sol";
// Internal implementation imports
import { _SMARTAuthorizationHooks } from
    "smart-protocol/contracts/extensions/core/internal/_SMARTAuthorizationHooks.sol";

/// @title Access Control Authorization for Core SMART Functionality
/// @notice Implements authorization logic for the core SMART operations using OpenZeppelin's AccessControl.
/// @dev Defines specific roles (TOKEN_ADMIN, COMPLIANCE_ADMIN, VERIFICATION_ADMIN, MINTER)
///      and implements the authorization hooks from `_SMARTAuthorizationHooks` to enforce these roles.
///      Compatible with both standard and upgradeable AccessControl implementations.
abstract contract SMARTAccessControlManagerAuthorization is
    _SMARTAuthorizationHooks,
    SMARTExtensionAccessControlAuthorization,
    SMARTTokenAccessControlManaged
{
    /// @inheritdoc _SMARTAuthorizationHooks
    function _authorizeUpdateTokenSettings() internal view virtual override {
        _getManager().authorizeUpdateTokenSettings(_msgSender());
    }

    /// @inheritdoc _SMARTAuthorizationHooks
    function _authorizeUpdateComplianceSettings() internal view virtual override {
        _getManager().authorizeUpdateComplianceSettings(_msgSender());
    }

    /// @inheritdoc _SMARTAuthorizationHooks
    function _authorizeUpdateVerificationSettings() internal view virtual override {
        _getManager().authorizeUpdateVerificationSettings(_msgSender());
    }

    /// @inheritdoc _SMARTAuthorizationHooks
    function _authorizeMintToken() internal view virtual override {
        _getManager().authorizeMintToken(_msgSender());
    }

    /// @inheritdoc _SMARTAuthorizationHooks
    function _authorizeRecoverERC20() internal view virtual override {
        _getManager().authorizeRecoverERC20(_msgSender());
    }
}
