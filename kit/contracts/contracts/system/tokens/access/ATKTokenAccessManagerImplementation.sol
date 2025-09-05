// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

// Interface import
import { ISMARTTokenAccessManager } from "../../../smart/extensions/access-managed/ISMARTTokenAccessManager.sol";

/// @title Centralized Access Control Manager for ATK Tokens (Upgradeable)
/// @author SettleMint
/// @notice This contract is a dedicated manager for handling roles and permissions across multiple
///         ATK token contracts. Instead of each token managing its own access control, they can
///         delegate these checks to an instance of this `ATKTokenAccessManager`.
///         This promotes consistency, simplifies role management (as roles are managed in one place),
///         and can save gas by deploying this logic once and reusing it.
/// @dev This contract inherits from OpenZeppelin's `AccessControlUpgradeable` to get robust
///      role-based access control features (like granting, revoking, renouncing roles) and
///      `ERC2771ContextUpgradeable` to support meta-transactions.
///      It is designed to be upgradeable using a Transparent Proxy Pattern.
///      Meta-transactions allow users to interact with contracts without needing ETH for gas fees,
///      as a trusted "forwarder" can relay their transactions.
contract ATKTokenAccessManagerImplementation is
    Initializable,
    ISMARTTokenAccessManager,
    AccessControlUpgradeable,
    ERC2771ContextUpgradeable
{
    error NoInitialAdmins();

    /// @notice Constructor for the ATKTokenAccessManager.
    /// @dev Initializes the contract with a forwarder address.
    /// @param forwarder The address of the trusted forwarder contract.
    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) {
        _disableInitializers();
    }

    // Note: DEFAULT_ADMIN_ROLE is a special role (bytes32(0)) inherited from OpenZeppelin's AccessControl.
    // Accounts with this role can manage other roles (grant/revoke them).

    /// @notice Initializes the access manager.
    /// @dev This function replaces the constructor and should be called only once, typically by the deployer
    ///      or an upgrade mechanism.
    ///      It grants the `DEFAULT_ADMIN_ROLE` to the initial admin.
    /// @param initialAdmins Address of the initial admin for the token.
    function initialize(address[] calldata initialAdmins) public initializer {
        __AccessControl_init();

        if (initialAdmins.length == 0) {
            revert NoInitialAdmins();
        }

        // Grant standard admin role (can manage other roles) to the initial admin
        for (uint256 i = 0; i < initialAdmins.length; ++i) {
            _grantRole(DEFAULT_ADMIN_ROLE, initialAdmins[i]);
        }
    }

    /// @notice Checks if a given account has a specific role.
    /// @dev This function implements `hasRole` from both `ISMARTTokenAccessManager` and OpenZeppelin's
    /// `IAccessControlUpgradeable`.
    ///      It directly uses the `hasRole` function inherited from OpenZeppelin's `AccessControlUpgradeable` contract,
    ///      which contains the actual logic for checking role assignments.
    ///      The `override` keyword is used because this function is redefining a function from its parent
    /// contracts/interfaces.
    ///      The `virtual` keyword indicates that this function can, in turn, be overridden by contracts that inherit
    /// from `ATKTokenAccessManager`.
    /// @param role The `bytes32` identifier of the role to check.
    /// @param account The address of the account whose roles are being checked.
    /// @return hasIt true if the account has the specified role, false otherwise.
    function hasRole(
        bytes32 role,
        address account
    )
        public
        view
        virtual
        override(ISMARTTokenAccessManager, AccessControlUpgradeable)
        returns (bool)
    {
        return super.hasRole(role, account);
    }

    /// @notice Grants `role` to each address in `accounts`.
    /// @dev This function now calls the `grantRole` from `AccessControlUpgradeable`.
    ///      Requires the caller to have the admin role for `role`.
    /// @param role The role identifier to grant.
    /// @param accounts The addresses that will receive the role.
    function batchGrantRole(bytes32 role, address[] calldata accounts) external override {
        uint256 length = accounts.length;
        for (uint256 i = 0; i < length;) {
            grantRole(role, accounts[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Revokes `role` from each address in `accounts`.
    /// @dev This function now calls the `revokeRole` from `AccessControlUpgradeable`.
    ///      Requires the caller to have the admin role for `role`.
    /// @param role The role identifier to revoke.
    /// @param accounts The addresses that will lose the role.
    function batchRevokeRole(bytes32 role, address[] calldata accounts) external override {
        uint256 length = accounts.length;
        for (uint256 i = 0; i < length;) {
            revokeRole(role, accounts[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Grants multiple roles to a single account.
    /// @dev This function calls the `grantRole` from `AccessControlUpgradeable` for each role.
    ///      Requires the caller to have the admin role for each `role` being granted.
    /// @param account The address that will receive all the roles.
    /// @param roles The array of role identifiers to grant.
    function grantMultipleRoles(address account, bytes32[] calldata roles) external override {
        uint256 length = roles.length;
        for (uint256 i = 0; i < length;) {
            grantRole(roles[i], account);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Revokes multiple roles from a single account.
    /// @dev This function calls the `revokeRole` from `AccessControlUpgradeable` for each role.
    ///      Requires the caller to have the admin role for each `role` being revoked.
    /// @param account The address that will lose all the roles.
    /// @param roles The array of role identifiers to revoke.
    function revokeMultipleRoles(address account, bytes32[] calldata roles) external override {
        uint256 length = roles.length;
        for (uint256 i = 0; i < length;) {
            revokeRole(roles[i], account);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Renounces multiple roles from the calling account.
    /// @dev This function calls the `renounceRole` from `AccessControlUpgradeable` for each role.
    ///      Requires the caller to have the admin role for each `role` being revoked.
    /// @param roles The array of role identifiers to renounce.
    /// @param callerConfirmation The address that will confirm the renouncement.
    function renounceMultipleRoles(bytes32[] calldata roles, address callerConfirmation) external override {
        uint256 length = roles.length;
        for (uint256 i = 0; i < length;) {
            renounceRole(roles[i], callerConfirmation);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Overrides the `_msgSender()` function to support meta-transactions via ERC2771.
    /// @dev This internal function is crucial for contracts that use `ERC2771ContextUpgradeable`.
    ///      When a function call is relayed through a trusted forwarder, `msg.sender` would be
    ///      the forwarder's address. `_msgSender()` correctly identifies the original user
    ///      who initiated the transaction.
    ///      This ensures that access control checks and role assignments are based on the
    ///      actual user, not the intermediary forwarder.
    /// @return The address of the original transaction initiator.
    function _msgSender()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address)
    {
        return super._msgSender(); // Calls the implementation from ERC2771ContextUpgradeable
    }

    /// @notice Overrides the `_msgData()` function to support meta-transactions via ERC2771.
    /// @dev Similar to `_msgSender()`, this function retrieves the original call data when a
    ///      transaction is relayed through a trusted forwarder.
    /// @return The original `msg.data` from the user's transaction.
    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData(); // Calls the implementation from ERC2771ContextUpgradeable
    }

    /// @notice Overrides `_contextSuffixLength` for ERC2771 compatibility.
    /// @dev This function is part of the ERC2771 standard, indicating if the calldata includes
    ///      a suffix with the sender's address (appended by the forwarder).
    /// @return The length of the context suffix if present, otherwise 0.
    function _contextSuffixLength()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return super._contextSuffixLength(); // Calls the implementation from ERC2771ContextUpgradeable
    }

    /// @notice Declares support for interfaces, including `ISMARTTokenAccessManager`.
    /// @dev This function allows other contracts to query if this contract implements a specific interface,
    ///      adhering to the ERC165 standard (Standard Interface Detection).
    ///      It checks if the given `interfaceId` matches `type(ISMARTTokenAccessManager).interfaceId`
    ///      or any interface supported by its parent `AccessControlUpgradeable` (which includes ERC165 itself
    ///      and `IAccessControl`).
    /// @param interfaceId The bytes4 identifier of the interface to check for support.
    /// @return supported true if the contract supports the interface, false otherwise.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlUpgradeable)
        returns (bool)
    {
        return interfaceId == type(ISMARTTokenAccessManager).interfaceId || super.supportsInterface(interfaceId);
    }
}
