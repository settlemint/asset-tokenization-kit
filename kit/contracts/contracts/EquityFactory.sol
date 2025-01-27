// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

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
    /// @param decimals The number of decimals for the token
    /// @param owner The owner of the token
    /// @param isin The ISIN (International Securities Identification Number) of the equity
    /// @param equityClass The equity class (e.g., "Common", "Preferred")
    /// @param equityCategory The equity category (e.g., "Series A", "Seed")
    /// @param tokenCount The total number of tokens created so far
    event EquityCreated(
        address indexed token,
        string name,
        string symbol,
        uint8 decimals,
        address indexed owner,
        string isin,
        string equityClass,
        string equityCategory,
        uint256 tokenCount
    );

    error InvalidISIN();

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
    /// @param isin The ISIN (International Securities Identification Number) of the equity
    /// @param equityClass The equity class (e.g., "Common", "Preferred")
    /// @param equityCategory The equity category (e.g., "Series A", "Seed")
    /// @return token The address of the newly created token
    function create(
        string memory name,
        string memory symbol,
        uint8 decimals,
        string memory isin,
        string memory equityClass,
        string memory equityCategory
    )
        external
        returns (address token)
    {
        if (bytes(isin).length != 12) revert InvalidISIN();

        bytes32 salt = keccak256(abi.encode(name, symbol, decimals, equityClass, equityCategory, msg.sender, isin));

        Equity newToken =
            new Equity{ salt: salt }(name, symbol, decimals, msg.sender, isin, equityClass, equityCategory);

        token = address(newToken);
        allTokens.push(newToken);

        emit EquityCreated(
            token, name, symbol, decimals, msg.sender, isin, equityClass, equityCategory, allTokens.length
        );
    }
}
