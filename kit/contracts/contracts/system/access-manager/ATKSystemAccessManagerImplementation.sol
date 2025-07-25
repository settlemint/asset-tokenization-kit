// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IATKSystemAccessManager } from "./IATKSystemAccessManager.sol";

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

contract ATKSystemAccessManagerImplementation is
    Initializable,
    AccessControlUpgradeable,
    ERC2771ContextUpgradeable,
    IATKSystemAccessManager
{
        error NoInitialAdmins();

    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) {
        _disableInitializers();
    }

    function initialize(address[] memory initialAdmins) public initializer {
        __AccessControl_init();

        if (initialAdmins.length == 0) {
            revert NoInitialAdmins();
        }

        for (uint256 i = 0; i < initialAdmins.length; i++) {
            _grantRole(DEFAULT_ADMIN_ROLE, initialAdmins[i]);
        }
    }

    // --- Internal Role Checking Functions ---

    /// @notice Internal function to check if an account has any of the specified roles
    /// @param roles Array of role identifiers to check
    /// @param account The account to check
    /// @return True if the account has at least one of the roles, false otherwise
    function _hasAnyRole(bytes32[] memory roles, address account) internal view returns (bool) {
        for (uint256 i = 0; i < roles.length; i++) {
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

    function hasAnyRole(bytes32[] calldata roles, address account) external view override returns (bool) {
        return _hasAnyRole(roles, account);
    }

    // --- Role Management Functions ---

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

    function renounceRole(
        bytes32 role,
        address account
    )
        public
        override(IATKSystemAccessManager, AccessControlUpgradeable)
    {
        super.renounceRole(role, account);
    }

    function batchGrantRole(bytes32 role, address[] calldata accounts) external override {
        for (uint256 i = 0; i < accounts.length;) {
            grantRole(role, accounts[i]);
            unchecked {
                ++i;
            }
        }
    }

    function batchRevokeRole(bytes32 role, address[] calldata accounts) external override {
        for (uint256 i = 0; i < accounts.length;) {
            revokeRole(role, accounts[i]);
            unchecked {
                ++i;
            }
        }
    }

    function grantMultipleRoles(address account, bytes32[] calldata roles) external {
        for (uint256 i = 0; i < roles.length;) {
            grantRole(roles[i], account);
            unchecked {
                ++i;
            }
        }
    }

    function revokeMultipleRoles(address account, bytes32[] calldata roles) external {
        for (uint256 i = 0; i < roles.length;) {
            revokeRole(roles[i], account);
            unchecked {
                ++i;
            }
        }
    }

    function renounceMultipleRoles(bytes32[] calldata roles, address callerConfirmation) external {
        for (uint256 i = 0; i < roles.length;) {
            renounceRole(roles[i], callerConfirmation);
            unchecked {
                ++i;
            }
        }
    }

    // --- Meta-transaction Support ---

    function _msgSender()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address)
    {
        return super._msgSender(); // Calls the implementation from ERC2771ContextUpgradeable
    }

    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData(); // Calls the implementation from ERC2771ContextUpgradeable
    }

    function _contextSuffixLength()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return super._contextSuffixLength(); // Calls the implementation from ERC2771ContextUpgradeable
    }

    function supportsInterface(bytes4 interfaceId) public view override(AccessControlUpgradeable) returns (bool) {
        return interfaceId == type(IATKSystemAccessManager).interfaceId || super.supportsInterface(interfaceId);
    }
}
