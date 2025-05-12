// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

/// @title Interface for the SMART Token Access Control Manager
/// @notice Defines the public authorization functions that a token contract can call
///         to delegate access control checks.
interface ISMARTTokenAccessControlManager is IAccessControl {
    /// @notice Checks if the caller is authorized to update token settings.
    /// @param caller The address attempting the action.
    function authorizeUpdateTokenSettings(address caller) external view;

    /// @notice Checks if the caller is authorized to update compliance settings.
    /// @param caller The address attempting the action.
    function authorizeUpdateComplianceSettings(address caller) external view;

    /// @notice Checks if the caller is authorized to update verification settings.
    /// @param caller The address attempting the action.
    function authorizeUpdateVerificationSettings(address caller) external view;

    /// @notice Checks if the caller is authorized to mint tokens.
    /// @param caller The address attempting the action.
    function authorizeMintToken(address caller) external view;

    /// @notice Checks if the caller is authorized to recover ERC20 tokens.
    /// @param caller The address attempting the action.
    function authorizeRecoverERC20(address caller) external view;

    /// @notice Checks if the caller is authorized to burn tokens.
    /// @param caller The address attempting the action.
    function authorizeBurn(address caller) external view;

    /// @notice Checks if the caller is authorized to freeze/unfreeze an address.
    /// @param caller The address attempting the action.
    function authorizeFreezeAddress(address caller) external view;

    /// @notice Checks if the caller is authorized to freeze/unfreeze partial token amounts.
    /// @param caller The address attempting the action.
    function authorizeFreezePartialTokens(address caller) external view;

    /// @notice Checks if the caller is authorized to perform a forced transfer.
    /// @param caller The address attempting the action.
    function authorizeForcedTransfer(address caller) external view;

    /// @notice Checks if the caller is authorized to perform address recovery.
    /// @param caller The address attempting the action.
    function authorizeRecoveryAddress(address caller) external view;

    /// @notice Checks if the caller is authorized to pause/unpause the contract.
    /// @param caller The address attempting the action.
    function authorizePause(address caller) external view;
}
