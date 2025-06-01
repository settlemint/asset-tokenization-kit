// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Interface for SMART Token Collateral Verification
/// @notice This interface defines the external functions for a SMART token extension that verifies
///         collateral claims before allowing certain operations (typically minting).
///         The collateral is represented by a specific ERC-735 claim on an OnchainID identity contract.
///         In Solidity, an interface outlines *what* functions a contract offers publicly but not *how* they work.
///         This allows for standardized interactions with any contract implementing this collateral logic.
interface ISMARTCollateral {
    /// @notice Attempts to find the first valid collateral claim associated with the token contract's
    ///         own OnchainID identity, based on a pre-configured claim topic.
    /// @dev This function is expected to perform several checks:
    ///      1. Retrieve claim IDs from the token's identity contract (`this.onchainID()`) for the configured
    /// `collateralProofTopic`.
    ///      2. For each claim, verify its issuer is trusted for that topic via the `identityRegistry`'s
    /// `issuersRegistry`.
    ///      3. Confirm the trusted issuer contract itself deems the claim valid (e.g., via
    /// `IClaimIssuer.isClaimValid`).
    ///      4. Decode the claim data, which is expected to contain a collateral `amount` and an `expiryTimestamp`.
    ///      5. Ensure the claim has not expired (i.e., `decodedExpiry > block.timestamp`).
    ///      The function should return the details of the *first* claim that successfully passes all these validations.
    ///      If no such claim is found, it should return zero values.
    ///      This is a `view` function, meaning it reads blockchain state but does not modify it, and thus
    ///      does not consume gas when called as a read-only operation from off-chain.
    /// @return amount The collateral amount (e.g., maximum permissible total supply) decoded from the valid claim data.
    ///                Returns 0 if no valid collateral claim is found.
    /// @return issuer The address of the trusted `IClaimIssuer` contract that issued the valid collateral claim.
    ///                Returns `address(0)` if no valid claim is found.
    /// @return expiryTimestamp The expiry timestamp (Unix time) decoded from the valid claim data.
    ///                         Returns 0 if no valid claim is found or if the found claim has already expired.
    function findValidCollateralClaim()
        external
        view
        returns (uint256 amount, address issuer, uint256 expiryTimestamp);
}
