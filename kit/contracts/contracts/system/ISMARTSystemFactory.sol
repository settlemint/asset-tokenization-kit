// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title ISMARTSystemFactory
/// @author SettleMint Tokenization Services
/// @notice Interface for the SMARTSystemFactory contract that deploys new instances of the SMARTSystem contract.
/// @dev This interface defines all public functions, events, and state variables for the SMARTSystemFactory.
/// It supports meta-transactions through ERC2771Context and tracks all deployed SMARTSystem instances.
interface ISMARTSystemFactory {
    // --- Events ---

    /// @notice Emitted when a new `SMARTSystem` instance is successfully created and deployed by this factory.
    /// @param sender The address that called the `createSystem` function.
    /// @param systemAddress The blockchain address of the newly deployed `SMARTSystem` contract.
    event SMARTSystemCreated(address indexed sender, address indexed systemAddress);

    // --- View Functions ---

    /// @notice The default contract address for the compliance module's logic (implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial compliance
    /// implementation.
    /// @return address The default compliance implementation address.
    function defaultComplianceImplementation() external view returns (address);

    /// @notice The default contract address for the identity registry module's logic (implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial identity registry
    /// implementation.
    /// @return address The default identity registry implementation address.
    function defaultIdentityRegistryImplementation() external view returns (address);

    /// @notice The default contract address for the identity registry storage module's logic (implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial identity registry
    /// storage implementation.
    /// @return address The default identity registry storage implementation address.
    function defaultIdentityRegistryStorageImplementation() external view returns (address);

    /// @notice The default contract address for the trusted issuers registry module's logic (implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial trusted issuers
    /// registry implementation.
    /// @return address The default trusted issuers registry implementation address.
    function defaultTrustedIssuersRegistryImplementation() external view returns (address);

    /// @notice The default contract address for the topic scheme registry module's logic (implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial topic scheme
    /// registry implementation.
    /// @return address The default topic scheme registry implementation address.
    function defaultTopicSchemeRegistryImplementation() external view returns (address);

    /// @notice The default contract address for the identity factory module's logic (implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial identity factory
    /// implementation.
    /// @return address The default identity factory implementation address.
    function defaultIdentityFactoryImplementation() external view returns (address);

    /// @notice The default contract address for the standard identity contract's logic (template/implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial standard identity
    /// implementation.
    /// @return address The default identity implementation address.
    function defaultIdentityImplementation() external view returns (address);

    /// @notice The default contract address for the token identity contract's logic (template/implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial token identity
    /// implementation.
    /// @return address The default token identity implementation address.
    function defaultTokenIdentityImplementation() external view returns (address);

    /// @notice The default contract address for the token access manager contract's logic (implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial token access manager
    /// implementation.
    /// @return address The default token access manager implementation address.
    function defaultTokenAccessManagerImplementation() external view returns (address);

    /// @notice The address of the trusted forwarder contract used by this factory for meta-transactions (ERC2771).
    /// @dev This same forwarder address will also be passed to each new `SMARTSystem` instance created by this factory,
    /// enabling them to support meta-transactions as well.
    /// @return address The factory forwarder address.
    function factoryForwarder() external view returns (address);

    /// @notice Gets the address of a `SMARTSystem` instance at a specific index in the list of created systems.
    /// @dev This allows retrieval of addresses for previously deployed `SMARTSystem` contracts.
    /// @param index The zero-based index of the desired `SMARTSystem` in the `smartSystems` array.
    /// @return address The blockchain address of the `SMARTSystem` contract found at the given `index`.
    function smartSystems(uint256 index) external view returns (address);

    /// @notice Gets the total number of `SMARTSystem` instances that have been created by this factory.
    /// @dev This is a view function, meaning it only reads blockchain state and does not cost gas to call (if called
    /// externally, not in a transaction).
    /// @return uint256 The count of `SMARTSystem` instances currently stored in the `smartSystems` array.
    function getSystemCount() external view returns (uint256);

    /// @notice Gets the blockchain address of a `SMARTSystem` instance at a specific index in the list of created
    /// systems.
    /// @dev This allows retrieval of addresses for previously deployed `SMARTSystem` contracts.
    /// It will revert with an `IndexOutOfBounds` error if the provided `index` is greater than or equal to the
    /// current number of created systems (i.e., if `index >= smartSystems.length`).
    /// This is a view function.
    /// @param index The zero-based index of the desired `SMARTSystem` in the `smartSystems` array.
    /// @return address The blockchain address of the `SMARTSystem` contract found at the given `index`.
    function getSystemAtIndex(uint256 index) external view returns (address);

    // --- External Functions ---

    /// @notice Creates and deploys a new `SMARTSystem` instance using the factory's stored default implementation
    /// addresses.
    /// @dev When this function is called, a new `SMARTSystem` contract is created on the blockchain.
    /// The caller of this function (which is `_msgSender()`, resolving to the original user in an ERC2771
    /// meta-transaction context)
    /// will be set as the initial administrator (granted `DEFAULT_ADMIN_ROLE`) of the newly created `SMARTSystem`.
    /// The new system's address is added to the `smartSystems` array for tracking, and a `SMARTSystemCreated` event is
    /// emitted.
    /// @return systemAddress The blockchain address of the newly created `SMARTSystem` contract.
    function createSystem() external returns (address systemAddress);
}
