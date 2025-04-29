// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { SMARTStableCoin } from "./SMARTStableCoin.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { ISMART } from "@smartprotocol/contracts/interface/ISMART.sol"; // For ComplianceModuleParamPair type

/// @title SMARTStableCoinFactory - A factory contract for creating SMARTStableCoin tokens
/// @notice This contract allows the creation of new SMARTStableCoin tokens with deterministic addresses using CREATE2.
/// It provides functionality to create SMART-compliant stablecoins with specific parameters and predict their
/// deployment addresses.
/// @dev Inherits from ReentrancyGuard for protection against reentrancy attacks and ERC2771Context for
/// meta-transaction support. Uses CREATE2 for deterministic deployment addresses and maintains a registry
/// of deployed tokens.
/// @custom:security-contact support@settlemint.com
contract SMARTStableCoinFactory is ReentrancyGuard, ERC2771Context {
    /// @notice Custom errors for the SMARTStableCoinFactory contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error AddressAlreadyDeployed();

    /// @notice Mapping to track if an address was deployed by this factory
    /// @dev Maps token addresses to a boolean indicating if they were created by this factory
    mapping(address => bool) public isFactoryToken;

    /// @notice Emitted when a new SMART stablecoin is created
    /// @param token The address of the newly created token
    /// @param creator The address that initiated the creation
    event SMARTStableCoinCreated(address indexed token, address indexed creator);

    /// @notice Deploys a new SMARTStableCoinFactory contract
    /// @dev Sets up the factory with meta-transaction support
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    constructor(address forwarder) ERC2771Context(forwarder) { }

    /// @notice Creates a new SMART stablecoin token with the specified parameters
    /// @dev Uses CREATE2 for deterministic addresses, includes reentrancy protection,
    /// and validates that the predicted address hasn't been used before. The caller (`_msgSender()`) becomes the
    /// initial owner.
    /// @param name The name of the token (e.g., "Compliant USD")
    /// @param symbol The symbol of the token (e.g., "CUSD")
    /// @param decimals The number of decimals for the token (e.g., 6)
    /// @param onchainID Optional on-chain identifier address (can be address(0))
    /// @param identityRegistry Address of the identity registry contract
    /// @param compliance Address of the compliance contract
    /// @param requiredClaimTopics Initial list of required claim topics
    /// @param initialModulePairs Initial list of compliance modules
    /// @return token The address of the newly created token
    function create(
        string memory name,
        string memory symbol,
        uint8 decimals,
        address onchainID,
        address identityRegistry,
        address compliance,
        uint256[] memory requiredClaimTopics,
        ISMART.ComplianceModuleParamPair[] memory initialModulePairs
    )
        external
        nonReentrant
        returns (address token)
    {
        address creator = _msgSender(); // Cache msgSender

        // Check if address is already deployed
        address predicted = predictAddress(
            creator,
            name,
            symbol,
            decimals,
            onchainID,
            identityRegistry,
            compliance,
            requiredClaimTopics,
            initialModulePairs
        );
        if (isAddressDeployed(predicted)) revert AddressAlreadyDeployed();

        bytes32 salt = _calculateSalt(name, symbol, decimals);

        SMARTStableCoin newToken = new SMARTStableCoin{ salt: salt }(
            name,
            symbol,
            decimals,
            onchainID,
            identityRegistry,
            compliance,
            requiredClaimTopics,
            initialModulePairs,
            creator,
            trustedForwarder()
        );

        token = address(newToken);
        isFactoryToken[token] = true;

        emit SMARTStableCoinCreated(token, creator);
    }

    /// @notice Predicts the address where a SMART stablecoin token would be deployed
    /// @dev Calculates the deterministic address using CREATE2 with the same parameters and salt
    /// computation as the create function. This allows users to know the token's address before deployment.
    /// @param sender The address that would create the token
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param onchainID Optional on-chain identifier address
    /// @param identityRegistry Address of the identity registry contract
    /// @param compliance Address of the compliance contract
    /// @param requiredClaimTopics Initial list of required claim topics
    /// @param initialModulePairs Initial list of compliance modules
    /// @return predicted The address where the token would be deployed
    function predictAddress(
        address sender,
        string memory name,
        string memory symbol,
        uint8 decimals,
        address onchainID,
        address identityRegistry,
        address compliance,
        uint256[] memory requiredClaimTopics,
        ISMART.ComplianceModuleParamPair[] memory initialModulePairs
    )
        public
        view
        returns (address predicted)
    {
        bytes32 salt = _calculateSalt(name, symbol, decimals);
        bytes memory constructorArgs = abi.encode(
            name,
            symbol,
            decimals,
            onchainID,
            identityRegistry,
            compliance,
            requiredClaimTopics,
            initialModulePairs,
            sender // The sender passed to predictAddress is used as initialOwner for prediction
        );

        predicted = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            address(this),
                            salt,
                            keccak256(abi.encodePacked(type(SMARTStableCoin).creationCode, constructorArgs))
                        )
                    )
                )
            )
        );
    }

    /// @notice Calculates the salt for CREATE2 deployment based on basic token info
    /// @dev Combines the basic token parameters into a unique salt value. Used by both create and
    /// predictAddress functions to ensure consistent address calculation.
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @return The calculated salt for CREATE2 deployment
    function _calculateSalt(string memory name, string memory symbol, uint8 decimals) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(name, symbol, decimals));
    }

    /// @notice Checks if an address was deployed by this factory
    /// @dev Returns true if the address was created by this factory, false otherwise
    /// @param token The address to check
    /// @return True if the address was created by this factory, false otherwise
    function isAddressDeployed(address token) public view returns (bool) {
        return isFactoryToken[token];
    }
}
