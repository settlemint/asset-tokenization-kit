// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Fund } from "./Fund.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title FundFactory - A factory contract for creating Fund tokens
/// @notice This contract allows the creation of new Fund tokens with deterministic addresses
/// @dev Uses CREATE2 for deterministic deployment addresses and maintains a list of all created tokens
/// @custom:security-contact support@settlemint.com
contract FundFactory is ReentrancyGuard {
    error AddressAlreadyDeployed();

    /// @notice Mapping to track if an address was deployed by this factory
    mapping(address => bool) public isFactoryFund;

    /// @notice Emitted when a new fund token is created
    /// @param token The address of the newly created token
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param owner The owner of the token
    /// @param isin The ISIN (International Securities Identification Number) of the fund
    /// @param fundClass The class of the fund (e.g., "Hedge Fund", "Mutual Fund")
    /// @param fundCategory The fund category (e.g., "Long/Short Equity", "Global Macro")
    /// @param managementFeeBps The management fee in basis points
    event FundCreated(
        address indexed token,
        string name,
        string symbol,
        uint8 decimals,
        address indexed owner,
        string isin,
        string fundClass,
        string fundCategory,
        uint16 managementFeeBps
    );

    /// @notice Creates a new fund token with the specified parameters
    /// @dev Uses CREATE2 for deterministic addresses and emits a FundCreated event
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param isin The ISIN (International Securities Identification Number) of the fund
    /// @param fundClass The class of the fund (e.g., "Hedge Fund", "Mutual Fund")
    /// @param fundCategory The fund category (e.g., "Long/Short Equity", "Global Macro")
    /// @param managementFeeBps The management fee in basis points (e.g., 100 for 1%)
    /// @return token The address of the newly created token
    function create(
        string memory name,
        string memory symbol,
        uint8 decimals,
        string memory isin,
        string memory fundClass,
        string memory fundCategory,
        uint16 managementFeeBps
    )
        external
        nonReentrant
        returns (address token)
    {
        // Check if address is already deployed
        address predicted =
            predictAddress(msg.sender, name, symbol, decimals, isin, fundClass, fundCategory, managementFeeBps);
        if (isFactoryFund[predicted]) revert AddressAlreadyDeployed();

        bytes32 salt = _calculateSalt(name, symbol, decimals, isin);

        Fund newToken =
            new Fund{ salt: salt }(name, symbol, decimals, msg.sender, isin, managementFeeBps, fundClass, fundCategory);

        token = address(newToken);
        isFactoryFund[token] = true;

        emit FundCreated(token, name, symbol, decimals, msg.sender, isin, fundClass, fundCategory, managementFeeBps);
    }

    /// @notice Predicts the address where a fund will be deployed
    /// @dev Uses the same CREATE2 address derivation as the create function
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param isin The ISIN (International Securities Identification Number) of the fund
    /// @param fundClass The class of the fund (e.g., "Hedge Fund", "Mutual Fund")
    /// @param fundCategory The fund category (e.g., "Long/Short Equity", "Global Macro")
    /// @param managementFeeBps The management fee in basis points (e.g., 100 for 1%)
    /// @return predicted The predicted address where the fund will be deployed
    function predictAddress(
        address sender,
        string memory name,
        string memory symbol,
        uint8 decimals,
        string memory isin,
        string memory fundClass,
        string memory fundCategory,
        uint16 managementFeeBps
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
                                    type(Fund).creationCode,
                                    abi.encode(
                                        name, symbol, decimals, sender, isin, managementFeeBps, fundClass, fundCategory
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
    }

    /// @notice Calculates the salt for CREATE2 deployment
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
        return keccak256(abi.encodePacked(name, symbol, decimals, isin));
    }
}
