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
