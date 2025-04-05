// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { ZeroAddress } from "../errors/InvalidArgumentErrors.sol";
import { AccountAlreadyHasRole, AccountDoesNotHaveRole } from "../errors/RoleErrors.sol";

/**
 * @title Roles
 * @dev Library for managing addresses assigned to a Role.
 */
library Roles {
    struct Role {
        mapping(address => bool) bearer;
    }

    /**
     * @dev Give an account access to this role.
     */
    function add(Role storage role, address account) internal {
        require(!has(role, account), AccountAlreadyHasRole());
        role.bearer[account] = true;
    }

    /**
     * @dev Remove an account's access to this role.
     */
    function remove(Role storage role, address account) internal {
        require(has(role, account), AccountDoesNotHaveRole());
        role.bearer[account] = false;
    }

    /**
     * @dev Check if an account has this role.
     * @return bool
     */
    function has(Role storage role, address account) internal view returns (bool) {
        require(account != address(0), ZeroAddress());
        return role.bearer[account];
    }
}
