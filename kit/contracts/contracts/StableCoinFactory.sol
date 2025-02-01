// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { StableCoin } from "./StableCoin.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title StableCoinFactory - A factory contract for creating StableCoin tokens
/// @notice This contract allows the creation of new StableCoin tokens with deterministic addresses
/// @dev Uses CREATE2 for deterministic deployment addresses and maintains a list of all created tokens
/// @custom:security-contact support@settlemint.com
contract StableCoinFactory is ReentrancyGuard {
    error AddressAlreadyDeployed();

    /// @notice Mapping to track if an address was deployed by this factory
    mapping(address => bool) public isFactoryToken;

    /// @notice Emitted when a new stablecoin is created
    event StableCoinCreated(
        address indexed token, string name, string symbol, uint8 decimals, address indexed owner, string isin
    );

    /// @notice Creates a new stablecoin token with the specified parameters
    /// @dev Uses CREATE2 for deterministic addresses and emits a StableCoinCreated event
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param isin The optional ISIN (International Securities Identification Number) of the stablecoin
    /// @param collateralLivenessSeconds Duration in seconds that collateral proofs remain valid
    /// @return token The address of the newly created token
    function create(
        string memory name,
        string memory symbol,
        uint8 decimals,
        string memory isin,
        uint48 collateralLivenessSeconds
    )
        external
        nonReentrant
        returns (address token)
    {
        // Check if address is already deployed
        address predicted = predictAddress(name, symbol, decimals, isin, collateralLivenessSeconds);
        if (isFactoryToken[predicted]) revert AddressAlreadyDeployed();

        bytes32 salt = _calculateSalt(name, symbol, decimals, isin);

        StableCoin newToken =
            new StableCoin{ salt: salt }(name, symbol, decimals, msg.sender, isin, collateralLivenessSeconds);

        token = address(newToken);
        isFactoryToken[token] = true;

        emit StableCoinCreated(token, name, symbol, decimals, msg.sender, isin);
    }

    /// @notice Calculates the deterministic address for a token with the given parameters
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param isin The optional ISIN (International Securities Identification Number) of the stablecoin
    /// @param collateralLivenessSeconds Duration in seconds that collateral proofs remain valid
    /// @return predicted The predicted address where the token will be deployed
    function predictAddress(
        string memory name,
        string memory symbol,
        uint8 decimals,
        string memory isin,
        uint48 collateralLivenessSeconds
    )
        public
        view
        returns (address predicted)
    {
        bytes32 salt = _calculateSalt(name, symbol, decimals, isin);

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
                                    type(StableCoin).creationCode,
                                    abi.encode(name, symbol, decimals, msg.sender, isin, collateralLivenessSeconds)
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
        string memory isin
    )
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(name, symbol, decimals, isin));
    }
}
