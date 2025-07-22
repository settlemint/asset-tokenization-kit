// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title ATKRoles
/// @notice Library defining role constants for the ATK protocol's access control system
/// @dev These roles are used with OpenZeppelin's AccessControl contract
library ATKRoles {
    /// @notice The default admin role that can grant and revoke other roles
    /// @dev Matches the default admin role in OpenZeppelin's AccessControl
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    /// @notice Role for managing token governance, verification, and compliance
    /// @dev Assigned to entities responsible for token policy and regulatory compliance
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    /// @notice Role for managing token supply operations
    /// @dev Assigned to entities that can mint and burn tokens
    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");

    /// @notice Role for custodial operations including freezing accounts, forced transfers, and recovery
    /// @dev Assigned to custodians responsible for asset protection and recovery
    bytes32 public constant CUSTODIAN_ROLE = keccak256("CUSTODIAN_ROLE");

    /// @notice Role for emergency operations including pausing the contract and ERC20 recovery
    /// @dev Assigned to emergency responders for critical system interventions
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
}
