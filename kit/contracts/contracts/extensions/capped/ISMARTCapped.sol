// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Interface for the SMART Capped Token Extension
/// @notice This interface defines the external functions that a SMART token contract with a capped
///         total supply must implement. A "capped" token has a maximum limit on the total number
///         of tokens that can ever exist (be minted).
///         In Solidity, an interface specifies *what* functions a contract has (their names, parameters,
///         and return types) but not *how* they are implemented. This allows other contracts or
///         off-chain applications to interact with any capped token in a standard way.
interface ISMARTCapped {
    /// @notice Returns the maximum allowed total supply for this token (the "cap").
    /// @dev This function provides a way to query the hard limit on the token's supply.
    ///      It is a `view` function, meaning it does not modify the contract's state and does not
    ///      cost gas when called externally as a read-only operation (e.g., from a user interface).
    /// @return uint256 The maximum number of tokens that can be in circulation.
    function cap() external view returns (uint256);
}
