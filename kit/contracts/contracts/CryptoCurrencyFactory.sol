// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.24;

import { CryptoCurrency } from "./CryptoCurrency.sol";

/// @title CryptoCurrencyFactory - A factory contract for creating CryptoCurrency tokens
/// @notice This contract allows the creation of new CryptoCurrency tokens with deterministic addresses
/// @dev Uses CREATE2 for deterministic deployment addresses and maintains a list of all created tokens
/// @custom:security-contact support@settlemint.com
contract CryptoCurrencyFactory {
    error ZeroAddress();

    /// @notice Emitted when a new cryptocurrency token is created
    /// @param token The address of the newly created token
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param initialSupply The initial supply of tokens minted to the owner
    /// @param owner The owner of the token
    /// @param tokenCount The total number of tokens created so far
    event CryptoCurrencyCreated(
        address indexed token,
        string name,
        string symbol,
        uint256 initialSupply,
        address indexed owner,
        uint256 tokenCount
    );

    /// @notice Array of all tokens created by this factory
    CryptoCurrency[] public allTokens;

    /// @notice Returns the total number of tokens created by this factory
    /// @return The length of the allTokens array
    function allTokensLength() external view returns (uint256) {
        return allTokens.length;
    }

    /// @notice Creates a new cryptocurrency token with the specified parameters
    /// @dev Uses CREATE2 for deterministic addresses and emits a CryptoCurrencyCreated event
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param initialSupply The initial supply of tokens to mint to the owner
    /// @param owner The address that will own the token
    /// @return token The address of the newly created token
    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner
    )
        external
        returns (address token)
    {
        if (owner == address(0)) revert ZeroAddress();

        bytes32 salt = keccak256(abi.encodePacked(name, symbol, initialSupply, owner));

        CryptoCurrency newToken = new CryptoCurrency{ salt: salt }(name, symbol, initialSupply, owner);

        token = address(newToken);
        allTokens.push(newToken);

        emit CryptoCurrencyCreated(token, name, symbol, initialSupply, owner, allTokens.length);
    }
}
