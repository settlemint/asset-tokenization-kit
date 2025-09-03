// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IATKSystemAccessManaged } from "./access-manager/IATKSystemAccessManaged.sol";

/// @title IATKSystem Interface
/// @author SettleMint
/// @notice This interface outlines the essential functions for interacting with the ATK Protocol's central system
/// contract.
/// @dev The ATK System contract serves as the main hub and discovery point for various modules and features within
/// the
/// ATK Protocol. It allows other contracts and external users to find the addresses of crucial components like
/// compliance modules, identity registries, and their corresponding proxy contracts. These proxies are important
/// because they enable these components to be upgraded in the future without altering the addresses that other parts
/// of the system use to interact with them, ensuring stability and maintainability.
interface IATKSystem is IERC165, IATKSystemAccessManaged {
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
    event SystemTrustedIssuersRegistryImplementationUpdated(address indexed sender, address indexed newImplementation);
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

    /// @notice Emitted when the implementation (logic contract) for the contract identity module is updated.
    /// @dev Contract identity contracts are identities associated with any contract implementing IContractWithIdentity.
    /// @param sender The address that called the `updateContractIdentityImplementation` function.
    /// @param newImplementation The address of the new contract identity module implementation contract.
    event ContractIdentityImplementationUpdated(address indexed sender, address indexed newImplementation);
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
    event SystemAddonRegistryImplementationUpdated(address indexed sender, address indexed newImplementation);

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
    /// @param systemTrustedIssuersRegistryProxy The address of the deployed ATKSystemTrustedIssuersRegistryProxy contract.
    /// @param trustedIssuersMetaRegistryProxy The address of the deployed ATKTrustedIssuersMetaRegistryProxy contract.
    /// @param topicSchemeRegistryProxy The address of the deployed ATKTopicSchemeRegistryProxy contract.
    /// @param identityFactoryProxy The address of the deployed ATKIdentityFactoryProxy contract.
    /// @param tokenFactoryRegistryProxy The address of the deployed ATKTokenFactoryRegistryProxy contract.
    /// @param systemAddonRegistryProxy The address of the deployed ATKSystemAddonRegistryProxy contract.
    /// @param complianceModuleRegistryProxy The address of the deployed ATKComplianceModuleRegistryProxy contract.
    /// @param organisationIdentity The address of the identity contract representing the organisation.
    event Bootstrapped(
        address indexed sender,
        address indexed complianceProxy,
        address indexed identityRegistryProxy,
        address identityRegistryStorageProxy,
        address systemTrustedIssuersRegistryProxy,
        address trustedIssuersMetaRegistryProxy,
        address topicSchemeRegistryProxy,
        address identityFactoryProxy,
        address tokenFactoryRegistryProxy,
        address systemAddonRegistryProxy,
        address complianceModuleRegistryProxy,
        address organisationIdentity
    );

    /// @notice Initializes the ATKSystem contract.
    /// @dev This function is responsible for the initial deployment and configuration of the ATK Protocol.
    /// This involves deploying necessary smart contracts, setting initial parameters, and defining the relationships
    /// and connections between different components of the system.
    /// It is critically important that this function is called only ONCE during the very first deployment of the
    /// protocol.
    /// @param initialAdmin_ The address of the initial administrator.
    /// @param accessManager_ The address of the access manager implementation.
    /// @param complianceImplementation_ The address of the compliance module implementation.
    /// @param identityRegistryImplementation_ The address of the identity registry module implementation.
    /// @param identityRegistryStorageImplementation_ The address of the identity registry storage module
    /// implementation.
    /// @param trustedIssuersRegistryImplementation_ The address of the trusted issuers registry module implementation.
    /// @param trustedIssuersMetaRegistryImplementation_ The address of the trusted issuers meta registry module
    /// implementation.
    /// @param topicSchemeRegistryImplementation_ The address of the topic scheme registry module implementation.
    /// @param identityFactoryImplementation_ The address of the identity factory module implementation.
    /// @param identityImplementation_ The address of the standard identity module implementation.
    /// @param contractIdentityImplementation_ The address of the contract identity module implementation.
    /// @param tokenAccessManagerImplementation_ The address of the token access manager module implementation.
    /// @param tokenFactoryRegistryImplementation_ The address of the token factory registry module implementation.
    /// @param complianceModuleRegistryImplementation_ The address of the compliance module registry module
    /// implementation.
    /// @param addonRegistryImplementation_ The address of the addon registry module implementation.

