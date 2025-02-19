// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Fund } from "./Fund.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/// @title FundFactory - A factory contract for creating Fund tokens
/// @notice This contract allows the creation of new Fund tokens with deterministic addresses using CREATE2.
/// It provides functionality to create fund tokens with specific parameters, including management fees,
/// and predict their deployment addresses.
/// @dev Inherits from ReentrancyGuard for protection against reentrancy attacks and ERC2771Context for
/// meta-transaction support. Uses CREATE2 for deterministic deployment addresses and maintains a registry
/// of deployed tokens.
/// @custom:security-contact support@settlemint.com
contract FundFactory is ReentrancyGuard, ERC2771Context {
    /// @notice Custom errors for the FundFactory contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error AddressAlreadyDeployed();

    /// @notice Mapping to track if an address was deployed by this factory
    /// @dev Maps token addresses to a boolean indicating if they were created by this factory
    mapping(address => bool) public isFactoryFund;

    /// @notice Emitted when a new fund token is created
    /// @param token The address of the newly created token
    event FundCreated(address indexed token, address indexed creator);

    /// @notice Deploys a new FundFactory contract
    /// @dev Sets up the factory with meta-transaction support
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    constructor(address forwarder) ERC2771Context(forwarder) { }

    /// @notice Creates a new fund token with the specified parameters
    /// @dev Uses CREATE2 for deterministic addresses, includes reentrancy protection,
    /// and validates that the predicted address hasn't been used before.
    /// @param name The name of the token (e.g., "Global Growth Fund")
    /// @param symbol The symbol of the token (e.g., "GGF")
    /// @param decimals The number of decimals for the token (must be <= 18)
    /// @param isin The ISIN (International Securities Identification Number) of the fund (must be empty or 12
    /// characters)
    /// @param fundClass The class of the fund (e.g., "Hedge Fund", "Mutual Fund")
    /// @param fundCategory The fund category (e.g., "Long/Short Equity", "Global Macro")
    /// @param managementFeeBps The management fee in basis points (e.g., 100 for 1%, 200 for 2%)
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
            predictAddress(_msgSender(), name, symbol, decimals, isin, fundClass, fundCategory, managementFeeBps);
        if (isFactoryFund[predicted]) revert AddressAlreadyDeployed();

        bytes32 salt = _calculateSalt(name, symbol, decimals, isin);

        Fund newToken = new Fund{ salt: salt }(
            name, symbol, decimals, _msgSender(), isin, managementFeeBps, fundClass, fundCategory, trustedForwarder()
        );

        token = address(newToken);
        isFactoryFund[token] = true;

        emit FundCreated(token, _msgSender());
    }

    /// @notice Predicts the address where a token would be deployed
    /// @dev Calculates the deterministic address using CREATE2 with the same parameters and salt
    /// computation as the create function. This allows users to know the token's address before deployment.
    /// @param sender The address that would create the token
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param isin The ISIN (International Securities Identification Number) of the fund
    /// @param fundClass The class of the fund (e.g., "Hedge Fund", "Mutual Fund")
    /// @param fundCategory The fund category (e.g., "Long/Short Equity", "Global Macro")
    /// @param managementFeeBps The management fee in basis points (e.g., 100 for 1%, 200 for 2%)
    /// @return predicted The address where the token would be deployed
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
                                        name,
                                        symbol,
                                        decimals,
                                        sender,
                                        isin,
                                        managementFeeBps,
                                        fundClass,
                                        fundCategory,
                                        trustedForwarder()
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
    /// @dev Combines the basic token parameters into a unique salt value. Used by both create and
    /// predictAddress functions to ensure consistent address calculation.
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param isin The ISIN (International Securities Identification Number) of the fund
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
