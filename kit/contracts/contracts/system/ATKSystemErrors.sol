// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

/// @notice Error indicating that a zero address was provided where a non-zero address is required.
/// @dev This error is thrown when a function expects a non-zero address but receives the zero address instead.
error ZeroAddressNotAllowed();

/// @notice Error indicating that an invalid system address was provided or encountered.
/// @dev This typically means an address expected to be a core system component (like a module proxy or implementation)
/// was found to be the zero address or an otherwise incorrect address during a critical operation.
error InvalidSystemAddress();

/// @notice Error indicating that a system initialization process failed.
/// @dev This could occur during the `bootstrap` phase of the `SMARTSystem` or during the constructor execution
/// of a critical component if a required setup step could not be completed successfully.
error InitializationFailed();

/// @notice Error indicating that an action is being attempted on a system that has not been bootstrapped yet.
/// @dev This is thrown when a function requires core proxy contracts to be deployed, but they haven't been.
error SystemNotBootstrapped();

/// @notice Error indicating that the system has already been bootstrapped and cannot be bootstrapped again.
/// @dev This error is thrown if the `bootstrap` function is called when the system proxy contracts have already
/// been deployed and initialized.
error SystemAlreadyBootstrapped();

/// @notice Error indicating that the compliance module implementation address has not been set.
/// @dev This error is thrown if an operation requires the compliance module, but its logic contract address is
/// zero or has not been configured in the `SMARTSystem`.
error ComplianceImplementationNotSet();

/// @notice Error indicating that the identity registry implementation address has not been set.
/// @dev This error is thrown if an operation requires the identity registry, but its logic contract address is
/// zero or has not been configured in the `SMARTSystem`.
error IdentityRegistryImplementationNotSet();

/// @notice Error indicating that the identity registry storage implementation address has not been set.
/// @dev This error is thrown if an operation requires the identity registry storage, but its logic contract address is
/// zero or has not been configured in the `SMARTSystem`.
error IdentityRegistryStorageImplementationNotSet();

/// @notice Error indicating that the trusted issuers registry implementation address has not been set.
/// @dev This error is thrown if an operation requires the trusted issuers registry, but its logic contract address is
/// zero or has not been configured in the `SMARTSystem`.
error TrustedIssuersRegistryImplementationNotSet();

/// @notice Error indicating that the trusted issuers meta registry implementation address has not been set.
/// @dev This error is thrown if an operation requires the trusted issuers meta registry, but its logic contract address is
/// zero or has not been configured in the `SMARTSystem`.
error TrustedIssuersMetaRegistryImplementationNotSet();

/// @notice Error indicating that the topic scheme registry implementation address has not been set.
/// @dev This error is thrown if an operation requires the topic scheme registry, but its logic contract address is
/// zero or has not been configured in the `SMARTSystem`.
error TopicSchemeRegistryImplementationNotSet();

/// @notice Error indicating that the identity factory implementation address has not been set.
/// @dev This error is thrown if an operation requires the identity factory, but its logic contract address is
/// zero or has not been configured in the `SMARTSystem`.
error IdentityFactoryImplementationNotSet();

/// @notice Error indicating that the standard identity contract implementation address has not been set.
/// @dev This error is thrown if an operation requires the standard identity implementation (the template for user
/// identities), but its logic contract address is zero or has not been configured in the `SMARTSystem`.
error IdentityImplementationNotSet();

/// @notice Error indicating that the contract identity implementation address has not been set.
/// @dev This error is thrown if an operation requires the contract identity implementation (the template for
/// identities associated with contracts implementing IContractWithIdentity), but its logic contract address is
/// zero or has not been configured in the `SMARTSystem`.
error ContractIdentityImplementationNotSet();

/// @notice Error indicating that the token access manager contract implementation address has not been set.
/// @dev This error is thrown if an operation requires the token access manager implementation, but its logic
/// contract address is zero or has not been configured in the `SMARTSystem`.
error TokenAccessManagerImplementationNotSet();

/// @notice Error indicating that the system addon implementation address has not been set.
/// @dev This error is thrown if an operation requires the system addon implementation, but its logic contract address
/// is zero or has not been configured in the `SMARTSystem`.
error SystemAddonImplementationNotSet(bytes32 addonTypeHash);

