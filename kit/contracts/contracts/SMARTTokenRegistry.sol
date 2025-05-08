// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";

/// @title SMARTRegistry - Base contract for managing token registries
/// @notice This contract provides a base implementation for managing token registries.
/// It includes functionality for registering tokens and checking their registration status.
/// @dev Inherits from Ownable and ERC2771Context for ownership management and meta-transaction support.
/// @custom:security-contact support@settlemint.com

contract SMARTTokenRegistry is ERC2771Context, Ownable {
    /// @notice Custom errors for the registry contract
    error InvalidTokenAddress(); // Error for when the provided token address is the zero address
    error TokenAlreadyRegistered(address token); // Error for attempting to register an already registered token
    error TokenNotRegistered(address token); // Error for attempting to unregister a token that is not registered

    /// @notice Mapping indicating whether a token address is registered.
    mapping(address => bool) public isTokenRegistered;

    /// @notice Emitted when a token is registered.
    /// @param token The address of the registered token.
    event TokenRegistered(address indexed token);

    /// @notice Emitted when a token is unregistered.
    /// @param token The address of the unregistered token.
    event TokenUnregistered(address indexed token);

    /// @notice Deploys the registry contract.
    /// @dev Sets the initial owner who can register and unregister tokens.
    /// @param forwarder The address of the trusted forwarder for meta-transactions.
    /// @param initialOwner The address of the initial owner.
    constructor(address forwarder, address initialOwner) Ownable(initialOwner) ERC2771Context(forwarder) { }

    /// @notice Registers a token.
    /// @dev Can only be called by the owner.
    /// Reverts if the token address is invalid or if the token is already registered.
    /// @param token The address of the token to register.
    function registerToken(address token) external onlyOwner {
        if (token == address(0)) revert InvalidTokenAddress();
        if (isTokenRegistered[token]) revert TokenAlreadyRegistered(token);

        isTokenRegistered[token] = true;
        emit TokenRegistered(token);
    }

    /// @notice Unregisters a token.
    /// @dev Can only be called by the owner.
    /// Reverts if the token address is invalid or if the token is not registered.
    /// @param token The address of the token to unregister.
    function unregisterToken(address token) external onlyOwner {
        if (token == address(0)) revert InvalidTokenAddress();
        if (!isTokenRegistered[token]) revert TokenNotRegistered(token);

        isTokenRegistered[token] = false;
        emit TokenUnregistered(token);
    }

    // --- ERC2771Context Overrides ---

    /// @dev Overrides the default implementation of _msgSender() to return the actual sender
    ///      instead of the forwarder address when using ERC2771 context.
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return super._msgSender();
    }

    /// @dev Overrides the default implementation of _msgData() to return the actual calldata
    ///      instead of the forwarder calldata when using ERC2771 context.
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }

    /// @dev Overrides the default implementation of _contextSuffixLength() to return the actual suffix length
    ///      instead of the forwarder suffix length when using ERC2771 context.
    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return super._contextSuffixLength();
    }
}
