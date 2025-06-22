// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title IWithTypeIdentifier
/// @notice Interface for contracts that have a unique type identifier.
/// @dev This interface is used to identify the type of a contract.
///      It is used to identify the type of a contract.
///      It is used to identify the type of a contract.
interface IWithTypeIdentifier {
    /// @notice Returns a unique identifier for the type of this contract.
    function typeId() external pure returns (bytes32);
}