/// @notice Error indicating that an index provided for accessing an array or list is out of its valid range.
/// @dev For example, trying to access the 5th element in an array that only has 3 elements.
/// @param index The invalid index that was attempted to be accessed.
/// @param length The actual length or size of the array/list.
error IndexOutOfBounds(uint256 index, uint256 length);

/// @notice Error indicating that an attempt was made to send Ether to a contract that does not allow or expect it.
/// @dev Many contracts are not designed to receive or hold Ether directly, and will revert such transactions to prevent
/// loss of funds or unexpected behavior.
error ETHTransfersNotAllowed();

/// @notice Error indicating that a provided implementation address does not support a required interface.
/// @dev When setting implementation addresses for modules (e.g., compliance, identity registry), the `SMARTSystem`
/// checks if these implementations adhere to specific standard interfaces (like `IERC165` and the module-specific
/// interface). If this check fails, this error is thrown.
/// @param implAddress The address of the implementation contract that failed the interface check.
/// @param interfaceId The bytes4 identifier of the interface that the `implAddress` was expected to support.
error InvalidImplementationInterface(address implAddress, bytes4 interfaceId);

/// @notice Error indicating that an invalid token factory address was provided.
error InvalidTokenFactoryAddress();

/// @notice Error indicating that the token factory implementation address has not been set.
error TokenFactoryImplementationNotSet(bytes32 registryTypeHash);

/// @notice Error indicating that a token factory type hash has already been registered.
error TokenFactoryTypeAlreadyRegistered(string typeName);

/// @notice Error indicating that a system addon type hash has already been registered.
error SystemAddonTypeAlreadyRegistered(string typeName);

/// @notice Error indicating that a compliance module has already been registered with the given name.
/// @param name The name of the compliance module that was already registered.
error ComplianceModuleAlreadyRegistered(string name);

/// @notice Error indicating that an invalid compliance module address was provided.
error InvalidComplianceModuleAddress();

/// @notice Error indicating that the token implementation address has not been set.
error TokenImplementationNotSet();

/// @notice Error indicating that an invalid token implementation address was provided.
error InvalidTokenImplementationAddress();

/// @notice Error indicating that an invalid addon address was provided.
error InvalidAddonAddress();

/// @notice Error indicating that an invalid token implementation interface was provided.
error InvalidTokenImplementationInterface();

/// @notice Error indicating that an attempt was made to initialize a component with a zero address for its
/// implementation.
/// @dev This typically occurs in proxy constructors if the logic contract address fetched from the system is
/// address(0).
error InitializationWithZeroAddress();

/// @notice Error indicating that an invalid ATKSystem implementation address was provided.
/// @dev This error is thrown if the ATKSystem implementation address is the zero address.
error InvalidSystemImplementation();

/// @notice Error indicating that the compliance module registry implementation address has not been set.
/// @dev This error is thrown if an operation requires the compliance module registry, but its logic contract address is
/// zero or has not been configured in the `SMARTSystem`.
error ComplianceModuleRegistryImplementationNotSet();

/// @notice Error indicating that the addon registry implementation address has not been set.
/// @dev This error is thrown if an operation requires the addon registry, but its logic contract address is
/// zero or has not been configured in the `SMARTSystem`.
error AddonRegistryImplementationNotSet();

/// @notice Error indicating that the token factory registry implementation address has not been set.
/// @dev This error is thrown if an operation requires the token factory registry, but its logic contract address is
/// zero or has not been configured in the `SMARTSystem`.
error TokenFactoryRegistryImplementationNotSet();

/// @notice Error indicating that the component implementation address has not been set.
/// @dev This error is thrown if an operation requires the component implementation, but its logic contract address is
/// zero or has not been configured in the `SMARTSystem`.
error ComponentImplementationNotSet(bytes32 componentTypeHash);

/// @notice Error indicating that the system access manager implementation address has not been set.
/// @dev This error is thrown if an operation requires the system access manager implementation, but its logic contract
/// address is
/// zero or has not been configured in the `SMARTSystem`.
error SystemAccessManagerImplementationNotSet();

/// @notice Error indicating that the issuer identity has not been initialized.
/// @dev This error is thrown if an operation requires the issuer identity, but it has not been created during
/// bootstrap.
error IssuerIdentityNotInitialized();

/// @notice Error indicating that an invalid target identity address was provided for claim operations.
/// @dev This error is thrown when trying to issue a claim to a zero address or invalid identity contract.
error InvalidTargetIdentity();
