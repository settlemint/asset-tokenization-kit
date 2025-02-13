// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { CryptoCurrency } from "./CryptoCurrency.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/// @title CryptoCurrencyFactory - A factory contract for creating CryptoCurrency tokens
/// @notice This contract allows the creation of new CryptoCurrency tokens with deterministic addresses using CREATE2.
/// It provides functionality to create tokens with specific parameters and predict their deployment addresses.
/// @dev Inherits from ReentrancyGuard for protection against reentrancy attacks and ERC2771Context for
/// meta-transaction support. Uses CREATE2 for deterministic deployment addresses and maintains a registry
/// of deployed tokens.
/// @custom:security-contact support@settlemint.com
contract CryptoCurrencyFactory is ReentrancyGuard, ERC2771Context {
    /// @notice Custom errors for the CryptoCurrencyFactory contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error AddressAlreadyDeployed();

    /// @notice Mapping to track if an address was deployed by this factory
    /// @dev Maps token addresses to a boolean indicating if they were created by this factory
    mapping(address => bool) public isFactoryToken;

    /// @notice Emitted when a new cryptocurrency token is created
    /// @param token The address of the newly created token
    event CryptoCurrencyCreated(address indexed token);

    /// @notice Deploys a new CryptoCurrencyFactory contract
    /// @dev Sets up the factory with meta-transaction support
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    constructor(address forwarder) ERC2771Context(forwarder) { }

    /// @notice Creates a new cryptocurrency token with the specified parameters
    /// @dev Uses CREATE2 for deterministic addresses, includes reentrancy protection,
    /// and validates that the predicted address hasn't been used before.
    /// @param name The name of the token (e.g., "My Token")
    /// @param symbol The symbol of the token (e.g., "MTK")
    /// @param decimals The number of decimals for the token (must be <= 18)
    /// @param initialSupply The initial supply of tokens to mint to the creator
    /// @return token The address of the newly created token
    function create(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply
    )
        external
        nonReentrant
        returns (address token)
    {
        // Check if address is already deployed
        address predicted = predictAddress(_msgSender(), name, symbol, decimals, initialSupply);
        if (isFactoryToken[predicted]) revert AddressAlreadyDeployed();

        bytes32 salt = _calculateSalt(name, symbol, decimals);

        CryptoCurrency newToken =
            new CryptoCurrency{ salt: salt }(name, symbol, decimals, initialSupply, _msgSender(), trustedForwarder());

        token = address(newToken);
        isFactoryToken[token] = true;

        emit CryptoCurrencyCreated(token);
    }

    /// @notice Predicts the address where a token would be deployed
    /// @dev Calculates the deterministic address using CREATE2 with the same parameters and salt
    /// computation as the create function. This allows users to know the token's address before deployment.
    /// @param sender The address that would create the token
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param initialSupply The initial supply of tokens to mint to the creator
    /// @return predicted The address where the token would be deployed
    function predictAddress(
        address sender,
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply
    )
        public
        view
        returns (address predicted)
    {
        bytes32 salt = _calculateSalt(name, symbol, decimals);

        predicted = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            address(this),
                            salt,
                            keccak256(
                                abi.encodePacked(
                                    type(CryptoCurrency).creationCode,
                                    abi.encode(name, symbol, decimals, initialSupply, sender, trustedForwarder())
                                )
                            )
                        )
                    )
                )
            )
        );
    }

    /// @notice Calculates the salt for CREATE2 deployment
    /// @dev Combines the basic token parameters into a unique salt value. Used by both create and
    /// predictAddress functions to ensure consistent address calculation.
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @return The calculated salt for CREATE2 deployment
    function _calculateSalt(string memory name, string memory symbol, uint8 decimals) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(name, symbol, decimals));
    }
}
