// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Bond } from "./Bond.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title BondFactory - A factory contract for creating Bond tokens
/// @notice This contract allows the creation of new Bond tokens with deterministic addresses
/// @dev Uses CREATE2 for deterministic deployment addresses and maintains a list of all created bonds
/// @custom:security-contact support@settlemint.com
contract BondFactory is ReentrancyGuard {
    error AddressAlreadyDeployed();

    /// @notice Mapping to track if an address was deployed by this factory
    mapping(address => bool) public isFactoryToken;

    /// @notice Emitted when a new bond token is created
    /// @param token The address of the newly created bond token
    /// @param name The name of the bond token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the bond
    /// @param owner The owner of the bond token
    /// @param isin The ISIN (International Securities Identification Number) of the bond
    /// @param cap The cap for the token
    /// @param maturityDate The timestamp when the bond matures
    /// @param faceValue The face value of the bond in underlying asset base units
    /// @param underlyingAsset The address of the underlying asset contract used for face value denomination
    event BondCreated(
        address indexed token,
        string name,
        string symbol,
        uint8 decimals,
        address indexed owner,
        string isin,
        uint256 cap,
        uint256 maturityDate,
        uint256 faceValue,
        address indexed underlyingAsset
    );

    /// @notice Creates a new bond token with the specified parameters
    /// @dev Uses CREATE2 for deterministic addresses and emits a BondCreated event
    /// @param name The name of the bond token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param isin The ISIN (International Securities Identification Number) of the bond
    /// @param cap The cap for the token
    /// @param maturityDate The timestamp when the bond matures
    /// @param faceValue The face value of the bond in underlying asset base units
    /// @param underlyingAsset The address of the underlying asset contract used for face value denomination
    /// @return bond The address of the newly created bond token
    function create(
        string memory name,
        string memory symbol,
        uint8 decimals,
        string memory isin,
        uint256 cap,
        uint256 maturityDate,
        uint256 faceValue,
        address underlyingAsset
    )
        external
        nonReentrant
        returns (address bond)
    {
        bytes32 salt = _calculateSalt(name, symbol, decimals, isin);
        address predicted =
            predictAddress(msg.sender, name, symbol, decimals, isin, cap, maturityDate, faceValue, underlyingAsset);
        if (isFactoryToken[predicted]) revert AddressAlreadyDeployed();

        Bond newBond = new Bond{ salt: salt }(
            name, symbol, decimals, msg.sender, isin, cap, maturityDate, faceValue, underlyingAsset
        );

        bond = address(newBond);
        isFactoryToken[bond] = true;

        emit BondCreated(bond, name, symbol, decimals, msg.sender, isin, cap, maturityDate, faceValue, underlyingAsset);
    }

    /// @notice Predicts the address where a bond would be deployed
    /// @dev Uses the same CREATE2 salt computation as the create function
    /// @param name The name of the bond token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param isin The ISIN (International Securities Identification Number) of the bond
    /// @param cap The cap for the token
    /// @param maturityDate The timestamp when the bond matures
    /// @param faceValue The face value of the bond in underlying asset base units
    /// @param underlyingAsset The address of the underlying asset contract used for face value denomination
    /// @return predicted The predicted address where the bond would be deployed
    function predictAddress(
        address sender,
        string memory name,
        string memory symbol,
        uint8 decimals,
        string memory isin,
        uint256 cap,
        uint256 maturityDate,
        uint256 faceValue,
        address underlyingAsset
    )
        public
        view
        returns (address predicted)
    {
        bytes32 salt = _calculateSalt(name, symbol, decimals, isin);
        bytes32 bytecodeHash = keccak256(
            abi.encodePacked(
                type(Bond).creationCode,
                abi.encode(name, symbol, decimals, sender, isin, cap, maturityDate, faceValue, underlyingAsset)
            )
        );

        return address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, bytecodeHash)))));
    }

    /// @notice Calculates the salt for CREATE2 deployment
    /// @dev Used by both create and predictAddress to ensure consistent address calculation
    /// @param name The name of the bond token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param isin The ISIN (International Securities Identification Number) of the bond
    /// @return The calculated salt for CREATE2 deployment
    function _calculateSalt(
        string memory name,
        string memory symbol,
        uint8 decimals,
        string memory isin
    )
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(name, symbol, decimals, isin));
    }
}
