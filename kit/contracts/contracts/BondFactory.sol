// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.24;

import { Bond } from "./Bond.sol";

/// @title BondFactory - A factory contract for creating Bond tokens
/// @notice This contract allows the creation of new Bond tokens with deterministic addresses
/// @dev Uses CREATE2 for deterministic deployment addresses and maintains a list of all created bonds
/// @custom:security-contact support@settlemint.com
contract BondFactory {
    error InvalidMaturityDate();
    error ZeroAddress();

    /// @notice Emitted when a new bond token is created
    /// @param bond The address of the newly created bond token
    /// @param name The name of the bond token
    /// @param symbol The symbol of the bond token
    /// @param owner The owner of the bond token
    /// @param maturityDate The timestamp when the bond matures
    /// @param bondCount The total number of bonds created so far
    event BondCreated(
        address indexed bond, string name, string symbol, address indexed owner, uint256 maturityDate, uint256 bondCount
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
    /// @param symbol The symbol of the bond token
    /// @param owner The address that will own the bond token
    /// @param maturityDate The timestamp when the bond matures
    /// @return bond The address of the newly created bond token
    function createBond(
        string memory name,
        string memory symbol,
        address owner,
        uint256 maturityDate
    )
        external
        returns (address bond)
    {
        if (owner == address(0)) revert ZeroAddress();
        if (maturityDate <= block.timestamp) revert InvalidMaturityDate();

        bytes32 salt = keccak256(abi.encodePacked(name, symbol, owner, maturityDate));

        Bond newBond = new Bond{ salt: salt }(name, symbol, owner, maturityDate);

        bond = address(newBond);
        allBonds.push(newBond);

        emit BondCreated(bond, name, symbol, owner, maturityDate, allBonds.length);
    }
}
