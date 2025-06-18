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
    /// @param identityVerificationModule The address of the deployed IdentityVerificationModule contract.
    event Bootstrapped(
        address indexed sender,
        address indexed complianceProxy,
        address indexed identityRegistryProxy,
        address identityRegistryStorageProxy,
        address trustedIssuersRegistryProxy,
        address topicSchemeRegistryProxy,
        address identityFactoryProxy,
        address identityVerificationModule
    );

    /// @notice Emitted when a ATKTokenFactory is registered.
    /// @param sender The address that registered the token factory.
    /// @param name The human-readable name of the token factory.
    /// @param typeId The type identifier of the token factory.
    /// @param proxyAddress The address of the deployed token factory proxy.
    /// @param implementationAddress The address of the deployed token factory implementation.
    /// @param timestamp The timestamp of the token factory creation.
    event TokenFactoryCreated(
        address indexed sender,
        string name,
        bytes32 typeId,
        address proxyAddress,
        address implementationAddress,
        uint256 timestamp
    );

    /// @notice Emitted when a system addon is created.
    /// @param sender The address that created the system addon.
    /// @param name The human-readable name of the system addon.
    /// @param typeId The type identifier of the system addon.
    /// @param proxyAddress The address of the deployed system addon proxy.
    /// @param implementation The address of the deployed system addon implementation.
    /// @param initializationData The encoded function call to initialize the system addon.
    /// @param timestamp The timestamp of the system addon creation.
    event SystemAddonCreated(
        address indexed sender,
        string name,
        bytes32 typeId,
        address proxyAddress,
        address implementation,
        bytes initializationData,
        uint256 timestamp
    );

    /// @notice Emitted when a compliance module is registered.
    /// @param sender The address that registered the compliance module.
    /// @param name The human-readable name of the compliance module.
    /// @param typeId The type identifier of the compliance module.
    /// @param moduleAddress The address of the registered compliance module.
    /// @param timestamp The timestamp of the compliance module registration.
    event ComplianceModuleRegistered(
        address indexed sender, string name, bytes32 typeId, address indexed moduleAddress, uint256 timestamp
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

    /// @notice Creates a new token factory implementation and proxy.
    /// @param _name The human-readable name of the token factory.
    /// @param _factoryImplementation The address of the token factory implementation contract.
    /// @param _tokenImplementation The address of the token implementation contract.
    function createTokenFactory(
        string calldata _name,
        address _factoryImplementation,
        address _tokenImplementation
    )
        external
        returns (address);

    /// @notice Deploys and registers a new system addon with a proxy and initializer.
    /// @param name A human-readable identifier (e.g., "Swap", "YieldContract").
    /// @param implementation The address of the logic contract to use for the proxy.
    /// @param initializationData Encoded function call to initialize the proxy (e.g., abi.encodeWithSelector(...)).
    /// @return proxyAddress The address of the newly deployed proxy.
    function createSystemAddon(
        string calldata name,
        address implementation,
        bytes calldata initializationData
    )
        external
        returns (address proxyAddress);

    /// @notice Registers a new compliance module in the system.
    /// @param _moduleAddress The address of the compliance module implementation contract.
    function registerComplianceModule(address _moduleAddress) external;

    /// @notice Retrieves the current, active smart contract address of the compliance module's logic.
    /// @dev Compliance modules are responsible for enforcing rules and restrictions on token transfers, account
    /// interactions,
    /// or other operations within the ATK Protocol. For example, they might check if a transfer is allowed based on
    /// regulatory requirements.
    /// This function returns the specific address of the contract that holds the actual programming code (the "logic")
    /// for these compliance checks.
    /// It's important to note that this address can change if the compliance logic is updated or upgraded to a new
    /// version.
    /// @return complianceImplementationAddress The blockchain address of the smart contract containing the compliance
    /// logic.
    function complianceImplementation() external view returns (address complianceImplementationAddress);

    /// @notice Retrieves the current, active smart contract address of the identity registry module's logic.
    /// @dev Identity registries are a core component for managing information about users, organizations, or any entity
    /// interacting with ATK tokens. This can include details like Know Your Customer (KYC) / Anti-Money Laundering
    /// (AML)
    /// status, investor qualifications, country of residence, or other relevant identity attributes.
    /// This function returns the specific address of the contract that holds the actual programming code (the "logic")
    /// for the identity registry.
    /// Similar to other modules, this address can change if the identity registry's logic is upgraded.
    /// @return identityRegistryImplementationAddress The blockchain address of the smart contract containing the
    /// identity
    /// registry logic.
    function identityRegistryImplementation() external view returns (address identityRegistryImplementationAddress);

    /// @notice Retrieves the current, active smart contract address of the identity registry storage module's logic.
    /// @dev Identity registry storage modules are dedicated to securely and efficiently storing the data associated
    /// with
    /// the identities managed by the identity registry. This separation of logic and storage can enhance security and
    /// upgradeability.
    /// This function returns the specific address of the contract that holds the actual programming code (the "logic")
    /// for managing this identity data storage.
    /// This address may change if the storage management logic is upgraded or if data is migrated to a new storage
    /// system.
    /// @return identityRegistryStorageImplementationAddress The blockchain address of the smart contract containing the
    /// identity registry storage logic.
    function identityRegistryStorageImplementation()
        external
        view
        returns (address identityRegistryStorageImplementationAddress);

    /// @notice Retrieves the current, active smart contract address of the identity factory module's logic.
    /// @dev Identity factories are responsible for the creation of new identity contracts or records within the
    /// ATK Protocol. They provide a standardized way to onboard new users or entities and associate them with
    /// an on-chain identity.
    /// This function returns the specific address of the contract that holds the actual programming code (the "logic")
    /// for this identity creation process.
    /// This address can change if the identity factory's logic is upgraded.
    /// @return identityFactoryImplementationAddress The blockchain address of the smart contract containing the
    /// identity
    /// factory logic.
    function identityFactoryImplementation() external view returns (address identityFactoryImplementationAddress);

    /// @notice Retrieves the current, active smart contract address of the trusted issuers registry module's logic.
    /// @dev Trusted issuers registries play a crucial role in decentralized identity systems. They maintain a list of
    /// entities (known as "issuers," such as KYC providers, accreditation bodies, etc.) that are authorized and trusted
    /// to make verifiable claims or attestations about identities (e.g., "User X is KYC verified," "Entity Y is an
    /// accredited investor").
    /// This function returns the specific address of the contract that holds the actual programming code (the "logic")
    /// for managing this list of trusted issuers.
    /// This address can change if the trusted issuers registry's logic is upgraded.
    /// @return trustedIssuersRegistryImplementationAddress The blockchain address of the smart contract containing the
    /// trusted issuers registry logic.
    function trustedIssuersRegistryImplementation()
        external
        view
        returns (address trustedIssuersRegistryImplementationAddress);

    /// @notice Retrieves the current, active smart contract address of the topic scheme registry module's logic.
    /// @dev Topic scheme registries manage the registration and lifecycle of topic schemes used for claim data
    /// structures.
    /// They store mapping between topic IDs and their corresponding signatures for encoding/decoding claim data.
    /// This function returns the specific address of the contract that holds the actual programming code (the "logic")
    /// for managing topic schemes.
    /// This address can change if the topic scheme registry's logic is upgraded.
    /// @return topicSchemeRegistryImplementationAddress The blockchain address of the smart contract containing the
    /// topic scheme registry logic.
    function topicSchemeRegistryImplementation()
        external
        view
        returns (address topicSchemeRegistryImplementationAddress);

    /// @notice Retrieves the current, active smart contract address of the standard identity contract's logic.
    /// @dev Standard identity contracts are the actual on-chain representations of individual users, organizations, or
    /// entities within the ATK Protocol. These contracts typically hold claims and attributes related to an identity.
    /// This function returns the address of the base implementation (template) contract that new standard identity
    /// contracts will be created from (often via a proxy pattern).
    /// This address can change if the underlying logic for standard identity contracts is upgraded.
    /// @return identityImplementationAddress The blockchain address of the smart contract containing the standard
    /// identity logic.
    function identityImplementation() external view returns (address identityImplementationAddress);

    /// @notice Retrieves the current, active smart contract address of the token identity contract's logic.
    /// @dev Token identity contracts are a specialized type of identity contract that might be specifically linked to
    /// certain tokens, tokenized assets, or have features tailored for token interactions.
    /// This function returns the address of the base implementation (template) contract that new token identity
    /// contracts will be created from.
    /// This address can change if the underlying logic for token identity contracts is upgraded.
    /// @return tokenIdentityImplementationAddress The blockchain address of the smart contract containing the token
    /// identity logic.
    function tokenIdentityImplementation() external view returns (address tokenIdentityImplementationAddress);

    /// @notice Retrieves the current, active smart contract address of the token access manager contract's logic.
    /// @dev Token access managers are responsible for managing access control for tokens.
    /// This function returns the address of the base implementation (template) contract that new token access
    /// managers will be created from.
    /// This address can change if the underlying logic for token access managers is upgraded.
    /// @return tokenAccessManagerImplementationAddress The blockchain address of the smart contract containing the
    function tokenAccessManagerImplementation()
        external
        view
        returns (address tokenAccessManagerImplementationAddress);

    /// @notice Returns the address of the current token registry implementation.
    /// @param factoryTypeHash The hash of the factory type.
    /// @return The address of the token factory implementation contract.
    function tokenFactoryImplementation(bytes32 factoryTypeHash) external view returns (address);

    /// @notice Returns the address of the current system addon implementation.
    /// @param addonTypeHash The hash of the addon type.
    /// @return The address of the system addon implementation contract.
    function addonImplementation(bytes32 addonTypeHash) external view returns (address);

    /// @notice Returns the address of the current compliance module implementation.
    /// @param moduleTypeHash The hash of the module type.
    /// @return The address of the compliance module implementation contract.
    function complianceModule(bytes32 moduleTypeHash) external view returns (address);

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

    /// @notice Returns the address of the token factory proxy.
    /// @param factoryTypeHash The hash of the factory type.
    /// @return The address of the token factory proxy contract.
    function tokenFactoryProxy(bytes32 factoryTypeHash) external view returns (address);

    /// @notice Returns the address of the system addon proxy.
    /// @param addonTypeHash The hash of the addon type.
    /// @return The address of the system addon proxy contract.
    function addonProxy(bytes32 addonTypeHash) external view returns (address);

    /// @notice Retrieves the smart contract address of the proxy for the topic scheme registry module.
    /// @dev This function returns the stable, unchanging address of the topic scheme registry's proxy contract.
    /// To interact with the topic scheme registry (e.g., to register topic schemes or retrieve topic signatures),
    /// you should use this proxy address. It will forward calls to the current logic implementation.
    /// @return topicSchemeRegistryProxyAddress The blockchain address of the topic scheme registry module's proxy.
    function topicSchemeRegistryProxy() external view returns (address topicSchemeRegistryProxyAddress);

    /// @notice Retrieves the smart contract address of the proxy for the identity verification module.
    /// @dev This function returns the stable, unchanging address of the identity verification module's proxy contract.
    /// To interact with the identity verification module (e.g., to verify an identity or check verification status),
    /// you should use this proxy address. It will forward calls to the current logic implementation.
    /// @return identityVerificationModuleAddress The blockchain address of the identity verification module's proxy.
    function identityVerificationModule() external view returns (address identityVerificationModuleAddress);
}
