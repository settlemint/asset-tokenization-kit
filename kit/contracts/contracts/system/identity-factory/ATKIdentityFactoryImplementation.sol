// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

// Interface imports
import { IERC734 } from "@onchainid/contracts/interface/IERC734.sol";
import { IATKIdentityFactory } from "./IATKIdentityFactory.sol";
import { IATKIdentity } from "./identities/IATKIdentity.sol";
import { IATKContractIdentity } from "./identities/IATKContractIdentity.sol";
import { IContractWithIdentity } from "./IContractWithIdentity.sol";
import { ERC734KeyPurposes } from "../../onchainid/ERC734KeyPurposes.sol";
import { ERC734KeyTypes } from "../../onchainid/ERC734KeyTypes.sol";
import { IATKTopicSchemeRegistry } from "../topic-scheme-registry/IATKTopicSchemeRegistry.sol";
import { ATKTopics } from "../ATKTopics.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

// System imports
import { InvalidSystemAddress } from "../ATKSystemErrors.sol"; // Assuming this is correctly placed
import { IATKSystem } from "../IATKSystem.sol";

// Implementation imports
import { ATKIdentityProxy } from "./identities/ATKIdentityProxy.sol";
import { ATKContractIdentityProxy } from "./identities/ATKContractIdentityProxy.sol";

