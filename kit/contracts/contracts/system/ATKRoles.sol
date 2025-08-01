// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title ATKRoles
/// @author SettleMint
/// @notice Main library organizing all ATK protocol roles
/// @dev Provides access to both people and system roles, plus the default admin role
library ATKRoles {
    /// @notice The default admin role that can grant and revoke other roles
    /// @dev This is the role that is needed to set all other roles
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
}
