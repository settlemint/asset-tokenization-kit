// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Bond } from "./Bond.sol";

/// @title BondFactory - A factory contract for creating Bond tokens
/// @notice This contract allows the creation of new Bond tokens with deterministic addresses
/// @dev Uses CREATE2 for deterministic deployment addresses and maintains a list of all created bonds
/// @custom:security-contact support@settlemint.com
contract BondFactory {
    error InvalidMaturityDate();
    error InvalidFaceValue();
    error InvalidUnderlyingAsset();
    error InvalidISIN();

    /// @notice Emitted when a new bond token is created
    /// @param token The address of the newly created bond token
    /// @param name The name of the bond token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the bond
    /// @param owner The owner of the bond token
    /// @param isin The ISIN (International Securities Identification Number) of the bond
    /// @param faceValue The face value of the bond in underlying asset base units
    /// @param underlyingAsset The address of the underlying asset contract used for face value denomination
    /// @param tokenCount The total number of bonds created so far
    event BondCreated(
        address indexed token,
        string name,
        string symbol,
        uint8 decimals,
        address indexed owner,
        string isin,
        uint256 faceValue,
        address indexed underlyingAsset,
        uint256 tokenCount
    );

    /// @notice Array of all bonds created by this factory
    Bond[] public allBonds;

    /// @notice Returns the total number of bonds created by this factory
    /// @return The length of the allBonds array
    function allBondsLength() external view returns (uint256) {
        return allBonds.length;
    }

    /// @notice Creates a new bond token with the specified parameters
    /// @dev Uses CREATE2 for deterministic addresses and emits a BondCreated event
    /// @param name The name of the bond token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param isin The ISIN (International Securities Identification Number) of the bond
    /// @param maturityDate The timestamp when the bond matures
    /// @param faceValue The face value of the bond in underlying asset base units
    /// @param underlyingAsset The address of the underlying asset contract used for face value denomination
    /// @return bond The address of the newly created bond token
    function create(
        string memory name,
        string memory symbol,
        uint8 decimals,
        string memory isin,
        uint256 maturityDate,
        uint256 faceValue,
        address underlyingAsset
    )
        external
        returns (address bond)
    {
        if (maturityDate <= block.timestamp) revert InvalidMaturityDate();
        if (faceValue == 0) revert InvalidFaceValue();
        if (underlyingAsset == address(0)) revert InvalidUnderlyingAsset();
        if (bytes(isin).length != 12) revert InvalidISIN();

        bytes32 salt = keccak256(
            abi.encodePacked(name, symbol, decimals, msg.sender, isin, maturityDate, faceValue, underlyingAsset)
        );

        Bond newBond =
            new Bond{ salt: salt }(name, symbol, decimals, msg.sender, isin, maturityDate, faceValue, underlyingAsset);

        bond = address(newBond);
        allBonds.push(newBond);

        emit BondCreated(bond, name, symbol, decimals, msg.sender, isin, faceValue, underlyingAsset, allBonds.length);
    }
}