/// @title ATK Identity Factory Implementation
/// @author SettleMint
/// @notice This contract is the upgradeable logic implementation for creating and managing on-chain identities
///         for both user wallets and contracts within the ATK Protocol.
/// @dev It leverages OpenZeppelin's `Create2` library to deploy identity proxy contracts (`ATKIdentityProxy` for
/// wallets,
///      `ATKContractIdentityProxy` for contracts) at deterministic addresses. These proxies point to logic
/// implementations
///      whose addresses are provided by the central `IATKSystem` contract, enabling upgradeability of the identity
/// logic.
///      The factory is `ERC2771ContextUpgradeable` for meta-transaction support.
///      The identities created are based on the ERC725 (OnchainID) standard, managed via ERC734 for key management.
contract ATKIdentityFactoryImplementation is
    Initializable,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    IATKIdentityFactory,
    IContractWithIdentity
{
    // Custom errors
    error OnlySystemCanSetOnchainID();
    error OnchainIDAlreadySet();
    error InvalidIdentityAddress();
    // --- Constants ---
    /// @notice Prefix used in salt calculation for creating contract identities to ensure unique salt generation.
    /// @dev For example, salt might be `keccak256(abi.encodePacked("Contract", <contractAddressHex>))`.

    string public constant CONTRACT_SALT_PREFIX = "Contract";
    /// @notice Prefix used in salt calculation for creating wallet identities to ensure unique salt generation.
    /// @dev For example, salt might be `keccak256(abi.encodePacked("OID", <walletAddressHex>))` (OID stands for
    /// OnchainID).
    string public constant WALLET_SALT_PREFIX = "OID";

    // --- Storage Variables ---
    /// @notice The address of the `IATKSystem` contract.
    /// @dev This system contract provides the addresses of the current logic implementations for `ATKIdentity`
    ///      and `ATKContractIdentity` contracts that the deployed proxies will point to.
    address private _system;

    /// @notice Mapping to track whether a specific salt (represented as `bytes32`) has already been used for a CREATE2
    /// deployment by this factory.
    /// @dev This prevents deploying multiple contracts at the same deterministic address, which would fail or
    /// overwrite.
    /// `bytes32` is used as the key for gas efficiency compared to `string`.
    mapping(bytes32 byteSalt => bool isTaken) private _saltTakenByteSalt;
    /// @notice Mapping from an investor's wallet address to the address of its deployed `ATKIdentityProxy` contract.
    /// @dev This allows for quick lookup of an existing identity for a given wallet.
    mapping(address wallet => address identityProxy) private _identities;
    /// @notice Mapping from a contract's address to the address of its deployed identity proxy contract.
    /// @dev This allows for quick lookup of an existing identity for a given contract.
    mapping(address contractAddress => address identityProxy) private _contractIdentities;

    /// @notice The address of the identity factory's own OnChain ID.
    /// @dev This is set after bootstrap when the factory creates its own identity.
    address private _onchainID;

    // --- Errors ---
    /// @notice Indicates that an operation was attempted with the zero address (address(0))
    ///         where a valid, non-zero address was expected (e.g., for a wallet or contract owner).
    error ZeroAddressNotAllowed();
    /// @notice Indicates that a deterministic deployment (CREATE2) was attempted with a salt that has already been
    /// used.
    /// @param salt The string representation of the salt that was already taken.
    /// @dev Salts must be unique for each CREATE2 deployment from the same factory to ensure unique addresses.
    error SaltAlreadyTaken(string salt);
    /// @notice Indicates an attempt to create an identity for a wallet that already has one linked in this factory.
    /// @param wallet The address of the wallet that is already linked to an identity.
    error WalletAlreadyLinked(address wallet);
    /// @notice Indicates that a wallet address was found within the list of management keys being added to its own
    /// identity.
    /// @dev An identity's own wallet address (if it represents a user) typically has management capabilities by default
    /// or
    /// through specific key types;
    /// explicitly adding it as a generic management key might be redundant or an error.
    error WalletInManagementKeys();
    /// @notice Indicates an attempt to create an identity for a contract that already has one linked in this factory.
    /// @param contractAddress The address of the contract that is already linked to an identity.
    error ContractAlreadyLinked(address contractAddress);
    /// @notice Indicates that the address deployed via CREATE2 does not match the pre-calculated predicted address.
    /// @dev This is a critical error suggesting a potential issue in the CREATE2 computation, salt, or deployment
    /// bytecode,
    /// or an unexpected change in blockchain state between prediction and deployment.
    error DeploymentAddressMismatch();
    /// @notice Indicates that the identity implementation is invalid.
    error InvalidIdentityImplementation();
    /// @notice Indicates that the contract identity implementation is invalid.
    error InvalidContractIdentityImplementation();
    /// @notice Indicates that the contract does not implement the required IContractWithIdentity interface.
    /// @param contractAddress The address of the contract that is missing the required interface.
    error ContractMissingIdentityInterface(address contractAddress);

    // --- Events ---

    // --- Constructor ---
    /// @notice Constructor for the identity factory implementation.
    /// @dev This is part of OpenZeppelin's upgradeable contracts pattern.
    /// It initializes `ERC2771ContextUpgradeable` with the `trustedForwarder` address for meta-transactions.
    /// `_disableInitializers()` prevents the `initialize` function from being called on the implementation contract
    /// directly,
    /// reserving it for the proxy context during deployment or upgrade.
    /// @param trustedForwarder The address of the ERC-2771 trusted forwarder for gasless transactions.
    /// @custom:oz-upgrades-unsafe-allow constructor Required by OpenZeppelin Upgrades plugins for upgradeable
    /// contracts.
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    // --- Initializer ---
    /// @notice Initializes the `ATKIdentityFactoryImplementation` contract, typically called once by the proxy after
    /// deployment.
    /// @dev Sets up essential state for the factory:
    /// 1. Validates that `systemAddress` is not the zero address.
    /// 2. Initializes ERC165 for interface detection.
    /// 3. Stores the `systemAddress` which provides identity logic implementations.
    /// @param systemAddress The address of the central `IATKSystem` contract. This contract is crucial as it dictates
    ///                      which identity logic implementation contracts the new identity proxies will point to.
    /// @dev The `initializer` modifier ensures this function can only be called once.
    function initialize(address systemAddress) public virtual initializer {
        if (systemAddress == address(0)) revert InvalidSystemAddress();

        __ERC165_init_unchained();

        // Extract to separate variables to reduce stack depth
        address identityImpl = IATKSystem(systemAddress).identityImplementation();
        address contractIdentityImpl = IATKSystem(systemAddress).contractIdentityImplementation();

        // Separate the interface checks
        _validateIdentityImplementation(identityImpl);
        _validateContractIdentityImplementation(contractIdentityImpl);

        _system = systemAddress;
    }

    /// @notice Validates that a contract implements the IATKIdentity interface
    /// @dev Helper function to validate identity implementation interface
    /// @param identityImpl The address of the implementation to validate
    function _validateIdentityImplementation(address identityImpl) private view {
        if (!IERC165(identityImpl).supportsInterface(type(IATKIdentity).interfaceId)) {
            revert InvalidIdentityImplementation();
        }
    }

    /// @notice Validates that a contract implements the IATKContractIdentity interface
    /// @dev Helper function to validate contract identity implementation interface
    /// @param contractIdentityImpl The address of the implementation to validate
    function _validateContractIdentityImplementation(address contractIdentityImpl) private view {
        if (!IERC165(contractIdentityImpl).supportsInterface(type(IATKContractIdentity).interfaceId)) {
            revert InvalidContractIdentityImplementation();
        }
    }

    // --- State-Changing Functions ---

    /// @inheritdoc IATKIdentityFactory
    /// @notice Creates a deterministic on-chain identity (a `ATKIdentityProxy`) for a given investor wallet address.
    /// @dev This function performs several steps:
    /// 1. Validates that `_wallet` is not the zero address and that an identity doesn't already exist for this wallet.
    /// 2. Calls `_createAndRegisterWalletIdentity` to handle the deterministic deployment of the `ATKIdentityProxy`.
    ///    The `_wallet` itself is passed as the `_initialManager` to the proxy constructor, and claim authorization
    ///    contracts (including the trusted issuers registry) are automatically registered during initialization.
    /// 3. Interacts with the newly deployed identity contract (as `IERC734`) to add any additional `_managementKeys`
    /// provided.
    ///    It ensures a management key is not the wallet itself (which is already a manager).
    /// 4. Stores the mapping from the `_wallet` address to the new `identity` contract address.
    /// 5. Emits an `IdentityCreated` event.
    /// @param _wallet The investor wallet address for which the identity is being created. This address will also be
    /// set as an initial manager of the identity.
    /// @param _managementKeys An array of `bytes32` values representing additional management keys (keccak256 hashes of
    /// public keys or addresses) to be added to the identity.
    ///                        These keys are granted `MANAGEMENT_KEY` purpose (purpose 1) according to ERC734.
    /// @return address The address of the newly created and registered `ATKIdentityProxy` contract.
    function createIdentity(address _wallet, bytes32[] calldata _managementKeys)
        external
        virtual
        override
        returns (
            address // Solidity style guide prefers no name for return in implementation if clear from Natspec
        )
    {
        if (_wallet == address(0)) revert ZeroAddressNotAllowed();
        if (_identities[_wallet] != address(0)) revert WalletAlreadyLinked(_wallet);

        // Deploy identity with _wallet as the initial management key passed to proxy constructor
        address identity = _createWalletIdentity(_wallet, _wallet);
        IERC734 identityContract = IERC734(identity);

        // Add specified management keys
        if (_managementKeys.length > 0) {
            uint256 managementKeysLength = _managementKeys.length;
            for (uint256 i = 0; i < managementKeysLength;) {
                // Prevent adding the wallet's own key again if it was passed in _managementKeys
                if (_managementKeys[i] == keccak256(abi.encodePacked(_wallet))) revert WalletInManagementKeys();
                identityContract.addKey(_managementKeys[i], ERC734KeyPurposes.MANAGEMENT_KEY, ERC734KeyTypes.ECDSA);
                unchecked {
                    ++i;
                }
            }
        }

        _identities[_wallet] = identity;
        emit IdentityCreated(_msgSender(), identity, _wallet);
        return identity;
    }

    /// @inheritdoc IATKIdentityFactory
    /// @notice Creates a deterministic on-chain identity for a given contract implementing IContractWithIdentity.
    /// @dev This function performs several steps:
    /// 1. Validates that `_contract` is not zero address and that an identity doesn't already exist for this contract.
    /// 2. Verifies the contract implements IContractWithIdentity interface.
    /// 3. Calls `_createAndRegisterContractIdentity` to handle the deterministic deployment. Claim authorization
    ///    contracts (including the trusted issuers registry) are automatically registered during initialization.
    /// 4. Stores the mapping from the `_contract` address to the new `identity` contract address.
    /// 5. Emits `ContractIdentityCreated` event.
    /// @param _contract The address of the contract implementing IContractWithIdentity for which the identity is being
    /// created.
    /// @return address The address of the newly created identity contract.
    function createContractIdentity(address _contract) external virtual override returns (address) {
        if (_contract == address(0)) revert ZeroAddressNotAllowed();
        if (_contractIdentities[_contract] != address(0)) revert ContractAlreadyLinked(_contract);

        // Verify that the contract implements IContractWithIdentity
        if (!IERC165(_contract).supportsInterface(type(IContractWithIdentity).interfaceId)) {
            revert ContractMissingIdentityInterface(_contract);
        }

        // Deploy identity with address-based salt
        address identity = _createContractIdentity(_contract);

        _contractIdentities[_contract] = identity;
        emit ContractIdentityCreated(_msgSender(), identity, _contract);

        // Issue a CONTRACT_IDENTITY claim if the factory has its own identity
        if (_onchainID != address(0)) {
            _issueContractIdentityClaim(identity, _contract);
        }

        return identity;
    }

    // --- View Functions ---

    /// @inheritdoc IATKIdentityFactory
    /// @notice Retrieves the deployed `ATKIdentityProxy` address associated with a given investor wallet.
    /// @param _wallet The investor wallet address to query.
    /// @return address The address of the `ATKIdentityProxy` if one has been created for the `_wallet`, otherwise
    /// `address(0)`.
    function getIdentity(address _wallet) external view virtual override returns (address) {
        return _identities[_wallet];
    }

    /// @inheritdoc IATKIdentityFactory
    /// @notice Retrieves the deployed identity proxy address associated with a given contract.
    /// @param _contract The contract address to query.
    /// @return address The address of the identity proxy if one has been created for the `_contract`, otherwise
    /// `address(0)`.
    function getContractIdentity(address _contract) external view virtual override returns (address) {
        return _contractIdentities[_contract];
    }

    /// @inheritdoc IATKIdentityFactory
    /// @notice Computes the deterministic address at which a `ATKIdentityProxy` for an investor wallet will be
    /// deployed (or was deployed).
    /// @dev This function uses the `CREATE2` address calculation logic. It first calculates a unique salt using
    ///      the `WALLET_SALT_PREFIX` and the `_walletAddress`. Then, it calls `_computeWalletProxyAddress` with this
    /// salt
    ///      and the `_initialManager` (which is part of the proxy's constructor arguments, affecting its creation code
    /// hash).
    ///      The claim authorization contracts array (containing the trusted issuers registry) is retrieved from the
    /// system for address calculation.
    ///      This allows prediction of the identity address before actual deployment.
    /// @param _walletAddress The investor wallet address for which to calculate the potential identity contract
    /// address.
    /// @param _initialManager The address that would be (or was) set as the initial management key for the identity's
    /// proxy constructor.
    /// @return address The pre-computed CREATE2 deployment address for the wallet's identity contract.
    function calculateWalletIdentityAddress(address _walletAddress, address _initialManager)
        public
        view
        virtual
        override
        returns (address)
    {
        (bytes32 saltBytes,) = _calculateSalt(WALLET_SALT_PREFIX, _walletAddress);
        return _computeWalletProxyAddress(saltBytes, _initialManager);
    }

    /// @inheritdoc IATKIdentityFactory
    /// @notice Computes the deterministic address at which an identity proxy for a contract will be
    /// deployed (or was deployed) using address-based salt.
    /// @dev Uses the contract address to calculate a deterministic salt for deployment address prediction.
    ///      This provides predictable addresses based on the contract address.
    /// @param _contractAddress The address of the contract for which the identity will be created.
    /// @return address The pre-computed CREATE2 deployment address for the contract's identity contract.
    function calculateContractIdentityAddress(address _contractAddress) public view virtual override returns (address) {
        (bytes32 saltBytes,) = _calculateSalt(CONTRACT_SALT_PREFIX, _contractAddress);
        return _computeContractProxyAddress(saltBytes, _contractAddress);
    }

    /// @notice Returns the address of the `IATKSystem` contract that this factory uses.
    /// @dev The `IATKSystem` contract provides the addresses for the actual logic implementations
    ///      of `ATKIdentity` and `ATKContractIdentity` that the deployed proxies will delegate to.
    /// @return address The address of the configured `IATKSystem` contract.
    function getSystem() external view returns (address) {
        return _system;
    }

    // --- Internal Functions ---

    /// @notice Internal function to handle the creation and registration of a wallet identity.
    /// @dev Calculates a unique salt for the `_walletAddress`, checks if the salt has been taken, deploys
    ///      the `ATKIdentityProxy` using `_deployWalletProxy`, and marks the salt as taken.
    /// @param _walletAddress The address of the wallet for which to create an identity.
    /// @param _initialManagerAddress The address to be set as the initial management key in the proxy's constructor.
    /// @return address The address of the newly deployed `ATKIdentityProxy`.
    function _createWalletIdentity(address _walletAddress, address _initialManagerAddress) private returns (address) {
        (bytes32 saltBytes, string memory saltString) = _calculateSalt(WALLET_SALT_PREFIX, _walletAddress);

        if (_saltTakenByteSalt[saltBytes]) revert SaltAlreadyTaken(saltString);

        address identity = _deployWalletProxy(saltBytes, _initialManagerAddress);

        _saltTakenByteSalt[saltBytes] = true;
        return identity;
    }

    /// @notice Internal function to handle the creation and registration of a contract identity using address-based
    /// salt.
    /// @dev Uses the contract address to calculate a unique deployment salt,
    ///      checks if the salt has been taken, deploys the identity proxy using `_deployContractProxy`, and
    /// marks the salt as taken.
    /// @param _contractAddress The address of the contract (must implement IContractWithIdentity) for which to create
    /// an identity.
    /// @return address The address of the newly deployed identity proxy.
    function _createContractIdentity(address _contractAddress) private returns (address) {
        (bytes32 saltBytes, string memory saltString) = _calculateSalt(CONTRACT_SALT_PREFIX, _contractAddress);

        if (_saltTakenByteSalt[saltBytes]) revert SaltAlreadyTaken(saltString);

        address identity = _deployContractProxy(saltBytes, _contractAddress);

        _saltTakenByteSalt[saltBytes] = true;
        return identity;
    }

    /// @notice Calculates a deterministic salt for CREATE2 deployment based on a prefix and an address.
    /// @dev Concatenates the `_saltPrefix` (e.g., "OID" or "Contract") with the hexadecimal string representation
    ///      of the `_address`. The result is then keccak256 hashed to produce the `bytes32` salt.
    ///      This ensures that for the same prefix and address, the salt is always the same.
    /// @param _saltPrefix A string prefix to ensure salt uniqueness across different types of identities (e.g., "OID"
    /// for wallets, "Contract" for contracts).
    /// @param _address The address (wallet or contract) to incorporate into the salt.
    /// @return saltBytes The calculated `bytes32` salt value.
    /// @return saltString The string representation of the salt before hashing (prefix + hexAddress), useful for error
    /// messages.
    function _calculateSalt(string memory _saltPrefix, address _address)
        internal
        view
        returns (bytes32 saltBytes, string memory saltString)
    {
        saltString = string.concat(_saltPrefix, Strings.toHexString(_address));
        saltBytes = _calculateSaltFromString(_system, saltString);
        // No explicit return needed due to named return variables
    }

    /// @notice Internal helper to calculate salt with system address prefix.
    /// @dev Ensures consistent salt generation with system address scoping.
    /// @param systemAddress The system address to prevent cross-system collisions.
    /// @param saltString The string to be used for salt calculation.
    /// @return The calculated salt for CREATE2 deployment.
    function _calculateSaltFromString(address systemAddress, string memory saltString) internal pure returns (bytes32) {
        return keccak256(abi.encode(systemAddress, saltString));
    }

    /// @notice Internal view function to compute the CREATE2 address for a `ATKIdentityProxy` (for wallets).
    /// @dev It retrieves the proxy's creation bytecode and constructor arguments (which include the `_initialManager`
    /// and `_system` address)
    ///      and then uses `Create2.computeAddress` with the provided `_saltBytes`.
    /// @param _saltBytes The pre-calculated `bytes32` salt for the deployment.
    /// @param _initialManager The address that will be passed as the initial manager to the proxy's constructor.
    /// @return address The deterministically computed address where the proxy will be deployed.
    function _computeWalletProxyAddress(bytes32 _saltBytes, address _initialManager) internal view returns (address) {
        (bytes memory proxyBytecode, bytes memory constructorArgs) = _getWalletProxyAndConstructorArgs(_initialManager);
        // slither-disable-next-line encode-packed-collision
        return Create2.computeAddress(_saltBytes, keccak256(abi.encodePacked(proxyBytecode, constructorArgs)));
    }

    /// @notice Internal view function to compute the CREATE2 address for a `ATKContractIdentityProxy`.
    /// @dev Similar to `_computeWalletProxyAddress` but for contract identities, using
    /// `_getContractProxyAndConstructorArgs`.
    /// @param _saltBytes The pre-calculated `bytes32` salt for the deployment.
    /// @param _contractAddress The address of the contract that will own this identity.
    /// @return address The deterministically computed address where the proxy will be deployed.
    function _computeContractProxyAddress(bytes32 _saltBytes, address _contractAddress)
        internal
        view
        returns (address)
    {
        (bytes memory proxyBytecode, bytes memory constructorArgs) =
            _getContractProxyAndConstructorArgs(_contractAddress);
        // slither-disable-next-line encode-packed-collision
        return Create2.computeAddress(_saltBytes, keccak256(abi.encodePacked(proxyBytecode, constructorArgs)));
    }

    /// @notice Internal function to deploy a `ATKIdentityProxy` (for wallets) using CREATE2.
    /// @dev It first computes the predicted address, then gets the proxy bytecode and constructor arguments,
    ///      and finally calls `_deployProxy` to perform the actual deployment.
    /// @param _saltBytes The `bytes32` salt for the CREATE2 deployment.
    /// @param _initialManager The address to be set as the initial manager in the proxy's constructor.
    /// @return address The address of the newly deployed `ATKIdentityProxy`.
    function _deployWalletProxy(bytes32 _saltBytes, address _initialManager) private returns (address) {
        address predictedAddr = _computeWalletProxyAddress(_saltBytes, _initialManager);
        (bytes memory proxyBytecode, bytes memory constructorArgs) = _getWalletProxyAndConstructorArgs(_initialManager);
        return _deployProxy(predictedAddr, proxyBytecode, constructorArgs, _saltBytes);
    }

    /// @notice Internal function to deploy a `ATKContractIdentityProxy` using CREATE2.
    /// @dev Similar to `_deployWalletProxy` but for contract identities, using `_computeContractProxyAddress` and
    /// `_getContractProxyAndConstructorArgs`.
    /// @param _saltBytes The `bytes32` salt for the CREATE2 deployment.
    /// @param _contractAddress The address of the contract that will own this identity
    /// @return address The address of the newly deployed `ATKContractIdentityProxy`.
    function _deployContractProxy(bytes32 _saltBytes, address _contractAddress) private returns (address) {
        address predictedAddr = _computeContractProxyAddress(_saltBytes, _contractAddress);
        (bytes memory proxyBytecode, bytes memory constructorArgs) =
            _getContractProxyAndConstructorArgs(_contractAddress);
        return _deployProxy(predictedAddr, proxyBytecode, constructorArgs, _saltBytes);
    }

    /// @notice Internal helper to get the creation bytecode and encoded constructor arguments for `ATKIdentityProxy`.
    /// @dev The constructor of `ATKIdentityProxy` takes the `_system` address (from factory state),
    /// `_initialManager`, and an array of claim authorization contracts.
    /// @param _initialManager The address to be encoded as the initial manager argument.
    /// @return proxyBytecode The creation bytecode of `ATKIdentityProxy`.
    /// @return constructorArgs The ABI-encoded constructor arguments (`_system`, `_initialManager`,
    /// `_claimAuthorizationContracts`).
    function _getWalletProxyAndConstructorArgs(address _initialManager)
        private
        view
        returns (bytes memory proxyBytecode, bytes memory constructorArgs)
    {
        proxyBytecode = type(ATKIdentityProxy).creationCode;
        address[] memory claimAuthorizationContracts = new address[](1);
        claimAuthorizationContracts[0] = IATKSystem(_system).trustedIssuersRegistry();
        constructorArgs = abi.encode(_system, _initialManager, claimAuthorizationContracts);
        // No explicit return needed due to named return variables
    }

    /// @notice Internal helper to get the creation bytecode and encoded constructor arguments for
    /// `ATKContractIdentityProxy`.
    /// @dev The constructor of `ATKContractIdentityProxy` takes the `_system` address, the contract address,
    /// and an array of claim authorization contracts.
    /// @param _contractAddress The address of the contract that will own this identity
    /// @return proxyBytecode The creation bytecode of `ATKContractIdentityProxy`.
    /// @return constructorArgs The ABI-encoded constructor arguments (`_system`, `_contractAddress`,
    /// `_claimAuthorizationContracts`).
    function _getContractProxyAndConstructorArgs(address _contractAddress)
        private
        view
        returns (bytes memory proxyBytecode, bytes memory constructorArgs)
    {
        proxyBytecode = type(ATKContractIdentityProxy).creationCode;
        address[] memory claimAuthorizationContracts = new address[](1);
        claimAuthorizationContracts[0] = IATKSystem(_system).trustedIssuersRegistry();
        constructorArgs = abi.encode(_system, _contractAddress, claimAuthorizationContracts);
        // No explicit return needed due to named return variables
    }

    /// @notice Core internal function to deploy a proxy contract using `Create2.deploy`.
    /// @dev It concatenates the `_proxyBytecode` with `_constructorArgs` to form the full deployment bytecode.
    ///      Then, it calls `Create2.deploy` with 0 ETH value, the `_saltBytes`, and the deployment bytecode.
    ///      Crucially, it verifies that the `deployedAddress` matches the `_predictedAddr`.
    ///      If they don't match, it reverts with `DeploymentAddressMismatch()`, indicating a severe issue.
    /// @param _predictedAddr The pre-calculated address where the contract is expected to be deployed.
    /// @param _proxyBytecode The creation bytecode of the proxy contract (without constructor arguments).
    /// @param _constructorArgs The ABI-encoded constructor arguments for the proxy.
    /// @param _saltBytes The `bytes32` salt for the CREATE2 deployment.
    /// @return address The address of the successfully deployed proxy contract.
    function _deployProxy(
        address _predictedAddr,
        bytes memory _proxyBytecode,
        bytes memory _constructorArgs,
        bytes32 _saltBytes
    )
        private
        returns (address)
    {
        bytes memory deploymentBytecode = abi.encodePacked(_proxyBytecode, _constructorArgs);

        address deployedAddress = Create2.deploy(0, _saltBytes, deploymentBytecode);

        if (deployedAddress != _predictedAddr) revert DeploymentAddressMismatch();
        return deployedAddress;
    }

    /// @notice Issues a CONTRACT_IDENTITY claim to a newly created contract identity.
    /// @dev This function is called after creating a contract identity to attest that it's a contract identity.
    ///      The claim is issued by the identity factory through its own OnChain ID.
    /// @param contractIdentity The address of the newly created contract identity.
    /// @param contractAddress The address of the contract that owns this identity.
    function _issueContractIdentityClaim(address contractIdentity, address contractAddress) private {
        // Get the topic ID for CONTRACT_IDENTITY claims
        IATKSystem system = IATKSystem(_system);
        IATKTopicSchemeRegistry topicRegistry = IATKTopicSchemeRegistry(system.topicSchemeRegistry());
        uint256 topicId = topicRegistry.getTopicId(ATKTopics.TOPIC_CONTRACT_IDENTITY);

        // Encode the claim data according to the topic signature: "address contractAddress"
        bytes memory claimData = abi.encode(contractAddress);

        // Issue the claim through the factory's own identity
        IATKContractIdentity factoryIdentity = IATKContractIdentity(_onchainID);
        IIdentity targetIdentity = IIdentity(contractIdentity);

        // The factory's identity issues the claim to the contract's identity
        factoryIdentity.issueClaimTo(
            targetIdentity,
            topicId,
            claimData,
            "" // No URI needed for this claim
        );
    }

    // --- Context Overrides (ERC2771) ---
    /// @notice Returns the address of the current message sender
    /// @dev Overrides `_msgSender()` to support meta-transactions via ERC2771. If the call is relayed
    ///      by a trusted forwarder, this will return the original sender, not the forwarder.
    ///      Otherwise, it returns `msg.sender` as usual.
    /// @return The address of the message sender, accounting for meta-transactions
    function _msgSender() internal view virtual override(ERC2771ContextUpgradeable) returns (address) {
        return ERC2771ContextUpgradeable._msgSender();
    }

    /// @notice Returns the calldata of the current transaction
    /// @dev Overrides `_msgData()` to support meta-transactions via ERC2771. If the call is relayed,
    ///      this returns the original call data. Otherwise, it returns `msg.data`.
    /// @return The calldata, accounting for meta-transactions
    function _msgData() internal view virtual override(ERC2771ContextUpgradeable) returns (bytes calldata) {
        return ERC2771ContextUpgradeable._msgData();
    }

    /// @notice Returns the length of the context suffix for meta-transactions
    /// @dev Internal function related to ERC2771 context, indicating the length of the suffix
    ///      appended to calldata by a trusted forwarder (usually the sender's address).
    /// @return The length of the context suffix
    function _contextSuffixLength() internal view virtual override(ERC2771ContextUpgradeable) returns (uint256) {
        return ERC2771ContextUpgradeable._contextSuffixLength();
    }

    /// @inheritdoc IERC165
    /// @notice Checks if the contract supports a given interface ID.
    /// @dev This function is part of the ERC165 standard, allowing other contracts to query what interfaces this
    /// contract implements.
    /// It declares support for the `IATKIdentityFactory` interface and any interfaces supported by its parent
    /// contracts
    /// (like `ERC165Upgradeable`).
    /// @param interfaceId The interface identifier (bytes4) to check.
    /// @return `true` if the contract supports the `interfaceId`, `false` otherwise.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Upgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == type(IATKIdentityFactory).interfaceId
            || interfaceId == type(IContractWithIdentity).interfaceId || super.supportsInterface(interfaceId);
    }

    // --- IContractWithIdentity Implementation ---

    /// @inheritdoc IContractWithIdentity
    /// @notice Returns the address of the identity factory's own OnChain ID.
    /// @dev This is set during bootstrap when the factory creates its own identity.
    function onchainID() external view override returns (address) {
        return _onchainID;
    }

    /// @inheritdoc IContractWithIdentity
    /// @notice Checks if the caller can add a claim to the identity contract.
    /// @dev The identity factory allows the system admin to add claims.
    function canAddClaim(address caller) external view override returns (bool) {
        return caller == address(this) || caller == _system;
    }

    /// @inheritdoc IContractWithIdentity
    /// @notice Checks if the caller can remove a claim from the identity contract.
    /// @dev The identity factory allows the system admin to remove claims.
    function canRemoveClaim(address caller) external view override returns (bool) {
        return caller == address(this) || caller == _system;
    }

    /// @notice Sets the identity factory's own OnChain ID and issues a self-claim.
    /// @dev This is called during bootstrap by the system contract only. After setting the identity,
    ///      it issues a CONTRACT_IDENTITY claim to itself to attest that the factory is a contract identity.
    /// @param identityAddress The address of the identity factory's own identity contract.
    function setOnchainID(address identityAddress) external {
        if (_msgSender() != _system) revert OnlySystemCanSetOnchainID();
        if (_onchainID != address(0)) revert OnchainIDAlreadySet();
        if (identityAddress == address(0)) revert InvalidIdentityAddress();
        _onchainID = identityAddress;

        // Issue a CONTRACT_IDENTITY claim to the factory's own identity
        // This provides self-attestation that the identity factory is a contract with an identity
        _issueContractIdentityClaim(identityAddress, address(this));
    }
}
