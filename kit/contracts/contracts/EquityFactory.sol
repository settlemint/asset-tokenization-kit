// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Equity } from "./Equity.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title EquityFactory - A factory contract for creating Equity tokens
/// @notice This contract allows the creation of new Equity tokens with deterministic addresses
/// @dev Uses CREATE2 for deterministic deployment addresses and maintains a list of all created tokens
/// @custom:security-contact support@settlemint.com
contract EquityFactory is ReentrancyGuard {
    error AddressAlreadyDeployed();

    /// @notice Mapping to track if an address was deployed by this factory
    mapping(address => bool) public isFactoryToken;

    /// @notice Emitted when a new equity token is created
    /// @param token The address of the newly created token
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param owner The owner of the token
    /// @param isin The ISIN (International Securities Identification Number) of the equity
    /// @param equityClass The equity class (e.g., "Common", "Preferred")
    /// @param equityCategory The equity category (e.g., "Series A", "Seed")
    event EquityCreated(
        address indexed token,
        string name,
        string symbol,
        uint8 decimals,
        address indexed owner,
        string isin,
        string equityClass,
        string equityCategory
    );

    /// @notice Calculates the salt for CREATE2 deployment
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param isin The ISIN (International Securities Identification Number) of the equity
    /// @return bytes32 The calculated salt
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
        return keccak256(abi.encode(name, symbol, decimals, isin));
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
        nonReentrant
        returns (address token)
    {
        // Check if address is already deployed
        address predicted = predictAddress(name, symbol, decimals, isin, equityClass, equityCategory);
        if (isFactoryToken[predicted]) revert AddressAlreadyDeployed();

        bytes32 salt = _calculateSalt(name, symbol, decimals, isin);

        Equity newToken =
            new Equity{ salt: salt }(name, symbol, decimals, msg.sender, isin, equityClass, equityCategory);

        token = address(newToken);
        isFactoryToken[token] = true;

        emit EquityCreated(token, name, symbol, decimals, msg.sender, isin, equityClass, equityCategory);
    }

    /// @notice Predicts the address where a token will be deployed
    /// @dev Uses the same CREATE2 address derivation as the create function
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param isin The ISIN (International Securities Identification Number) of the equity
    /// @param equityClass The equity class (e.g., "Common", "Preferred")
    /// @param equityCategory The equity category (e.g., "Series A", "Seed")
    /// @return predicted The predicted address where the token will be deployed
    function predictAddress(
        string memory name,
        string memory symbol,
        uint8 decimals,
        string memory isin,
        string memory equityClass,
        string memory equityCategory
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
                                    type(Equity).creationCode,
                                    abi.encode(name, symbol, decimals, isin, equityClass, equityCategory)
                                )
                            )
                        )
                    )
                )
            )
        );
    }
}
