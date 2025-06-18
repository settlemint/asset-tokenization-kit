// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title IATKSystem Interface
/// @author SettleMint Tokenization Services
/// @notice This interface outlines the essential functions for interacting with the ATK Protocol's central system
/// contract.
/// @dev The ATK System contract serves as the main hub and discovery point for various modules and features within
/// the
/// ATK Protocol. It allows other contracts and external users to find the addresses of crucial components like
/// compliance modules, identity registries, and their corresponding proxy contracts. These proxies are important
/// because they enable these components to be upgraded in the future without altering the addresses that other parts
/// of the system use to interact with them, ensuring stability and maintainability.
interface IATKSystem is IERC165 {
    // --- Events ---
    // Events are signals emitted by the contract that can be listened to by external applications or other contracts.
    // They are a way to log important state changes or actions.

    /// @notice Emitted when the implementation (logic contract) for the compliance module is updated.
    /// @param sender The address that called the `updateComplianceImplementation` function.
    /// @param newImplementation The address of the new compliance module implementation contract.
    event ComplianceImplementationUpdated(address indexed sender, address indexed newImplementation);
    /// @notice Emitted when the implementation (logic contract) for the identity registry module is updated.
    /// @param sender The address that called the `updateIdentityRegistryImplementation` function.
    /// @param newImplementation The address of the new identity registry module implementation contract.
    event IdentityRegistryImplementationUpdated(address indexed sender, address indexed newImplementation);
    /// @notice Emitted when the implementation (logic contract) for the identity registry storage module is updated.
    /// @param sender The address that called the `updateIdentityRegistryStorageImplementation` function.
    /// @param newImplementation The address of the new identity registry storage module implementation contract.
    event IdentityRegistryStorageImplementationUpdated(address indexed sender, address indexed newImplementation);
    /// @notice Emitted when the implementation (logic contract) for the trusted issuers registry module is updated.
    /// @param sender The address that called the `updateTrustedIssuersRegistryImplementation` function.
    /// @param newImplementation The address of the new trusted issuers registry module implementation contract.
    event TrustedIssuersRegistryImplementationUpdated(address indexed sender, address indexed newImplementation);
    /// @notice Emitted when the implementation (logic contract) for the topic scheme registry module is updated.
    /// @param sender The address that called the `updateTopicSchemeRegistryImplementation` function.
    /// @param newImplementation The address of the new topic scheme registry module implementation contract.
    event TopicSchemeRegistryImplementationUpdated(address indexed sender, address indexed newImplementation);
    /// @notice Emitted when the implementation (logic contract) for the identity factory module is updated.
    /// @param sender The address that called the `updateIdentityFactoryImplementation` function.
    /// @param newImplementation The address of the new identity factory module implementation contract.
    event IdentityFactoryImplementationUpdated(address indexed sender, address indexed newImplementation);
    /// @notice Emitted when the implementation (logic contract) for the standard identity module is updated.
    /// @dev Standard identity contracts are typically used to represent users or general entities.
    /// @param sender The address that called the `updateIdentityImplementation` function.
    /// @param newImplementation The address of the new standard identity module implementation contract.
    event IdentityImplementationUpdated(address indexed sender, address indexed newImplementation);
    /// @notice Emitted when the implementation (logic contract) for the token identity module is updated.
    /// @dev Token identity contracts might be specialized identities associated with specific tokens.
    /// @param sender The address that called the `updateTokenIdentityImplementation` function.
    /// @param newImplementation The address of the new token identity module implementation contract.
    event TokenIdentityImplementationUpdated(address indexed sender, address indexed newImplementation);
    /// @notice Emitted when the implementation (logic contract) for the token access manager module is updated.
    /// @param sender The address that called the `updateTokenAccessManagerImplementation` function.
    /// @param newImplementation The address of the new token access manager module implementation contract.
    event TokenAccessManagerImplementationUpdated(address indexed sender, address indexed newImplementation);

