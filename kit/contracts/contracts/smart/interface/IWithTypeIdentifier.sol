// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title IWithTypeIdentifier
/// @author SettleMint
/// @notice Interface for contracts that have a unique type identifier.
/// @dev This interface is used to identify the type of a contract using a unique bytes32 identifier.
///      Implementing contracts can use this to distinguish between different contract types or versions
///      within a system, enabling dynamic type checking and factory pattern implementations.
interface IWithTypeIdentifier {
    /// @notice Returns a unique identifier for the type of this contract.
    /// @return The unique type identifier as a bytes32 hash
    function typeId() external pure returns (bytes32);
}
