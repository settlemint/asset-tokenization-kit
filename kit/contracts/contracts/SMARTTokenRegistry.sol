// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { AccessControlEnumerable } from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";

/// @title SMARTTokenRegistry - Contract for managing token registries with role-based access control
/// @notice This contract provides functionality for registering tokens and checking their registration status,
/// managed by roles defined in AccessControl.
/// @dev Inherits from AccessControl and ERC2771Context for role management and meta-transaction support.
/// @custom:security-contact support@settlemint.com

contract SMARTTokenRegistry is ERC2771Context, AccessControlEnumerable {
    /// @notice Role identifier for accounts permitted to register and unregister tokens.
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    /// @notice Custom errors for the registry contract
    error InvalidTokenAddress(); // Error for when the provided token address is the zero address
    error TokenAlreadyRegistered(address token); // Error for attempting to register an already registered token
    error TokenNotRegistered(address token); // Error for attempting to unregister a token that is not registered

    /// @notice Mapping indicating whether a token address is registered.
    mapping(address tokenAddress => bool isRegistered) public isTokenRegistered;

    /// @notice Emitted when a token is registered.
    /// @param sender The address of the sender of the registration.
    /// @param token The address of the registered token.
    event TokenRegistered(address indexed sender, address indexed token);

    /// @notice Emitted when a token is unregistered.
    /// @param sender The address of the sender of the unregistration.
    /// @param token The address of the unregistered token.
    event TokenUnregistered(address indexed sender, address indexed token);

    /// @notice Deploys the registry contract.
    /// @dev Sets up the initial admin and registrar roles using AccessControl's _grantRole.
    /// @param forwarder The address of the trusted forwarder for meta-transactions.
    /// @param initialAdmin The address of the initial admin and registrar.
    constructor(address forwarder, address initialAdmin) ERC2771Context(forwarder) {
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(REGISTRAR_ROLE, initialAdmin);
    }

    /// @notice Registers a token.
    /// @dev Can only be called by an account with REGISTRAR_ROLE, enforced by onlyRole modifier.
    /// Reverts if the token address is invalid or if the token is already registered.
    /// @param token The address of the token to register.
    function registerToken(address token) external onlyRole(REGISTRAR_ROLE) {
        if (token == address(0)) revert InvalidTokenAddress();
        if (isTokenRegistered[token]) revert TokenAlreadyRegistered(token);

        isTokenRegistered[token] = true;
        emit TokenRegistered(_msgSender(), token);
    }

    /// @notice Unregisters a token.
    /// @dev Can only be called by an account with REGISTRAR_ROLE, enforced by onlyRole modifier.
    /// Reverts if the token address is invalid or if the token is not registered.
    /// @param token The address of the token to unregister.
    function unregisterToken(address token) external onlyRole(REGISTRAR_ROLE) {
        if (token == address(0)) revert InvalidTokenAddress();
        if (!isTokenRegistered[token]) revert TokenNotRegistered(token);

        isTokenRegistered[token] = false;
        emit TokenUnregistered(_msgSender(), token);
    }

    /// @notice Grants the REGISTRAR_ROLE to an account.
    /// @dev Can only be called by an account with DEFAULT_ADMIN_ROLE, enforced by onlyRole modifier.
    /// @param account The address to grant the role to.
    function grantRegistrarRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(REGISTRAR_ROLE, account);
    }

    /// @notice Revokes the REGISTRAR_ROLE from an account.
    /// @dev Can only be called by an account with DEFAULT_ADMIN_ROLE, enforced by onlyRole modifier.
    /// @param account The address to revoke the role from.
    function revokeRegistrarRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(REGISTRAR_ROLE, account);
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
