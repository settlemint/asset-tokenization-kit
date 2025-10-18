// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ZeroAddressNotAllowed } from "../ATKSystemErrors.sol";
import { IATKSystemAccessManager } from "./IATKSystemAccessManager.sol";
import { IATKSystemAccessManaged } from "./IATKSystemAccessManaged.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title Internal Logic for ATK System Access Management
/// @author SettleMint
/// @notice This abstract contract encapsulates the core shared logic for managing access
///         control in ATK System components. It handles the storage of the access manager's address
///         and provides internal functions for role checks and initialization.
///         Using an internal logic contract helps to avoid code duplication between
///         the standard and upgradeable versions of an extension and promotes modularity.
/// @dev This contract is not meant to be deployed directly but rather inherited by
///      `ATKSystemAccessManaged` and `ATKSystemAccessManagedUpgradeable` contracts.
///      It implements access management by delegating `hasRole` checks to the
///      configured `_accessManager`.
abstract contract ATKSystemAccessManaged is IATKSystemAccessManaged {
    /// @notice The blockchain address of the central `ATKSystemAccessManager` contract.
    /// @dev This manager contract is responsible for all role assignments and checks.
    ///      This variable is declared `internal`, meaning it's accessible within this contract
    ///      and any contracts that inherit from it, but not externally.
    address internal _accessManager;

    /// @notice Error thrown when the access manager is not a valid `IATKSystemAccessManager` contract.
    error InvalidAccessManager();

    /// @notice Internal function to get the sender of the message.
    /// @dev This function is used to get the sender of the message.
    /// @return The address of the sender of the message.
    function _msgSender() internal view virtual returns (address);

    // -- Internal Setup Function --

    /// @notice Internal function to initialize the access managed logic.
    /// @dev Sets the address of the `ATKSystemAccessManager` and registers the access management.
    ///      It also emits an `AccessManagerSet` event.
    ///      This function is "unchained," meaning it doesn't call any parent initializers directly,
    ///      allowing for more flexible initialization patterns in inheriting contracts.
    ///      It reverts with `ZeroAddressNotAllowed` if `accessManager_` is the zero address,
    ///      as a valid manager address is essential for functionality.
    /// @param accessManager_ The address of the `ATKSystemAccessManager` contract.
    function __ATKSystemAccessManaged_init(address accessManager_) internal {
        if (accessManager_ == address(0)) {
            revert ZeroAddressNotAllowed();
        }
        if (!IERC165(accessManager_).supportsInterface(type(IATKSystemAccessManager).interfaceId)) {
            revert InvalidAccessManager();
        }
        _accessManager = accessManager_;

        emit AccessManagerSet(_msgSender(), accessManager_);
    }

    /// @dev Modifier: Restricts access to a function to only accounts that have a specific role
    ///      as determined by the `_accessManager`.
    ///      A 'modifier' in Solidity is a way to change the behavior of a function.
    ///      It typically checks a condition before executing the function's code.
    ///      If the condition checked by `_checkRole` is not met, the transaction will revert.
    ///      The `_` (underscore) in the modifier's body is where the code of the function
    ///      using this modifier will be executed.
    /// @param role The `bytes32` identifier of the role required to access the function.
    modifier onlySystemRole(bytes32 role) {
        _checkSystemRole(role, _msgSender());
        _;
    }

    /// @dev Modifier: Restricts access to accounts that have ANY of the specified roles (OR logic).
    ///      Useful when multiple roles should be able to access a function.
    /// @param roles Array of role identifiers, account needs at least one.
    modifier onlySystemRoles(bytes32[] memory roles) {
        _checkAnySystemRole(roles, _msgSender());
        _;
    }

    /// @dev Modifier: Two roles version - ANY (OR logic)
    modifier onlySystemRoles2(bytes32 role1, bytes32 role2) {
        _onlySystemRoles2(role1, role2);
        _;
    }

    /// @notice Verifies caller has at least one of two system roles.
    /// @param role1 First permissible role.
    /// @param role2 Second permissible role.
    function _onlySystemRoles2(bytes32 role1, bytes32 role2) internal view {
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = role1;
        roles[1] = role2;
        _checkAnySystemRole(roles, _msgSender());
    }

    /// @dev Modifier: Three roles version - ANY (OR logic)
    modifier onlySystemRoles3(bytes32 role1, bytes32 role2, bytes32 role3) {
        _onlySystemRoles3(role1, role2, role3);
        _;
    }

    /// @notice Verifies caller has at least one of three system roles.
    /// @param role1 First permissible role.
    /// @param role2 Second permissible role.
    /// @param role3 Third permissible role.
    function _onlySystemRoles3(bytes32 role1, bytes32 role2, bytes32 role3) internal view {
        bytes32[] memory roles = new bytes32[](3);
        roles[0] = role1;
        roles[1] = role2;
        roles[2] = role3;
        _checkAnySystemRole(roles, _msgSender());
    }

    /// @dev Modifier: Restricts access to accounts that have ALL of the specified roles (AND logic).
    ///      Useful when a function requires multiple permissions.
    /// @param roles Array of role identifiers, account needs all of them.
    modifier onlySystemRolesAll(bytes32[] memory roles) {
        _checkAllSystemRoles(roles, _msgSender());
        _;
    }

    /// @notice Returns the address of the current `ATKSystemAccessManager`.
    /// @dev This is an external view function, meaning it can be called from outside the
    ///      contract without consuming gas (if called via a node's RPC) and it does not
    ///      modify the contract's state.
    /// @return The address of the `_accessManager`.
    function accessManager() external view override returns (address) {
        return _accessManager;
    }

    /// @notice Checks if a given account has a specific role, as defined by the `_accessManager`.
    /// @dev This function implements access management by delegating the role check to the
    ///      `hasRole` function of the `_accessManager` contract.
    ///      The `virtual` keyword means that this function can be overridden by inheriting contracts.
    /// @param role The `bytes32` identifier of the role to check.
    /// @param account The address of the account whose roles are being checked.
    /// @return hasRole_ `true` if the account has the role, `false` otherwise.
    function hasSystemRole(bytes32 role, address account) external view virtual returns (bool) {
        return _hasSystemRole(role, account);
    }

    /// @notice Internal view function to check if an account has a specific role.
    /// @dev This function performs the actual call to the `_accessManager`.
    ///      Being `internal`, it can only be called from within this contract or derived contracts.
    /// @param role The `bytes32` identifier of the role.
    /// @param account The address of the account.
    /// @return hasRole_ `true` if the account possesses the role, `false` otherwise.
    function _hasSystemRole(bytes32 role, address account) internal view returns (bool) {
        return IATKSystemAccessManager(_accessManager).hasRole(role, account);
    }

    /// @notice Internal view function to verify if an account has a specific role.
    /// @dev If the account does not have the role, this function reverts the transaction
    ///      with an `AccessControlUnauthorizedAccount` error, providing the account address
    ///      and the role that was needed.
    ///      This is often used in modifiers or at the beginning of functions to guard access.
    /// @param role The `bytes32` identifier of the role to check for.
    /// @param account The address of the account to verify.
    function _checkSystemRole(bytes32 role, address account) internal view {
        if (!_hasSystemRole(role, account)) {
            revert AccessControlUnauthorizedAccount(account, role);
        }
    }

    /// @notice Internal view function to verify if an account has ANY of the specified roles.
    /// @dev If the account does not have any of the roles, this function reverts with
    ///      `AccessControlUnauthorizedAccount` using the first role in the array as reference.
    /// @param roles Array of role identifiers to check for.
    /// @param account The address of the account to verify.
    function _checkAnySystemRole(bytes32[] memory roles, address account) internal view {
        for (uint256 i = 0; i < roles.length; ++i) {
            if (_hasSystemRole(roles[i], account)) {
                return; // Account has at least one role, access granted
            }
        }
        // Account has none of the required roles
        revert AccessControlUnauthorizedAccount(account, roles.length > 0 ? roles[0] : bytes32(0));
    }

    /// @notice Internal view function to verify if an account has ALL of the specified roles.
    /// @dev If the account does not have any of the roles, this function reverts with
    ///      `AccessControlUnauthorizedAccount` using the missing role as reference.
    /// @param roles Array of role identifiers to check for.
    /// @param account The address of the account to verify.
    function _checkAllSystemRoles(bytes32[] memory roles, address account) internal view {
        for (uint256 i = 0; i < roles.length; ++i) {
            if (!_hasSystemRole(roles[i], account)) {
                revert AccessControlUnauthorizedAccount(account, roles[i]);
            }
        }
    }

    /// @notice Internal function to grant a role to an account.
    /// @dev This function grants a role to an account by calling the `grantRole` function of the `_accessManager`.
    /// @param role The `bytes32` identifier of the role to grant.
    /// @param account The address of the account to grant the role to.
    function _grantRole(bytes32 role, address account) internal {
        IATKSystemAccessManager(_accessManager).grantRole(role, account);
    }

    /// @notice Internal function to revoke a role from an account.
    /// @dev This function revokes a role from an account by calling the `revokeRole` function of the `_accessManager`.
    /// @param role The `bytes32` identifier of the role to revoke.
    /// @param account The address of the account to revoke the role from.
    function _revokeRole(bytes32 role, address account) internal {
        IATKSystemAccessManager(_accessManager).revokeRole(role, account);
    }
}
