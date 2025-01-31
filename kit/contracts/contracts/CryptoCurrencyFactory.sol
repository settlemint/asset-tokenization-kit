// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { CryptoCurrency } from "./CryptoCurrency.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title CryptoCurrencyFactory - A factory contract for creating CryptoCurrency tokens
/// @notice This contract allows the creation of new CryptoCurrency tokens with deterministic addresses
/// @dev Uses CREATE2 for deterministic deployment addresses and maintains a list of all created tokens
/// @custom:security-contact support@settlemint.com
contract CryptoCurrencyFactory is ReentrancyGuard {
    error AddressAlreadyDeployed();
    error InvalidDecimals(uint8 decimals);
    error InvalidInitialSupply();

    /// @notice Mapping to track if an address was deployed by this factory
    mapping(address => bool) public isFactoryToken;

    /// @notice Array of all tokens created by this factory
    CryptoCurrency[] public allTokens;

    /// @notice Emitted when a new cryptocurrency token is created
    /// @param token The address of the newly created token
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param owner The owner of the token
    /// @param initialSupply The initial supply of tokens minted to the owner
    /// @param tokenCount The total number of tokens created so far
    event CryptoCurrencyCreated(
        address indexed token,
        string name,
        string symbol,
        uint8 decimals,
        address indexed owner,
        uint256 initialSupply,
        uint256 tokenCount
    );

    /// @notice Returns the number of tokens created by this factory
    /// @return The number of tokens
    function allTokensLength() external view returns (uint256) {
        return allTokens.length;
    }

    /// @notice Returns a batch of tokens from the allTokens array
    /// @param start The start index
    /// @param end The end index (exclusive)
    /// @return A slice of the allTokens array
    function allTokensBatch(uint256 start, uint256 end) external view returns (CryptoCurrency[] memory) {
        if (end > allTokens.length) {
            end = allTokens.length;
        }
        if (start > end) {
            start = end;
        }

        CryptoCurrency[] memory batch = new CryptoCurrency[](end - start);
        for (uint256 i = start; i < end; i++) {
            batch[i - start] = allTokens[i];
        }
        return batch;
    }

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
        if (decimals > 18) revert InvalidDecimals(decimals);

        // Check if address is already deployed
        address predicted = predictAddress(name, symbol, decimals, initialSupply);
        if (isFactoryToken[predicted]) revert AddressAlreadyDeployed();

        bytes32 salt = _calculateSalt(name, symbol, decimals, initialSupply);

        CryptoCurrency newToken = new CryptoCurrency{ salt: salt }(name, symbol, decimals, initialSupply, msg.sender);

        token = address(newToken);
        allTokens.push(newToken);
        isFactoryToken[token] = true;

        emit CryptoCurrencyCreated(token, name, symbol, decimals, msg.sender, initialSupply, allTokens.length);
    }

    /// @notice Calculates the deterministic address for a token with the given parameters
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param initialSupply The initial supply of tokens to mint to the owner
    /// @return predicted The predicted address where the token will be deployed
    function predictAddress(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply
    )
        public
        view
        returns (address predicted)
    {
        bytes32 salt = _calculateSalt(name, symbol, decimals, initialSupply);

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
                                    abi.encode(name, symbol, decimals, initialSupply, msg.sender)
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
    function _calculateSalt(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply
    )
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(name, symbol, decimals, initialSupply));
    }
}
