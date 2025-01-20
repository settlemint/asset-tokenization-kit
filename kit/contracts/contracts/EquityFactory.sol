// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.24;

import { Equity } from "./Equity.sol";

/// @title EquityFactory - A factory contract for creating Equity tokens
/// @notice This contract allows the creation of new Equity tokens with deterministic addresses
/// @dev Uses CREATE2 for deterministic deployment addresses and maintains a list of all created tokens
/// @custom:security-contact support@settlemint.com
contract EquityFactory {
    /// @notice Emitted when a new equity token is created
    /// @param token The address of the newly created token
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param owner The owner of the token
    /// @param tokenCount The total number of tokens created so far
    event EquityCreated(address indexed token, string name, string symbol, address indexed owner, uint256 tokenCount);

    /// @notice Array of all tokens created by this factory
    Equity[] public allTokens;

    /// @notice Returns the total number of tokens created by this factory
    /// @return The length of the allTokens array
    function allTokensLength() external view returns (uint256) {
        return allTokens.length;
    }

    /// @notice Creates a new equity token with the specified parameters
    /// @dev Uses CREATE2 for deterministic addresses and emits an EquityCreated event
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param equityClass The equity class (e.g., "Common", "Preferred")
    /// @param equityCategory The equity category (e.g., "Series A", "Seed")
    /// @return token The address of the newly created token
    function create(
        string memory name,
        string memory symbol,
        uint8 decimals,
        string memory equityClass,
        string memory equityCategory
    )
        external
        returns (address token)
    {
        bytes32 salt = keccak256(abi.encodePacked(name, symbol, decimals, equityClass, equityCategory, msg.sender));

        Equity newToken = new Equity{ salt: salt }(name, symbol, decimals, equityClass, equityCategory, msg.sender);

        token = address(newToken);
        allTokens.push(newToken);

        emit EquityCreated(token, name, symbol, msg.sender, allTokens.length);
    }
}
