// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Custom Errors for the SMART Collateral Extension
/// @notice This file defines custom errors specific to the collateral verification functionality.
///         Using custom errors in Solidity (since v0.8.4) is more gas-efficient and provides clearer
///         error information compared to `require` statements with string messages.

/// @notice Error: Insufficient collateral to cover the proposed total supply after minting.
/// @dev This error is thrown by the `__collateral_beforeMintLogic` function if a valid collateral claim
///      is found on the token contract's identity, but the `amount` specified in that claim is less than
///      what the token's total supply would become *after* the current mint operation.
///      For example, if the collateral claim specifies a collateral amount (effectively a supply cap) of 1,000,000
/// tokens,
///      the current total supply is 900,000, and an attempt is made to mint 200,000 more tokens,
///      the `required` total supply would be 1,100,000. Since 1,100,000 (required) > 1,000,000 (available), this error
/// occurs.
///      It also occurs if no valid collateral claim is found (in which case `available` would be 0), unless the
///      `required` supply is also 0.
/// @param required The total supply that would be reached if the mint operation were to proceed (current supply + mint
/// amount).
/// @param available The collateral amount found in the valid, non-expired claim on the token's identity. This acts as
/// the effective cap.
error InsufficientCollateral(uint256 required, uint256 available);

/// @notice Error: An invalid collateral proof topic ID was provided during initialization.
/// @dev This error is thrown by the initializer or constructor of the collateral extension
///      if the provided `collateralProofTopic_` (the ERC-735 claim topic ID) is invalid.
///      Typically, an invalid topic ID would be `0`, as topic ID 0 is often reserved or considered null.
///      A valid topic ID is crucial for correctly identifying and verifying the specific collateral claims.
/// @param topicId The invalid topic ID (e.g., 0) that was provided during the contract's initialization.
error InvalidCollateralTopic(uint256 topicId);
