// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

library SMARTConstants {
    /// @notice Claim topic for collateral
    uint256 public constant CLAIM_TOPIC_KYC = 1;

    /// @notice Claim topic for collateral
    uint256 public constant CLAIM_TOPIC_AML = 2;

    /// @notice Claim topic for collateral
    uint256 public constant CLAIM_TOPIC_COLLATERAL = 3;

    /// @notice Role identifier for addresses that can manage token supply (mint, burn, forced transfer)
    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");

    /// @notice Role identifier for addresses that can manage users (freezing, recovery)
    bytes32 public constant USER_MANAGEMENT_ROLE = keccak256("USER_MANAGEMENT_ROLE");
}
