// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { CryptoCurrency } from "./CryptoCurrency.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/// @title CryptoCurrencyFactory - A factory contract for creating CryptoCurrency tokens
/// @notice This contract allows the creation of new CryptoCurrency tokens with deterministic addresses
/// @dev Uses CREATE2 for deterministic deployment addresses and maintains a list of all created tokens
/// @custom:security-contact support@settlemint.com
contract CryptoCurrencyFactory is ReentrancyGuard, ERC2771Context {
    error AddressAlreadyDeployed();

    /// @notice Mapping to track if an address was deployed by this factory
    mapping(address => bool) public isFactoryToken;

    /// @notice Emitted when a new cryptocurrency token is created
    /// @param token The address of the newly created token
    event CryptoCurrencyCreated(address indexed token);

    constructor(address forwarder) ERC2771Context(forwarder) { }

    /// @notice Creates a new cryptocurrency token with the specified parameters
    /// @dev Uses CREATE2 for deterministic addresses and emits a CryptoCurrencyCreated event
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param initialSupply The initial supply of tokens to mint to the owner
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

    /// @notice Calculates the deterministic address for a token with the given parameters
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param initialSupply The initial supply of tokens to mint to the owner
    /// @return predicted The predicted address where the token will be deployed
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
    /// @dev Internal function to generate a deterministic salt based on token parameters
    function _calculateSalt(string memory name, string memory symbol, uint8 decimals) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(name, symbol, decimals));
    }
}