    /// @notice Emitted when the implementation (logic contract) for the compliance module registry is updated.
    /// @param sender The address that called the function.
    /// @param newImplementation The address of the new compliance module registry implementation contract.
    event ComplianceModuleRegistryImplementationUpdated(address indexed sender, address indexed newImplementation);

    /// @notice Emitted when the implementation (logic contract) for the addon registry is updated.
    /// @param sender The address that called the function.
    /// @param newImplementation The address of the new addon registry implementation contract.
    event AddonRegistryImplementationUpdated(address indexed sender, address indexed newImplementation);

    /// @notice Emitted when the implementation (logic contract) for the token factory registry is updated.
    /// @param sender The address that called the function.
    /// @param newImplementation The address of the new token factory registry implementation contract.
    event TokenFactoryRegistryImplementationUpdated(address indexed sender, address indexed newImplementation);

    /// @notice Emitted when a compliance module is registered.
    /// @param sender The address that called the registration function.
    /// @param name The name of the compliance module.
    /// @param moduleTypeHash The type hash of the compliance module.
    /// @param module The address of the compliance module.
    /// @param timestamp The timestamp of the registration.
    event ComplianceModuleRegistered(
        address indexed sender, string name, bytes32 indexed moduleTypeHash, address indexed module, uint256 timestamp
    );

    /// @notice Emitted when the `bootstrap` function has been successfully executed, creating and linking proxy
    /// contracts
    /// for all core modules of the ATKSystem.
    /// @param sender The address that called the `bootstrap` function.
    /// @param complianceProxy The address of the deployed ATKComplianceProxy contract.
    /// @param identityRegistryProxy The address of the deployed ATKIdentityRegistryProxy contract.
    /// @param identityRegistryStorageProxy The address of the deployed ATKIdentityRegistryStorageProxy contract.
    /// @param trustedIssuersRegistryProxy The address of the deployed ATKTrustedIssuersRegistryProxy contract.
    /// @param topicSchemeRegistryProxy The address of the deployed ATKTopicSchemeRegistryProxy contract.
    /// @param identityFactoryProxy The address of the deployed ATKIdentityFactoryProxy contract.
    /// @param tokenFactoryRegistryProxy The address of the deployed ATKTokenFactoryRegistryProxy contract.
    /// @param systemAddonRegistryProxy The address of the deployed ATKSystemAddonRegistryProxy contract.
    /// @param complianceModuleRegistryProxy The address of the deployed ATKComplianceModuleRegistryProxy contract.
    /// @param identityVerificationModule The address of the deployed IdentityVerificationModule contract.
    event Bootstrapped(
        address indexed sender,
        address indexed complianceProxy,
        address indexed identityRegistryProxy,
        address identityRegistryStorageProxy,
        address trustedIssuersRegistryProxy,
        address topicSchemeRegistryProxy,
        address identityFactoryProxy,
        address tokenFactoryRegistryProxy,
        address systemAddonRegistryProxy,
        address complianceModuleRegistryProxy,
        address identityVerificationModule
    );

    /// @notice Initializes and sets up the entire ATK Protocol system.
    /// @dev This function is responsible for the initial deployment and configuration of the ATK Protocol.
    /// This involves deploying necessary smart contracts, setting initial parameters, and defining the relationships
    /// and connections between different components of the system.
    /// It is critically important that this function is called only ONCE during the very first deployment of the
    /// protocol.
    /// Attempting to call it more than once could result in severe errors, misconfigurations, or unpredictable behavior
    /// in the protocol's operation.
    function bootstrap() external;

    /// @notice Retrieves the smart contract address of the proxy for the compliance module.
    /// @dev A proxy contract is an intermediary contract that delegates all function calls it receives to another
    /// contract, known as the implementation contract (which contains the actual logic).
    /// The primary benefit of using a proxy is that the underlying logic (implementation) can be upgraded
    /// without changing the address that other contracts or users interact with. This provides flexibility and
    /// allows for bug fixes or feature additions without disrupting the ecosystem.
    /// This function returns the stable, unchanging address of the compliance module's proxy contract.
    /// All interactions with the compliance module should go through this proxy address.
    /// @return complianceProxyAddress The blockchain address of the compliance module's proxy contract.
    function complianceProxy() external view returns (address complianceProxyAddress);

