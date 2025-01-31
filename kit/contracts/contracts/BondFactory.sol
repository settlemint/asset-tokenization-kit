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
    error InvalidDecimals(uint8 decimals);
    error InvalidISIN();
    error InvalidUnderlyingAsset();
    error InvalidFaceValue();
    error InvalidMaturityDate();

    /// @notice Mapping to track if an address was deployed by this factory
    mapping(address => bool) public isFactoryToken;

    /// @notice Array of all bonds created by this factory
    Bond[] public allBonds;

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
    /// @param tokenCount The total number of bonds created so far
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
        address indexed underlyingAsset,
        uint256 tokenCount
    );

    /// @notice Returns the total number of bonds created by this factory
    /// @return The length of the allBonds array
    function allBondsLength() external view returns (uint256) {
        return allBonds.length;
    }

    /// @notice Returns a batch of bonds from the allBonds array
    /// @param start The start index
    /// @param end The end index (exclusive)
    /// @return A slice of the allBonds array
    function allBondsBatch(uint256 start, uint256 end) external view returns (Bond[] memory) {
        if (end > allBonds.length) {
            end = allBonds.length;
        }
        if (start > end) {
            start = end;
        }

        Bond[] memory batch = new Bond[](end - start);
        for (uint256 i = start; i < end; i++) {
            batch[i - start] = allBonds[i];
        }
        return batch;
    }

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
        // Input validation
        if (decimals > 18) revert InvalidDecimals(decimals);
        if (bytes(isin).length != 12) revert InvalidISIN();
        if (maturityDate <= block.timestamp) revert InvalidMaturityDate();
        if (faceValue == 0) revert InvalidFaceValue();
        if (underlyingAsset == address(0)) revert InvalidUnderlyingAsset();

        bytes32 salt = _calculateSalt(name, symbol, isin, cap, maturityDate, faceValue, underlyingAsset);

        // Check for existing deployment first
        bytes32 bytecodeHash = keccak256(
            abi.encodePacked(
                type(Bond).creationCode,
                abi.encode(name, symbol, decimals, msg.sender, isin, cap, maturityDate, faceValue, underlyingAsset)
            )
        );
        address predictedAddress =
            address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, bytecodeHash)))));
        if (isFactoryToken[predictedAddress]) revert AddressAlreadyDeployed();

        Bond newBond = new Bond{ salt: salt }(
            name, symbol, decimals, msg.sender, isin, cap, maturityDate, faceValue, underlyingAsset
        );

        bond = address(newBond);
        allBonds.push(newBond);
        isFactoryToken[bond] = true;

        emit BondCreated(
            bond,
            name,
            symbol,
            decimals,
            msg.sender,
            isin,
            cap,
            maturityDate,
            faceValue,
            underlyingAsset,
            allBonds.length
        );
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
    /// @return The address where the bond would be deployed
    function predictAddress(
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
        view
        returns (address)
    {
        bytes32 salt = _calculateSalt(name, symbol, isin, cap, maturityDate, faceValue, underlyingAsset);
        bytes32 bytecodeHash = keccak256(
            abi.encodePacked(
                type(Bond).creationCode,
                abi.encode(name, symbol, decimals, msg.sender, isin, cap, maturityDate, faceValue, underlyingAsset)
            )
        );

        return address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, bytecodeHash)))));
    }

    /// @notice Calculates the salt for CREATE2 deployment
    /// @dev Used by both create and predictAddress to ensure consistent address calculation
    /// @param name The name of the bond token
    /// @param symbol The symbol of the token
    /// @param isin The ISIN (International Securities Identification Number) of the bond
    /// @param cap The cap for the token
    /// @param maturityDate The timestamp when the bond matures
    /// @param faceValue The face value of the bond in underlying asset base units
    /// @param underlyingAsset The address of the underlying asset contract used for face value denomination
    /// @return The calculated salt for CREATE2 deployment
    function _calculateSalt(
        string memory name,
        string memory symbol,
        string memory isin,
        uint256 cap,
        uint256 maturityDate,
        uint256 faceValue,
        address underlyingAsset
    )
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(name, symbol, isin, cap, maturityDate, faceValue, underlyingAsset));
    }
}
