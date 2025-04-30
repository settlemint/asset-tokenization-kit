// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
/// @title SMARTStableCoinRegistry - Tracks SMART stablecoins deployed by authorized factories or registered by the
/// owner
/// @notice This contract maintains a registry of SMARTStableCoin tokens. Tokens can be registered by authorized
/// factory contracts or directly by the contract owner.
/// It uses an Ownable pattern to manage factory authorization and owner-specific actions.
/// @dev Inherits from Ownable. Implements ISMARTRStableCoinRegistry.
/// Uses address(1) as a sentinel value in `tokenToFactory` to indicate registration by the owner.
/// @custom:security-contact support@settlemint.com

contract SMARTStableCoinRegistry is ERC2771Context, Ownable {
    /// @notice Custom errors for the registry contract
    error NotAuthorized(); // Generic error for unauthorized access
    error FactoryAlreadyAuthorized();
    error FactoryNotAuthorized(); // Specific error for when trying to unauthorize a non-authorized factory
    error TokenAlreadyRegistered(address token, address registrar);
    error TokenNotRegistered();

    /// @notice Mapping from a token address to the address that registered it.
    /// @dev Can be an authorized factory address or the OWNER_REGISTERED sentinel (address(1)).
    /// address(0) indicates the token is not registered.
    mapping(address => address) public tokenToRegistrar;

    /// @notice Mapping indicating whether a factory address is authorized to register tokens.
    mapping(address => bool) public isFactoryAuthorized;

    /// @notice Emitted when a factory is authorized to register tokens.
    /// @param factory The address of the authorized factory.
    event FactoryAuthorized(address indexed factory);

    /// @notice Emitted when a factory's authorization is revoked.
    /// @param factory The address of the unauthorized factory.
    event FactoryUnauthorized(address indexed factory);

    /// @notice Emitted when a token is registered.
    /// @param token The address of the registered token.
    /// @param registrar The address that registered the token.
    event TokenRegistered(address indexed token, address indexed registrar);

    /// @notice Deploys the registry contract.
    /// @dev Sets the initial owner who can authorize factories and register tokens directly.
    /// @param initialOwner The address of the initial owner.
    constructor(address forwarder, address initialOwner) Ownable(initialOwner) ERC2771Context(forwarder) { }

    /// @notice Authorizes a factory contract to register tokens.
    /// @dev Can only be called by the owner. Reverts if the factory is address(0) or address(1).
    /// @param factory The address of the factory contract to authorize.
    function authorizeFactory(address factory) external onlyOwner {
        require(factory != address(0) && factory != owner(), "Registry: Invalid factory address");
        if (isFactoryAuthorized[factory]) revert FactoryAlreadyAuthorized();
        isFactoryAuthorized[factory] = true;
        emit FactoryAuthorized(factory);
    }

    /// @notice Revokes a factory's authorization to register tokens.
    /// @dev Can only be called by the owner.
    /// @param factory The address of the factory contract to unauthorize.
    function unauthorizeFactory(address factory) external onlyOwner {
        if (!isFactoryAuthorized[factory]) revert FactoryNotAuthorized();
        isFactoryAuthorized[factory] = false;
        emit FactoryUnauthorized(factory);
    }

    /// @notice Registers a SMART stablecoin.
    /// @dev Can be called by an authorized factory contract or the contract owner.
    /// Reverts if the caller is not authorized or if the token is already registered.
    /// Stores the factory address or the OWNER_REGISTERED sentinel (address(1)) if registered by the owner.
    /// @param token The address of the SMART stablecoin contract to register.
    function registerToken(address token) external {
        address registrar = _msgSender();
        address registrarToStore;

        if (registrar == owner()) {
            registrarToStore = owner();
        } else if (isFactoryAuthorized[registrar]) {
            registrarToStore = registrar; // Store the factory address
        } else {
            revert NotAuthorized();
        }

        address existingRegistrar = tokenToRegistrar[token];
        if (existingRegistrar != address(0)) {
            // Provide the actual registrar (owner sentinel or factory address) in the error
            revert TokenAlreadyRegistered(token, existingRegistrar);
        }

        tokenToRegistrar[token] = registrarToStore;
        // Emit the actual caller address (owner or factory) via the inherited event
        emit TokenRegistered(token, registrar);
    }

    /// @notice Checks if a given token address is registered (either by a factory or the owner).
    /// @param token The address of the token to check.
    /// @return True if the token is registered, false otherwise.
    function isTokenRegistered(address token) external view returns (bool) {
        return tokenToRegistrar[token] != address(0);
    }

    /// @notice Retrieves the address that registered a given token.
    /// @param token The address of the token.
    /// @return registrar The address that registered the token. Returns:
    ///   - `address(1)` (OWNER_REGISTERED sentinel) if registered by the owner.
    ///   - The factory address if registered by an authorized factory.
    ///   - `address(0)` if the token is not registered.
    function getFactory(address token) public view returns (address registrar) {
        // Renamed function internally for clarity, but kept external signature for interface compatibility
        // Can also be named getRegistrar externally if interface is updated.
        registrar = tokenToRegistrar[token];
    }

    /// @dev Overrides the default implementation of _msgSender() to return the actual sender
    ///      instead of the forwarder address.
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return super._msgSender();
    }

    /// @dev Overrides the default implementation of _msgData() to return the actual calldata
    ///      instead of the forwarder calldata.
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }

    /// @dev Overrides the default implementation of _contextSuffixLength() to return the actual suffix length
    ///      instead of the forwarder suffix length.
    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return super._contextSuffixLength();
    }
}
