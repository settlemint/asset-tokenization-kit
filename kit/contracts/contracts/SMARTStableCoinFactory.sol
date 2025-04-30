// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { SMARTStableCoin } from "./SMARTStableCoin.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { SMARTStableCoinRegistry } from "./SMARTStableCoinRegistry.sol";
import { SMARTComplianceModuleParamPair } from
    "@smartprotocol/contracts/interface/structs/SMARTComplianceModuleParamPair.sol";
import { SMARTIdentityRegistry } from "@smartprotocol/contracts/SMARTIdentityRegistry.sol";
import { SMARTCompliance } from "@smartprotocol/contracts/SMARTCompliance.sol";

/// @title SMARTStableCoinFactory - A factory contract for creating SMARTStableCoin tokens
/// @notice This contract allows the creation of new SMARTStableCoin tokens with deterministic addresses using CREATE2.
/// It relies on an external registry contract (`ISMARTRStableCoinRegistry`) to track deployed tokens.
/// @dev Inherits from ReentrancyGuard and ERC2771Context. Uses CREATE2 for deployment.
/// Requires a registry address during deployment.
/// @custom:security-contact support@settlemint.com
contract SMARTStableCoinFactory is ReentrancyGuard, ERC2771Context {
    /// @notice Custom errors for the SMARTStableCoinFactory contract
    error PredictedAddressNotEmpty(); // Changed error for CREATE2 collision check

    /// @notice The address of the SMARTStableCoinRegistry used by this factory.
    SMARTStableCoinRegistry public immutable registry;

    SMARTIdentityRegistry public immutable identityRegistry;
    SMARTCompliance public immutable compliance;

    /// @notice Emitted when a new SMART stablecoin is created and registered
    /// @param token The address of the newly created token
    /// @param creator The address that initiated the creation
    /// @param registry The registry where the token was registered
    event SMARTStableCoinCreated(address indexed token, address indexed creator, address indexed registry);

    /// @notice Deploys a new SMARTStableCoinFactory contract
    /// @dev Sets up the factory with meta-transaction support and links it to the registry.
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    /// @param _registry The address of the SMARTStableCoinRegistry contract
    constructor(
        address forwarder,
        address _registry,
        address identityRegistry_,
        address compliance_
    )
        ERC2771Context(forwarder)
    {
        require(_registry != address(0), "Registry address cannot be zero");
        registry = SMARTStableCoinRegistry(_registry);
        identityRegistry = SMARTIdentityRegistry(identityRegistry_);
        compliance = SMARTCompliance(compliance_);
    }

    /// @notice Creates a new SMART stablecoin token, registers it, and emits an event.
    /// @dev Uses CREATE2, checks for address collisions using code length, includes reentrancy protection,
    /// and registers the token with the configured registry. The caller (`_msgSender()`) becomes the initial owner.
    /// @param name The name of the token (e.g., "Compliant USD")
    /// @param symbol The symbol of the token (e.g., "CUSD")
    /// @param decimals The number of decimals for the token (e.g., 6)
    /// @param onchainID Optional on-chain identifier address (can be address(0))
    /// @param requiredClaimTopics Initial list of required claim topics
    /// @param initialModulePairs Initial list of compliance modules
    /// @return token The address of the newly created token
    function create(
        string memory name,
        string memory symbol,
        uint8 decimals,
        address onchainID,
        uint256[] memory requiredClaimTopics,
        SMARTComplianceModuleParamPair[] memory initialModulePairs
    )
        external
        nonReentrant // Keep ReentrancyGuard due to external call to registry
        returns (address token)
    {
        address creator = _msgSender(); // Cache msgSender

        // Predict address
        address predicted =
            predictAddress(creator, name, symbol, decimals, onchainID, requiredClaimTopics, initialModulePairs);

        // Check if address already has code (CREATE2 collision prevention)
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(predicted)
        }
        if (codeSize > 0) revert PredictedAddressNotEmpty();

        // Calculate salt
        bytes32 salt = _calculateSalt(name, symbol, decimals);

        // Deploy using CREATE2
        SMARTStableCoin newToken = new SMARTStableCoin{ salt: salt }(
            name,
            symbol,
            decimals,
            onchainID,
            requiredClaimTopics,
            initialModulePairs,
            address(identityRegistry),
            address(compliance),
            creator, // Initial owner
            trustedForwarder() // ERC2771 forwarder
        );

        token = address(newToken);

        // Register the token in the registry
        registry.registerToken(token); // External call to registry

        emit SMARTStableCoinCreated(token, creator, address(registry));
    }

    /// @notice Predicts the address where a SMART stablecoin token would be deployed
    /// @dev Calculates the deterministic address using CREATE2 with the same parameters and salt
    /// computation as the create function.
    /// @param sender The address that would create the token (used as predicted initialOwner)
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @param onchainID Optional on-chain identifier address

    /// @param requiredClaimTopics Initial list of required claim topics
    /// @param initialModulePairs Initial list of compliance modules
    /// @return predicted The address where the token would be deployed
    function predictAddress(
        address sender,
        string memory name,
        string memory symbol,
        uint8 decimals,
        address onchainID,
        uint256[] memory requiredClaimTopics,
        SMARTComplianceModuleParamPair[] memory initialModulePairs
    )
        public
        view
        returns (address predicted)
    {
        bytes32 salt = _calculateSalt(name, symbol, decimals);
        // Encode constructor arguments for SMARTStableCoin
        // Note: The `sender` argument is passed as the `initialOwner` for the prediction.
        // The `trustedForwarder()` argument is implicitly handled by ERC2771Context in the actual constructor.
        // For prediction, we pass the factory's known forwarder address.
        bytes memory constructorArgs = abi.encode(
            name,
            symbol,
            decimals,
            onchainID,
            requiredClaimTopics,
            initialModulePairs,
            identityRegistry,
            compliance,
            sender, // Use the provided sender as the initial owner for prediction
            trustedForwarder() // Use the factory's trusted forwarder for prediction
        );

        // Combine creation code and arguments
        bytes memory bytecode = abi.encodePacked(type(SMARTStableCoin).creationCode, constructorArgs);

        // Calculate CREATE2 address
        bytes32 bytecodeHash = keccak256(bytecode);
        predicted = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff), // CREATE2 prefix
                            address(this), // Factory address
                            salt, // Deployment salt
                            bytecodeHash // Hash of bytecode + constructor args
                        )
                    )
                )
            )
        );
    }

    /// @notice Calculates the salt for CREATE2 deployment based on basic token info
    /// @dev Combines the basic token parameters into a unique salt value.
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param decimals The number of decimals for the token
    /// @return The calculated salt for CREATE2 deployment
    function _calculateSalt(string memory name, string memory symbol, uint8 decimals) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(name, symbol, decimals));
    }
}