    function initialize(
        address initialAdmin_,
        address accessManager_,
        address complianceImplementation_,
        address identityRegistryImplementation_,
        address identityRegistryStorageImplementation_,
        address trustedIssuersRegistryImplementation_,
        address trustedIssuersMetaRegistryImplementation_,
        address topicSchemeRegistryImplementation_,
        address identityFactoryImplementation_,
        address identityImplementation_, // Expected to be IERC734/IIdentity compliant
        address contractIdentityImplementation_, // Expected to be IERC734/IIdentity compliant
        address tokenAccessManagerImplementation_, // Expected to be ISMARTTokenAccessManager compliant
        address tokenFactoryRegistryImplementation_,
        address complianceModuleRegistryImplementation_,
        address addonRegistryImplementation_
    )
        external;

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
    function compliance() external view returns (address complianceProxyAddress);

    /// @notice Retrieves the smart contract address of the proxy for the identity registry module.
    /// @dev Similar to the compliance proxy, this function returns the stable, unchanging address of the identity
    /// registry's proxy contract.
    /// To interact with the identity registry (e.g., to query identity information or register a new identity,
    /// depending on its features), you should use this proxy address. It will automatically forward your requests
    /// to the current logic implementation contract.
    /// @return identityRegistryProxyAddress The blockchain address of the identity registry module's proxy contract.
    function identityRegistry() external view returns (address identityRegistryProxyAddress);

    /// @notice Retrieves the smart contract address of the proxy for the identity registry storage module.
    /// @dev This function returns the stable, unchanging address of the identity registry storage's proxy contract.
    /// All interactions related to storing or retrieving identity data should go through this proxy address.
    /// It ensures that calls are directed to the current logic implementation for identity data management.
    /// @return identityRegistryStorageProxyAddress The blockchain address of the identity registry storage module's
    /// proxy contract.
    function identityRegistryStorage() external view returns (address identityRegistryStorageProxyAddress);

    /// @notice Retrieves the smart contract address of the proxy for the trusted issuers meta registry module.
    /// @dev This function returns the stable, unchanging address of the trusted issuers meta registry's proxy contract.
    /// The meta registry manages both global and contract-specific trusted issuers registries, providing a
    /// registry-of-registries pattern for efficient trusted issuer management across the system.
    /// @return trustedIssuersRegistry The blockchain address of the trusted issuers meta registry
    /// module's proxy.
    function trustedIssuersRegistry() external view returns (address trustedIssuersRegistry);

    /// @notice Retrieves the smart contract address of the proxy for the identity factory module.
    /// @dev This function returns the stable, unchanging address of the identity factory's proxy contract.
    /// To create new identities within the ATK Protocol, you should interact with this proxy address.
    /// It will delegate the identity creation requests to the current active logic implementation of the
    /// identity factory.
    /// @return identityFactoryProxyAddress The blockchain address of the identity factory module's proxy contract.
    function identityFactory() external view returns (address identityFactoryProxyAddress);

    /// @notice Retrieves the smart contract address of the proxy for the topic scheme registry module.
    /// @dev This function returns the stable, unchanging address of the topic scheme registry's proxy contract.
    /// To interact with the topic scheme registry (e.g., to register topic schemes or retrieve topic signatures),
    /// you should use this proxy address. It will forward calls to the current logic implementation.
    /// @return topicSchemeRegistryProxyAddress The blockchain address of the topic scheme registry module's proxy.
    function topicSchemeRegistry() external view returns (address topicSchemeRegistryProxyAddress);

    /// @notice Returns the address of the token factory registry.
    /// @return The address of the token factory registry contract.
    function tokenFactoryRegistry() external view returns (address);

    /// @notice Returns the address of the system addon registry.
    /// @return The address of the system addon registry contract.
    function systemAddonRegistry() external view returns (address);

    /// @notice Returns the address of the compliance module registry.
    /// @return The address of the compliance module registry contract.
    function complianceModuleRegistry() external view returns (address);

    /// @notice Returns the address of the identity implementation.
    /// @return The address of the identity implementation contract.
    function identityImplementation() external view returns (address);

    /// @notice Returns the address of the contract identity implementation.
    /// @return The address of the contract identity implementation contract.
    function contractIdentityImplementation() external view returns (address);

    /// @notice Returns the address of the token access manager implementation.
    /// @return The address of the token access manager implementation contract.
    function tokenAccessManagerImplementation() external view returns (address);

    /// @notice Returns the address of the token issuer identity contract.
    /// @return The address of the token issuer identity contract.
    function organisationIdentity() external view returns (address);

    /// @notice Issues a claim by the organisation identity to a target identity
    /// @dev Only callable by accounts with TOKEN_FACTORY_MODULE_ROLE or ISSUER_CLAIM_MANAGER_ROLE
    /// @param targetIdentity The identity contract to receive the claim
    /// @param topicId The topic ID of the claim
    /// @param claimData The claim data
    function issueClaimByOrganisation(address targetIdentity, uint256 topicId, bytes memory claimData) external;
}
