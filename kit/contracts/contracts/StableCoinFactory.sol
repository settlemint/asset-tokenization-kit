// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.24;

import { StableCoin } from "./StableCoin.sol";

/// @title StableCoinFactory - A factory contract for creating StableCoin tokens
/// @notice This contract allows the creation of new StableCoin tokens with deterministic addresses
/// @dev Uses CREATE2 for deterministic deployment addresses and maintains a list of all created tokens
/// @custom:security-contact support@settlemint.com
contract StableCoinFactory {
    error ZeroAddress();
    error InvalidLiveness();

    /// @notice Emitted when a new stablecoin token is created
    /// @param token The address of the newly created token
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param owner The owner of the token
    /// @param collateralLivenessSeconds Duration in seconds that collateral proofs remain valid
    /// @param tokenCount The total number of tokens created so far
    event StableCoinCreated(
        address indexed token,
        string name,
        string symbol,
        address indexed owner,
        uint48 collateralLivenessSeconds,
        uint256 tokenCount
    );

    /// @notice Array of all tokens created by this factory
    StableCoin[] public allTokens;

    /// @notice Returns the total number of tokens created by this factory
    /// @return The length of the allTokens array
    function allTokensLength() external view returns (uint256) {
        return allTokens.length;
    }

    /// @notice Creates a new stablecoin token with the specified parameters
    /// @dev Uses CREATE2 for deterministic addresses and emits a StableCoinCreated event
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param owner The address that will own the token
    /// @param collateralLivenessSeconds Duration in seconds that collateral proofs remain valid
    /// @return token The address of the newly created token
    function createToken(
        string memory name,
        string memory symbol,
        address owner,
        uint48 collateralLivenessSeconds
    )
        external
        returns (address token)
    {
        if (owner == address(0)) revert ZeroAddress();
        if (collateralLivenessSeconds == 0) revert InvalidLiveness();

        bytes32 salt = keccak256(abi.encodePacked(name, symbol, owner, collateralLivenessSeconds));

        StableCoin newToken = new StableCoin{ salt: salt }(name, symbol, owner, collateralLivenessSeconds);

        token = address(newToken);
        allTokens.push(newToken);

        emit StableCoinCreated(token, name, symbol, owner, collateralLivenessSeconds, allTokens.length);
    }
}
