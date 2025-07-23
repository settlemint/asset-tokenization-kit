// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

/**
 * @title ClaimSchemes
 * @author SettleMint
 * @notice Library defining claim schemes used in ERC-735 claim validation
 * @dev Constants representing different cryptographic schemes for claim verification
 */
library ClaimSchemes {
    /// @notice ECDSA scheme identifier for claims validated via ECDSA signatures
    uint256 internal constant SCHEME_ECDSA = 1;

    /// @notice Contract scheme identifier for claims issued directly by contracts
    /// @dev Used when the issuer is a contract identity that validates claims by existence
    uint256 internal constant SCHEME_CONTRACT = 3;
}
