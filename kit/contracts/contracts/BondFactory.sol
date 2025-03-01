// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Bond } from "./Bond.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/// @title BondFactory - A factory contract for creating Bond tokens
/// @notice This contract allows the creation of new Bond tokens with deterministic addresses using CREATE2.
/// It provides functionality to create bonds with specific parameters and predict their deployment addresses.
/// @dev Inherits from ReentrancyGuard for protection against reentrancy attacks and ERC2771Context for
/// meta-transaction support. Uses CREATE2 for deterministic deployment addresses and maintains a registry
/// of deployed tokens.
/// @custom:security-contact support@settlemint.com
contract BondFactory is ReentrancyGuard, ERC2771Context {
    /// @notice Custom errors for the BondFactory contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error AddressAlreadyDeployed();

    /// @notice Mapping to track if an address was deployed by this factory
    /// @dev Maps token addresses to a boolean indicating if they were created by this factory
    mapping(address => bool) public isFactoryToken;

    /// @notice Emitted when a new bond token is created
    /// @param token The address of the newly created bond token
    event BondCreated(address indexed token, address indexed creator);

    /// @notice Deploys a new BondFactory contract
    /// @dev Sets up the factory with meta-transaction support
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    constructor(address forwarder) ERC2771Context(forwarder) { }

    /// @notice Creates a new bond token with the specified parameters
    /// @dev Uses CREATE2 for deterministic addresses, includes reentrancy protection,
    /// and validates that the predicted address hasn't been used before.
    /// @param name The name of the bond token (e.g., "Company A 5% Bond 2025")
    /// @param symbol The symbol of the token (e.g., "BOND-A-25")
    /// @param decimals The number of decimals for the token (must be <= 18)
    /// @param cap The maximum total supply of the token
    /// @param maturityDate The timestamp when the bond matures (must be in the future)
    /// @param faceValue The face value of the bond in underlying asset base units
    /// @param underlyingAsset The address of the underlying asset contract used for face value denomination
    /// @return bond The address of the newly created bond token
    function create(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 cap,
        uint256 maturityDate,
        uint256 faceValue,
        address underlyingAsset
    )
        external
        nonReentrant
        returns (address bond)
    {
        bytes32 salt = _calculateSalt(name, symbol, decimals);
        address predicted =
            predictAddress(_msgSender(), name, symbol, decimals, cap, maturityDate, faceValue, underlyingAsset);
        if (isFactoryToken[predicted]) revert AddressAlreadyDeployed();

        Bond newBond = new Bond{ salt: salt }(
            name, symbol, decimals, _msgSender(), cap, maturityDate, faceValue, underlyingAsset, trustedForwarder()
        );

        bond = address(newBond);
        isFactoryToken[bond] = true;

        emit BondCreated(bond, _msgSender());
    }

    /// @notice Predicts the address where a bond would be deployed
    /// @dev Calculates the deterministic address using CREATE2 with the same parameters and salt
    /// computation as the create function. This allows users to know the bond's address before deployment.
    /// @param sender The address that would create the bond
    /// @param name The name of the bond token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param cap The maximum total supply of the token
    /// @param maturityDate The timestamp when the bond matures
    /// @param faceValue The face value of the bond in underlying asset base units
    /// @param underlyingAsset The address of the underlying asset contract
    /// @return predicted The address where the bond would be deployed
    function predictAddress(
        address sender,
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 cap,
        uint256 maturityDate,
        uint256 faceValue,
        address underlyingAsset
    )
        public
        view
        returns (address predicted)
    {
        bytes32 salt = _calculateSalt(name, symbol, decimals);
        bytes32 bytecodeHash = keccak256(
            abi.encodePacked(
                type(Bond).creationCode,
                abi.encode(
                    name, symbol, decimals, sender, cap, maturityDate, faceValue, underlyingAsset, trustedForwarder()
                )
            )
        );

        predicted =
            address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, bytecodeHash)))));
        if (isFactoryToken[predicted]) revert AddressAlreadyDeployed();
    }

    /// @notice Calculates the salt for CREATE2 deployment
    /// @dev Combines the basic token parameters into a unique salt value. Used by both create and
    /// predictAddress functions to ensure consistent address calculation.
    /// @param name The name of the bond token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @return The calculated salt for CREATE2 deployment
    function _calculateSalt(string memory name, string memory symbol, uint8 decimals) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(name, symbol, decimals));
    }
}