    /// @notice Retrieves the smart contract address of the proxy for the identity registry module.
    /// @dev Similar to the compliance proxy, this function returns the stable, unchanging address of the identity
    /// registry's proxy contract.
    /// To interact with the identity registry (e.g., to query identity information or register a new identity,
    /// depending on its features), you should use this proxy address. It will automatically forward your requests
    /// to the current logic implementation contract.
    /// @return identityRegistryProxyAddress The blockchain address of the identity registry module's proxy contract.
    function identityRegistryProxy() external view returns (address identityRegistryProxyAddress);

    /// @notice Retrieves the smart contract address of the proxy for the identity registry storage module.
    /// @dev This function returns the stable, unchanging address of the identity registry storage's proxy contract.
    /// All interactions related to storing or retrieving identity data should go through this proxy address.
    /// It ensures that calls are directed to the current logic implementation for identity data management.
    /// @return identityRegistryStorageProxyAddress The blockchain address of the identity registry storage module's
    /// proxy contract.
    function identityRegistryStorageProxy() external view returns (address identityRegistryStorageProxyAddress);

    /// @notice Retrieves the smart contract address of the proxy for the trusted issuers registry module.
    /// @dev This function returns the stable, unchanging address of the trusted issuers registry's proxy contract.
    /// To interact with the trusted issuers registry (e.g., to check if an issuer is trusted or to add/remove
    /// issuers, depending on its features), you should use this proxy address. It will forward calls to the
    /// current logic implementation.
    /// @return trustedIssuersRegistryProxyAddress The blockchain address of the trusted issuers registry module's
    /// proxy.
    function trustedIssuersRegistryProxy() external view returns (address trustedIssuersRegistryProxyAddress);

    /// @notice Retrieves the smart contract address of the proxy for the identity factory module.
    /// @dev This function returns the stable, unchanging address of the identity factory's proxy contract.
    /// To create new identities within the ATK Protocol, you should interact with this proxy address.
    /// It will delegate the identity creation requests to the current active logic implementation of the
    /// identity factory.
    /// @return identityFactoryProxyAddress The blockchain address of the identity factory module's proxy contract.
    function identityFactoryProxy() external view returns (address identityFactoryProxyAddress);

    /// @notice Retrieves the smart contract address of the proxy for the topic scheme registry module.
    /// @dev This function returns the stable, unchanging address of the topic scheme registry's proxy contract.
    /// To interact with the topic scheme registry (e.g., to register topic schemes or retrieve topic signatures),
    /// you should use this proxy address. It will forward calls to the current logic implementation.
    /// @return topicSchemeRegistryProxyAddress The blockchain address of the topic scheme registry module's proxy.
    function topicSchemeRegistryProxy() external view returns (address topicSchemeRegistryProxyAddress);

    /// @notice Returns the address of the token factory registry.
    /// @return The address of the token factory registry contract.
    function tokenFactoryRegistryProxy() external view returns (address);

    /// @notice Returns the address of the system addon registry.
    /// @return The address of the system addon registry contract.
    function systemAddonRegistryProxy() external view returns (address);

    /// @notice Returns the address of the compliance module registry.
    /// @return The address of the compliance module registry contract.
    function complianceModuleRegistryProxy() external view returns (address);

    /// @notice Retrieves the smart contract address of the proxy for the identity verification module.
    /// @dev This function returns the stable, unchanging address of the identity verification module's proxy contract.
    /// To interact with the identity verification module (e.g., to verify an identity or check verification status),
    /// you should use this proxy address. It will forward calls to the current logic implementation.
    /// @return identityVerificationModuleAddress The blockchain address of the identity verification module's proxy.
    function identityVerificationModule() external view returns (address identityVerificationModuleAddress);
}
