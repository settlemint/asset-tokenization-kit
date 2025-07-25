// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IATKSystemAccessManager } from "./IATKSystemAccessManager.sol";

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/// @title ATKSystemAccessManagerImplementation
/// @author SettleMint
/// @notice Implementation contract for the ATK System Access Manager
/// @dev This contract manages access control for the ATK system using role-based permissions
contract ATKSystemAccessManagerImplementation is
    Initializable,
    AccessControlUpgradeable,
    ERC2771ContextUpgradeable,
    IATKSystemAccessManager
{
        error NoInitialAdmins();

    /// @notice Constructor that disables initializers and sets the trusted forwarder
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) {
        _disableInitializers();
    }

    /// @notice Initializes the access manager with initial admin accounts
    /// @param initialAdmins Array of addresses to be granted the default admin role
    /// @dev Reverts if no initial admins are provided
    function initialize(address[] calldata initialAdmins) public initializer {
        __AccessControl_init();

        if (initialAdmins.length == 0) {
            revert NoInitialAdmins();
        }

        for (uint256 i = 0; i < initialAdmins.length; ++i) {
            _grantRole(DEFAULT_ADMIN_ROLE, initialAdmins[i]);
        }
    }

    // --- Internal Role Checking Functions ---

    /// @notice Internal function to check if an account has any of the specified roles
    /// @param roles Array of role identifiers to check
    /// @param account The account to check
    /// @return True if the account has at least one of the roles, false otherwise
    function _hasAnyRole(bytes32[] memory roles, address account) internal view returns (bool) {
        for (uint256 i = 0; i < roles.length; ++i) {
            if (hasRole(roles[i], account)) {
                return true;
            }
        }
        return false;
    }

    // --- Access Control Modifiers ---

    /// @notice Modifier that checks if the caller has any of the specified roles
    /// @dev This implements the pattern mentioned in the ticket: onlyRoles(MANAGER_ROLE, [SYSTEM_ROLES])
    /// @param roles Array of roles, where the caller must have at least one
    modifier onlyRoles(bytes32[] memory roles) {
        if (!_hasAnyRole(roles, _msgSender())) {
            // Use OpenZeppelin's standard AccessControl error
            revert AccessControlUnauthorizedAccount(_msgSender(), roles.length > 0 ? roles[0] : bytes32(0));
        }
        _;
    }

    /// @notice Modifier that checks if the caller has a specific single role
    /// @dev For backward compatibility with existing contracts
    /// @param role The role to check
    modifier onlySystemRole(bytes32 role) {
        if (!hasRole(role, _msgSender())) {
            revert AccessControlUnauthorizedAccount(_msgSender(), role);
        }
        _;
    }

    // --- Role Checking Functions ---


    /// @notice Checks if an account has a specific role
    /// @param role The role identifier to check
    /// @param account The address to check for the role
    /// @return bool True if the account has the role, false otherwise

    function hasRole(
        bytes32 role,
        address account
    )
        public
        view
        override(IATKSystemAccessManager, AccessControlUpgradeable)
        returns (bool)
    {
        return super.hasRole(role, account);
    }

    /// @notice Checks if an account has any of the specified roles
    /// @param roles Array of role identifiers to check
    /// @param account The address to check roles for
    /// @return True if the account has at least one of the specified roles, false otherwise
    function hasAnyRole(bytes32[] calldata roles, address account) external view override returns (bool) {
        return _hasAnyRole(roles, account);
    }

    // --- Role Management Functions ---

    /// @notice Grants a role to an account
    /// @param role The role identifier to grant
    /// @param account The address to grant the role to
    /// @dev Caller must have the role's admin role
    function grantRole(
        bytes32 role,
        address account
    )
        public
        override(IATKSystemAccessManager, AccessControlUpgradeable)
        onlyRole(getRoleAdmin(role))
    {
        super.grantRole(role, account);
    }

    /// @notice Revokes a role from an account
    /// @param role The role identifier to revoke
    /// @param account The address to revoke the role from
    /// @dev Caller must have the role's admin role
    function revokeRole(
        bytes32 role,
        address account
    )
        public
        override(IATKSystemAccessManager, AccessControlUpgradeable)
        onlyRole(getRoleAdmin(role))
    {
        super.revokeRole(role, account);
    }

    /// @notice Allows an account to renounce a role
    /// @param role The role identifier to renounce
    /// @param account The address renouncing the role (must be msg.sender)
    /// @dev Can only renounce roles for yourself
    function renounceRole(
        bytes32 role,
        address account
    )
        public
        override(IATKSystemAccessManager, AccessControlUpgradeable)
    {
        super.renounceRole(role, account);
    }

    /// @notice Grants a role to multiple accounts in a single transaction
    /// @param role The role identifier to grant
    /// @param accounts Array of addresses to grant the role to
    /// @dev Caller must have the role's admin role for each grant
    function batchGrantRole(bytes32 role, address[] calldata accounts) external override {
        for (uint256 i = 0; i < accounts.length;) {
            grantRole(role, accounts[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Revokes a role from multiple accounts in a single transaction
    /// @param role The role identifier to revoke
    /// @param accounts Array of addresses to revoke the role from
    /// @dev Caller must have the role's admin role for each revocation
    function batchRevokeRole(bytes32 role, address[] calldata accounts) external override {
        for (uint256 i = 0; i < accounts.length;) {
            revokeRole(role, accounts[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Grants multiple roles to a single account
    /// @param account The address to grant roles to
    /// @param roles Array of role identifiers to grant
    /// @dev Caller must have the admin role for each role being granted
    function grantMultipleRoles(address account, bytes32[] calldata roles) external {
        for (uint256 i = 0; i < roles.length;) {
            grantRole(roles[i], account);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Revokes multiple roles from a single account
    /// @param account The address to revoke roles from
    /// @param roles Array of role identifiers to revoke
    /// @dev Caller must have the admin role for each role being revoked
    function revokeMultipleRoles(address account, bytes32[] calldata roles) external {
        for (uint256 i = 0; i < roles.length;) {
            revokeRole(roles[i], account);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Allows an account to renounce multiple roles
    /// @param roles Array of role identifiers to renounce
    /// @param callerConfirmation Address confirmation (must match msg.sender)
    /// @dev Can only renounce roles for yourself
    function renounceMultipleRoles(bytes32[] calldata roles, address callerConfirmation) external {
        for (uint256 i = 0; i < roles.length;) {
            renounceRole(roles[i], callerConfirmation);
            unchecked {
                ++i;
            }
        }
    }

    // --- Meta-transaction Support ---

    /// @notice Returns the address of the current message sender
    /// @return The address of the message sender, accounting for meta-transactions
    /// @dev Overrides to use ERC2771 context for meta-transaction support
    function _msgSender()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address)
    {
        return super._msgSender(); // Calls the implementation from ERC2771ContextUpgradeable
    }

    /// @notice Returns the calldata of the current transaction
    /// @return The calldata, accounting for meta-transactions
    /// @dev Overrides to use ERC2771 context for meta-transaction support
    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData(); // Calls the implementation from ERC2771ContextUpgradeable
    }

    /// @notice Returns the length of the context suffix for meta-transactions
    /// @return The length of the context suffix
    /// @dev Overrides to use ERC2771 context for meta-transaction support
    function _contextSuffixLength()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return super._contextSuffixLength(); // Calls the implementation from ERC2771ContextUpgradeable
    }

    /// @notice Checks if the contract supports a given interface
    /// @param interfaceId The interface identifier to check
    /// @return bool True if the interface is supported, false otherwise
    function supportsInterface(bytes4 interfaceId) public view override(AccessControlUpgradeable) returns (bool) {
        return interfaceId == type(IATKSystemAccessManager).interfaceId || super.supportsInterface(interfaceId);
    }
}
