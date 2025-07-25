// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ISMARTTokenAccessManaged } from "../ISMARTTokenAccessManaged.sol";
import { ISMARTTokenAccessManager } from "../ISMARTTokenAccessManager.sol";
import { _SMARTExtension } from "../../common/_SMARTExtension.sol";

/// @title Internal Logic for SMART Token Access Management Extension
/// @author SettleMint
/// @notice This abstract contract encapsulates the core shared logic for managing access
///         control in SMART tokens. It handles the storage of the access manager's address
///         and provides internal functions for role checks and initialization.
///         Using an internal logic contract helps to avoid code duplication between
///         the standard and upgradeable versions of an extension and promotes modularity.
/// @dev This contract is not meant to be deployed directly but rather inherited by
///      `SMARTTokenAccessManaged` and `SMARTTokenAccessManagedUpgradeable` contracts.
///      It implements `ISMARTTokenAccessManaged` by delegating `hasRole` checks to the
///      configured `_accessManager`.

abstract contract _SMARTTokenAccessManagedLogic is _SMARTExtension, ISMARTTokenAccessManaged {
    /// @notice The blockchain address of the central `SMARTTokenAccessManager` contract.
    /// @dev This manager contract is responsible for all role assignments and checks.
    ///      This variable is declared `internal`, meaning it's accessible within this contract
    ///      and any contracts that inherit from it, but not externally.
    address internal _accessManager;

    // -- Internal Setup Function --

    /// @notice Internal function to initialize the access managed logic.
    /// @dev Sets the address of the `SMARTTokenAccessManager` and registers the
    ///      `ISMARTTokenAccessManaged` interface. It also emits an `AccessManagerSet` event.
    ///      This function is "unchained," meaning it doesn't call any parent initializers directly,
    ///      allowing for more flexible initialization patterns in inheriting contracts.
    ///      It reverts with `ZeroAddressNotAllowed` if `accessManager_` is the zero address,
    ///      as a valid manager address is essential for functionality.
    /// @param accessManager_ The address of the `SMARTTokenAccessManager` contract.
    function __SMARTTokenAccessManaged_init_unchained(address accessManager_) internal {
        if (accessManager_ == address(0)) {
            revert ZeroAddressNotAllowed();
        }
        _accessManager = accessManager_;

        _registerInterface(type(ISMARTTokenAccessManaged).interfaceId);
        emit ISMARTTokenAccessManaged.AccessManagerSet(_smartSender(), accessManager_);
    }

    /// @dev Modifier: Restricts access to a function to only accounts that have a specific role
    ///      as determined by the `_accessManager`.
    ///      A 'modifier' in Solidity is a way to change the behavior of a function.
    ///      It typically checks a condition before executing the function's code.
    ///      If the condition checked by `_checkRole` is not met, the transaction will revert.
    ///      The `_` (underscore) in the modifier's body is where the code of the function
    ///      using this modifier will be executed.
    /// @param role The `bytes32` identifier of the role required to access the function.
    modifier onlyAccessManagerRole(bytes32 role) {
        _checkRole(role, _smartSender());
        _;
    }

    /// @notice Returns the address of the current `SMARTTokenAccessManager`.
    /// @dev This is an external view function, meaning it can be called from outside the
    ///      contract without consuming gas (if called via a node's RPC) and it does not
    ///      modify the contract's state.
    /// @return The address of the `_accessManager`.
    function accessManager() external view returns (address) {
        return _accessManager;
    }

    /// @notice Checks if a given account has a specific role, as defined by the `_accessManager`.
    /// @dev This function implements the `ISMARTTokenAccessManaged` interface.
    ///      It delegates the actual role check to the `hasRole` function of the `_accessManager` contract.
    ///      The `virtual` keyword means that this function can be overridden by inheriting contracts.
    /// @param role The `bytes32` identifier of the role to check.
    /// @param account The address of the account whose roles are being checked.
    /// @return hasRole_ `true` if the account has the role, `false` otherwise.
    function hasRole(bytes32 role, address account) external view virtual override returns (bool) {
        return _hasRole(role, account);
    }

    /// @notice Internal view function to check if an account has a specific role.
    /// @dev This function performs the actual call to the `_accessManager`.
    ///      Being `internal`, it can only be called from within this contract or derived contracts.
    /// @param role The `bytes32` identifier of the role.
    /// @param account The address of the account.
    /// @return hasRole_ `true` if the account possesses the role, `false` otherwise.
    function _hasRole(bytes32 role, address account) internal view returns (bool) {
        return ISMARTTokenAccessManager(_accessManager).hasRole(role, account);
    }

    /// @notice Internal view function to verify if an account has a specific role.
    /// @dev If the account does not have the role, this function reverts the transaction
    ///      with an `AccessControlUnauthorizedAccount` error, providing the account address
    ///      and the role that was needed.
    ///      This is often used in modifiers or at the beginning of functions to guard access.
    /// @param role The `bytes32` identifier of the role to check for.
    /// @param account The address of the account to verify.
    function _checkRole(bytes32 role, address account) internal view {
        if (!_hasRole(role, account)) {
            revert AccessControlUnauthorizedAccount(account, role);
        }
    }
}
