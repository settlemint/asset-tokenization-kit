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
    /// @notice Error: Minting would exceed the maximum token supply cap.
    /// @dev This error is thrown when a mint operation (creating new tokens) is attempted, but the
    ///      resulting total supply would be greater than the pre-defined `cap`.
    ///      For example, if the cap is 1,000,000 tokens and current supply is 990,000, attempting to mint
    ///      20,000 more tokens would trigger this error because 990,000 + 20,000 = 1,010,000, which is > 1,000,000.
    /// @param newSupply The total supply that *would have resulted* if the mint operation had proceeded.
    /// @param cap The hard-coded maximum allowed total supply for the token.
    error ExceededCap(uint256 newSupply, uint256 cap);

    /// @notice Error: An invalid cap value was provided during initialization.
    /// @dev This error is typically thrown by the constructor or initializer of a capped token extension
    ///      if the provided `cap` value is not valid. The most common invalid value is zero, as a cap of zero
    ///      would mean no tokens could ever be minted.
    /// @param cap The invalid cap value that was attempted to be set during initialization (e.g., 0).
    error InvalidCap(uint256 cap);

    /// @notice Emitted when the cap is set.
    /// @param sender The address that set the cap.
    /// @param cap The new cap.
    event CapSet(address indexed sender, uint256 cap);

    /// @notice Returns the maximum allowed total supply for this token (the "cap").
    /// @dev This function provides a way to query the hard limit on the token's supply.
    ///      It is a `view` function, meaning it does not modify the contract's state and does not
    ///      cost gas when called externally as a read-only operation (e.g., from a user interface).
    /// @return uint256 The maximum number of tokens that can be in circulation.
    function cap() external view returns (uint256);
}
