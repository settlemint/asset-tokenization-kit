// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title ERC734KeyPurposes
/// @author SettleMint
/// @notice Library defining key purposes used in ERC-734 identity contracts
/// @dev Constants representing the intended use cases for cryptographic keys in identity management
library ERC734KeyPurposes {
    /// @notice Management key purpose - allows managing the identity, including adding/removing other keys
    uint256 public constant MANAGEMENT_KEY = 1;

    /// @notice Action key purpose - allows performing actions on behalf of the identity
    uint256 public constant ACTION_KEY = 2;

    /// @notice Claim signer key purpose - allows signing claims about the identity or other identities
    uint256 public constant CLAIM_SIGNER_KEY = 3;

    /// @notice Encryption key purpose - allows encrypting data for the identity
    uint256 public constant ENCRYPTION_KEY = 4;
}
