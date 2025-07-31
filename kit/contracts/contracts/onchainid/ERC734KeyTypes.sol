// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title ERC734KeyTypes
/// @author SettleMint
/// @notice Library defining key types used in ERC-734 identity contracts
/// @dev Constants representing cryptographic key types for identity management
library ERC734KeyTypes {
    /// @notice ECDSA key type identifier for elliptic curve digital signature algorithm keys
    uint256 public constant ECDSA = 1;

    /// @notice RSA key type identifier for RSA cryptographic keys
    uint256 public constant RSA = 2;
}
