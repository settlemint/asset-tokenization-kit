// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";

// OnchainID imports
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

// Interface imports
import { ISMARTIdentityRegistry } from "../../smart/interface/ISMARTIdentityRegistry.sol";
import { ISMARTTrustedIssuersRegistry } from "../../smart/interface/ISMARTTrustedIssuersRegistry.sol";
import { ISMARTIdentityRegistryStorage } from "./../../smart/interface/ISMARTIdentityRegistryStorage.sol";
import { ISMARTTopicSchemeRegistry } from "../../smart/interface/ISMARTTopicSchemeRegistry.sol";
import { IATKIdentityRegistry } from "./IATKIdentityRegistry.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";

// Struct imports
import { ExpressionNode, ExpressionType } from "../../smart/interface/structs/ExpressionNode.sol";

// Constants
import { ATKPeopleRoles } from "../ATKPeopleRoles.sol";
import { ATKSystemRoles } from "../ATKSystemRoles.sol";

// Extensions
import { ATKSystemAccessManaged } from "../access-manager/ATKSystemAccessManaged.sol";

/// @title ATK Identity Registry Implementation
/// @author SettleMint
/// @notice This contract is the upgradeable logic for the ATK Identity Registry. It manages on-chain investor
/// identities
/// and their associated data, adhering to the ERC-3643 standard for tokenized assets.
/// @dev This implementation relies on separate contracts for storing identity data (`ISMARTIdentityRegistryStorage`)
/// and for managing trusted claim issuers (`ISMARTTrustedIssuersRegistry`).
/// It uses OpenZeppelin's `AccessControlUpgradeable` for role-based access control,
/// `ERC2771ContextUpgradeable` for meta-transaction support (allowing transactions to be relayed by a trusted
/// forwarder),
/// and is designed to be upgradeable using the UUPS (Universal Upgradeable Proxy Standard) pattern.
contract ATKIdentityRegistryImplementation is
    Initializable,
    ERC2771ContextUpgradeable,
    ATKSystemAccessManaged,
    IATKIdentityRegistry,
    ERC165Upgradeable
{
    // --- Storage References ---
    /// @notice Stores the contract address of the `ISMARTIdentityRegistryStorage` instance.
    /// @dev This external contract is responsible for persisting all identity-related data,
    /// such as the mapping from user addresses to their identity contracts and investor country codes.
    /// This separation of logic and storage enhances upgradeability and modularity.
    ISMARTIdentityRegistryStorage private _identityStorage;
    /// @notice Stores the contract address of the `ISMARTTrustedIssuersRegistry` instance.
    /// @dev This external contract maintains a list of trusted entities (claim issuers) that are authorized
    /// to issue verifiable claims about identities (e.g., KYC/AML status).
    /// The `isVerified` function uses this registry to check the validity of claims.
    ISMARTTrustedIssuersRegistry private _trustedIssuersRegistry;
    /// @notice Stores the contract address of the `ISMARTTopicSchemeRegistry` instance.
    /// @dev This external contract maintains the valid topic schemes and their signatures.
    /// The `isVerified` function uses this registry to validate that claim topics are registered before checking
    /// claims.
    ISMARTTopicSchemeRegistry private _topicSchemeRegistry;

    // --- Errors ---
    /// @notice Error triggered when an invalid storage address (e.g., address(0)) is provided.
    /// @dev This typically occurs during initialization or when updating storage contract addresses.
    error InvalidStorageAddress();
    /// @notice Error triggered when an invalid registry address (e.g., address(0)) is provided.
    /// @dev This usually happens when setting or updating the trusted issuers registry address.
    error InvalidRegistryAddress();
    /// @notice Error triggered when an invalid topic scheme registry address (e.g., address(0)) is provided.
    /// @dev This usually happens when setting or updating the topic scheme registry address.
    error InvalidTopicSchemeRegistryAddress();
    /// @notice Error triggered when an operation is attempted on a user address that is not registered in the system.
    /// @param userAddress The address that was not found in the registry.
    error IdentityNotRegistered(address userAddress);
    /// @notice Error triggered when an invalid identity contract address (e.g., address(0)) is provided.
    /// @dev This can occur during identity registration or updates if the identity contract address is null.
    error InvalidIdentityAddress();
    /// @notice Error triggered when the lengths of arrays provided for a batch operation do not match.
    /// @dev For example, in `batchRegisterIdentity`, the `_userAddresses`, `_identities`, and `_countries` arrays must
    /// all
    /// have the same length.
    error ArrayLengthMismatch();
    /// @notice Error triggered when an invalid user address (e.g., address(0)) is provided.
    /// @dev This check is often performed during identity registration to ensure a valid user address is being
    /// associated
    /// with an identity.
    error InvalidUserAddress();
    /// @notice Error triggered when an attempt is made to register an identity for a user address that is already
    /// registered.
    /// @param userAddress The address that is already registered.
    error IdentityAlreadyRegistered(address userAddress);

    // --- Custom Errors for Identity Recovery ---
    /// @notice Error triggered if a wallet is expected to be registered to a specific identity, but it is not.
    /// @param wallet The wallet address in question.
    /// @param identityContract The IIdentity contract it was expected to be linked to.
    error WalletNotRegisteredToThisIdentity(address wallet, address identityContract);
    /// @notice Error triggered if an operation is attempted on a wallet that is already marked as lost.
    /// @param wallet The wallet address that is already marked as lost.
    error WalletAlreadyMarkedAsLost(address wallet);

    // --- Expression Evaluation Errors ---
    /// @notice Error triggered when expression evaluation causes stack overflow.
    error ExpressionStackOverflow();
    /// @notice Error triggered when NOT operation doesn't have required operand on stack.
    error NotOperationRequiresOneOperand();
    /// @notice Error triggered when AND/OR operations don't have required operands on stack.
    error AndOrOperationsRequireTwoOperands();
    /// @notice Error triggered when an unknown ExpressionType is encountered.
    error UnknownExpressionType();
    /// @notice Error triggered when expression evaluation results in invalid stack state.
    error InvalidExpressionStackResult();

    // --- Events ---
    // Events are defined in the IATKIdentityRegistry interface and are inherited.
    // Duplicating them here would cause a linter error.
    // For clarity, the events that this contract is expected to emit (via the interface) are:
    // event IdentityStorageSet(address indexed admin, address indexed identityStorage);
    // event TrustedIssuersRegistrySet(address indexed admin, address indexed trustedIssuersRegistry);
    // event IdentityRegistered(address indexed registrar, address indexed userAddress, IIdentity indexed identity);
    // event IdentityRemoved(address indexed registrar, address indexed userAddress, IIdentity indexed identity);
    // event CountryUpdated(address indexed registrar, address indexed userAddress, uint16 country);
    // event IdentityUpdated(address indexed registrar, IIdentity indexed oldIdentity, IIdentity indexed newIdentity);

    // --- Constructor ---
    /// @notice Constructor for the `ATKIdentityRegistryImplementation` contract.
    /// @dev This constructor is typically called only once when the implementation contract is deployed.
    /// It initializes the `ERC2771ContextUpgradeable` by setting the `trustedForwarder` address.
    /// Meta-transactions sent via this `trustedForwarder` will have `_msgSender()` return the original sender
    /// rather than the forwarder contract.
    /// The `_disableInitializers()` function is called to prevent the `initialize` function from being called
    /// on this implementation contract directly after deployment if it were not an upgradeable contract.
    /// For UUPS proxies, the initializer is called on the proxy.
    /// @param trustedForwarder The address of the trusted forwarder contract for meta-transactions.
    /// If address(0) is provided, meta-transactions are effectively disabled for this context.
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    // --- Initializer ---
    /// @notice Initializes the `SMARTIdentityRegistryImplementation` contract after it has been deployed
    /// (typically called via a proxy).
    /// @dev This function sets up the core components of the identity registry:
    /// 1.  Initializes `ERC165Upgradeable` for interface detection.
    /// 2.  Initializes `AccessControlUpgradeable` for role-based access management.
    /// 3.  Grants the `DEFAULT_ADMIN_ROLE`, `REGISTRY_MANAGER_ROLE` and `REGISTRAR_ROLE` to the `initialAdmin` address.
    ///     The `DEFAULT_ADMIN_ROLE` allows managing other roles.
    ///     The `REGISTRY_MANAGER_ROLE` allows managing the registry contracts.
    ///     The `REGISTRAR_ROLE` allows managing identities.
    /// 4.  Sets the addresses for the `_identityStorage`, `_trustedIssuersRegistry`, and `_topicSchemeRegistry`
    /// contracts.
    ///     These addresses must not be zero addresses.
    /// It is protected by the `initializer` modifier from OpenZeppelin, ensuring it can only be called once.
    /// @param accessManager The address of the access manager
    /// @param identityStorage_ The address of the deployed `ISMARTIdentityRegistryStorage` contract.
    /// This contract will be used to store all identity data.
    /// @param trustedIssuersRegistry_ The address of the deployed `ISMARTTrustedIssuersRegistry` contract.
    /// This contract will be used to verify claims against trusted issuers.
    /// @param topicSchemeRegistry_ The address of the deployed `ISMARTTopicSchemeRegistry` contract.
    /// This contract will be used to validate claim topics against registered schemes.
    function initialize(
        address accessManager,
        address identityStorage_,
        address trustedIssuersRegistry_,
        address topicSchemeRegistry_
    )
        public
        initializer // Ensures this function is called only once

    {
        __ATKSystemAccessManaged_init(accessManager);
        __ERC165_init_unchained();

        // Validate and set the identity storage contract address.
        if (identityStorage_ == address(0)) revert InvalidStorageAddress();
        _identityStorage = ISMARTIdentityRegistryStorage(identityStorage_);
        emit IdentityStorageSet(_msgSender(), address(_identityStorage)); // Use _msgSender() for ERC2771 compatibility

        // Validate and set the trusted issuers registry contract address.
        if (trustedIssuersRegistry_ == address(0)) revert InvalidRegistryAddress();
        _trustedIssuersRegistry = ISMARTTrustedIssuersRegistry(trustedIssuersRegistry_);
        emit TrustedIssuersRegistrySet(_msgSender(), address(_trustedIssuersRegistry)); // Use _msgSender()

        // Validate and set the topic scheme registry contract address.
        if (topicSchemeRegistry_ == address(0)) revert InvalidTopicSchemeRegistryAddress();
        _topicSchemeRegistry = ISMARTTopicSchemeRegistry(topicSchemeRegistry_);
        emit TopicSchemeRegistrySet(_msgSender(), address(_topicSchemeRegistry));

        // Note: REGISTRAR_ROLE is now managed by REGISTRAR_ADMIN_ROLE holders
        // The system should grant REGISTRAR_ADMIN_ROLE to the token factory registry
        // which will then manage REGISTRAR_ROLE assignments to individual token factories
    }

    // --- State-Changing Functions ---

    /// @inheritdoc ISMARTIdentityRegistry
    /// @notice Updates the address of the identity storage contract.
    /// @dev This function can only be called by an address holding the `REGISTRY_MANAGER_ROLE`.
    /// It performs a check to ensure the new `identityStorage_` address is not the zero address.
    /// Emits an `IdentityStorageSet` event upon successful update.
    /// @param identityStorage_ The new address for the `ISMARTIdentityRegistryStorage` contract.
    function setIdentityRegistryStorage(address identityStorage_)
        external
        override
        onlySystemRole(ATKPeopleRoles.SYSTEM_MANAGER_ROLE)
    {
        if (identityStorage_ == address(0)) revert InvalidStorageAddress();
        _identityStorage = ISMARTIdentityRegistryStorage(identityStorage_);
        emit IdentityStorageSet(_msgSender(), address(_identityStorage));
    }

    /// @inheritdoc ISMARTIdentityRegistry
    /// @notice Updates the address of the trusted issuers registry contract.
    /// @dev This function can only be called by an address holding the `REGISTRY_MANAGER_ROLE`.
    /// It performs a check to ensure the new `trustedIssuersRegistry_` address is not the zero address.
    /// Emits a `TrustedIssuersRegistrySet` event upon successful update.
    /// @param trustedIssuersRegistry_ The new address for the `ISMARTTrustedIssuersRegistry` contract.
    function setTrustedIssuersRegistry(address trustedIssuersRegistry_)
        external
        override
        onlySystemRole(ATKPeopleRoles.SYSTEM_MANAGER_ROLE)
    {
        if (trustedIssuersRegistry_ == address(0)) revert InvalidRegistryAddress();
        _trustedIssuersRegistry = ISMARTTrustedIssuersRegistry(trustedIssuersRegistry_);
        emit TrustedIssuersRegistrySet(_msgSender(), address(_trustedIssuersRegistry));
    }

    /// @inheritdoc ISMARTIdentityRegistry
    /// @notice Updates the address of the topic scheme registry contract.
    /// @dev This function can only be called by an address holding the `REGISTRY_MANAGER_ROLE`.
    /// It performs a check to ensure the new `topicSchemeRegistry_` address is not the zero address.
    /// Emits a `TopicSchemeRegistrySet` event upon successful update.
    /// @param topicSchemeRegistry_ The new address for the `ISMARTTopicSchemeRegistry` contract.
    function setTopicSchemeRegistry(address topicSchemeRegistry_)
        external
        override
        onlySystemRole(ATKPeopleRoles.SYSTEM_MANAGER_ROLE)
    {
        if (topicSchemeRegistry_ == address(0)) revert InvalidTopicSchemeRegistryAddress();
        _topicSchemeRegistry = ISMARTTopicSchemeRegistry(topicSchemeRegistry_);
        emit TopicSchemeRegistrySet(_msgSender(), address(_topicSchemeRegistry));
    }

    /// @inheritdoc ISMARTIdentityRegistry
    /// @notice Registers a new identity in the system, associating a user's address with an identity contract and a
    /// country code.
    /// @dev This function can only be called by an address holding the `REGISTRAR_ROLE`.
    /// It internally calls the `_registerIdentity` helper function to perform the registration logic
    /// after access control checks have passed.
    /// @param _userAddress The blockchain address of the user whose identity is being registered.
    /// This address will be linked to the `_identity` contract.
    /// @param _identity The address of the `IIdentity` (ERC725/ERC734) contract representing the user's on-chain
    /// identity.
    /// @param _country A numerical code (uint16) representing the user's country of residence or jurisdiction.
    function registerIdentity(
        address _userAddress,
        IIdentity _identity,
        uint16 _country
    )
        external
        override
        onlySystemRoles3(
            ATKPeopleRoles.IDENTITY_MANAGER_ROLE,
            ATKSystemRoles.ADDON_FACTORY_MODULE_ROLE,
            ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE
        )
    {
        _registerIdentity(_userAddress, _identity, _country);
    }

    /// @inheritdoc ISMARTIdentityRegistry
    /// @notice Deletes an existing identity associated with a given user address from the registry.
    /// @dev This function can only be called by an address holding the `REGISTRAR_ROLE`.
    /// It first checks if the `_userAddress` is currently registered using `this.contains()`.
    /// If registered, it retrieves the `IIdentity` contract to be deleted (for event emission),
    /// then calls `_identityStorage.removeIdentityFromStorage()` to remove the data from the storage contract.
    /// Emits an `IdentityRemoved` event upon successful deletion.
    /// @param _userAddress The blockchain address of the user whose identity is to be deleted.
    /// Reverts with `IdentityNotRegistered` if the address is not found.
    function deleteIdentity(address _userAddress)
        external
        override
        onlySystemRoles3(
            ATKPeopleRoles.IDENTITY_MANAGER_ROLE,
            ATKSystemRoles.ADDON_FACTORY_MODULE_ROLE,
            ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE
        )
    {
        // Ensure the identity exists before attempting to delete.
        // The `contains` function checks the storage contract.
        if (!this.contains(_userAddress)) revert IdentityNotRegistered(_userAddress);

        // Retrieve the identity contract address before deletion for the event.
        IIdentity identityToDelete = _identityStorage.storedIdentity(_userAddress);
        // Remove the identity from the external storage contract.
        _identityStorage.removeIdentityFromStorage(_userAddress);

        // Emit an event to log the identity removal.
        emit IdentityRemoved(_msgSender(), _userAddress, identityToDelete);
    }

    /// @inheritdoc ISMARTIdentityRegistry
    /// @notice Updates the country code associated with an existing registered identity.
    /// @dev This function can only be called by an address holding the `REGISTRAR_ROLE`.
    /// It first checks if the `_userAddress` is currently registered.
    /// If registered, it calls `_identityStorage.modifyStoredInvestorCountry()` to update the country code in the
    /// storage contract.
    /// Emits a `CountryUpdated` event upon successful update.
    /// @param _userAddress The blockchain address of the user whose country code is to be updated.
    /// Reverts with `IdentityNotRegistered` if the address is not found.
    /// @param _country The new numerical country code (uint16) for the user.
    function updateCountry(
        address _userAddress,
        uint16 _country
    )
        external
        override
        onlySystemRole(ATKPeopleRoles.IDENTITY_MANAGER_ROLE)
    {
        if (!this.contains(_userAddress)) revert IdentityNotRegistered(_userAddress);

        _identityStorage.modifyStoredInvestorCountry(_userAddress, _country);
        emit CountryUpdated(_msgSender(), _userAddress, _country);
    }

    /// @inheritdoc ISMARTIdentityRegistry
    /// @notice Updates the `IIdentity` contract associated with an existing registered user address.
    /// @dev This function can only be called by an address holding the `REGISTRAR_ROLE`.
    /// It first checks if the `_userAddress` is currently registered and if the new `_identity` address is not zero.
    /// If checks pass, it retrieves the old `IIdentity` contract (for event emission),
    /// then calls `_identityStorage.modifyStoredIdentity()` to update the identity contract in the storage contract.
    /// Emits an `IdentityUpdated` event upon successful update.
    /// @param _userAddress The blockchain address of the user whose `IIdentity` contract is to be updated.
    /// Reverts with `IdentityNotRegistered` if the address is not found.
    /// @param _identity The address of the new `IIdentity` contract to associate with the `_userAddress`.
    /// Reverts with `InvalidIdentityAddress` if this is the zero address.
    function updateIdentity(
        address _userAddress,
        IIdentity _identity
    )
        external
        override
        onlySystemRole(ATKPeopleRoles.IDENTITY_MANAGER_ROLE)
    {
        if (!this.contains(_userAddress)) revert IdentityNotRegistered(_userAddress);
        if (address(_identity) == address(0)) revert InvalidIdentityAddress();

        IIdentity oldInvestorIdentity = _identityStorage.storedIdentity(_userAddress);
        _identityStorage.modifyStoredIdentity(_userAddress, _identity);

        emit IdentityUpdated(_msgSender(), oldInvestorIdentity, _identity);
    }

    /// @inheritdoc ISMARTIdentityRegistry
    /// @notice Registers multiple identities in a single transaction (batch operation).
    /// @dev This function can only be called by an address holding the `REGISTRAR_ROLE`.
    /// It iterates through the provided arrays (`_userAddresses`, `_identities`, `_countries`)
    /// and calls `_registerIdentity` for each set of parameters.
    /// It performs checks to ensure that all provided arrays have the same length to prevent errors.
    /// @param _userAddresses An array of user blockchain addresses to be registered.
    /// @param _identities An array of `IIdentity` contract addresses corresponding to each user address.
    /// @param _countries An array of numerical country codes (uint16) corresponding to each user address.
    /// Reverts with `ArrayLengthMismatch` if the lengths of the input arrays are inconsistent.
    function batchRegisterIdentity(
        address[] calldata _userAddresses,
        IIdentity[] calldata _identities,
        uint16[] calldata _countries
    )
        external
        override
        onlySystemRole(ATKPeopleRoles.IDENTITY_MANAGER_ROLE)
    {
        // Ensure all input arrays have the same number of elements.
        if (_userAddresses.length != _identities.length) {
            revert ArrayLengthMismatch();
        }
        if (_identities.length != _countries.length) {
            revert ArrayLengthMismatch();
        }

        uint256 userAddressesLength = _userAddresses.length;
        // Loop through each entry and register the identity.
        for (uint256 i = 0; i < userAddressesLength;) {
            _registerIdentity(_userAddresses[i], _identities[i], _countries[i]);
            // Using unchecked arithmetic for gas optimization as loop condition prevents overflow.
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc ISMARTIdentityRegistry
    function recoverIdentity(
        address lostWallet,
        address newWallet,
        address newOnchainId
    )
        external
        override
        onlySystemRole(ATKPeopleRoles.IDENTITY_MANAGER_ROLE)
    {
        // Initial input validation
        if (lostWallet == address(0)) revert InvalidUserAddress();
        if (newWallet == address(0)) revert InvalidUserAddress();
        if (newOnchainId == address(0)) revert InvalidIdentityAddress();

        // 1. Verify lostWallet is currently active and retrieve its associated identity
        IIdentity oldIdentityContract;
        try _identityStorage.storedIdentity(lostWallet) returns (IIdentity id) {
            oldIdentityContract = id;
        } catch {
            revert IdentityNotRegistered(lostWallet);
        }

        // 2. Retrieve the existing country code from the lost wallet before any modifications
        uint16 existingCountryCode = _identityStorage.storedInvestorCountry(lostWallet);

        // 3. Check if lostWallet is already marked as lost
        if (_identityStorage.isWalletMarkedAsLost(lostWallet)) {
            revert WalletAlreadyMarkedAsLost(lostWallet);
        }

        // 4. Check newWallet status and determine if registration is needed
        bool newWalletIsCurrentlyRegistered = false;
        bool needsRegistration = true;
        IIdentity currentNewWalletIdentity;

        try _identityStorage.storedIdentity(newWallet) returns (IIdentity id) {
            newWalletIsCurrentlyRegistered = true;
            currentNewWalletIdentity = id;

            // Check if newWallet is already registered to the correct identity
            if (address(currentNewWalletIdentity) == newOnchainId) {
                needsRegistration = false; // Skip registration as it's already correct
            } else {
                // newWallet is registered to a different identity - this is a conflict
                revert IdentityAlreadyRegistered(newWallet);
            }
        } catch {
            // newWallet is not registered, proceed with normal registration
            needsRegistration = true;
        }

        // Check if newWallet is marked as lost
        if (_identityStorage.isWalletMarkedAsLost(newWallet)) {
            revert WalletAlreadyMarkedAsLost(newWallet);
        }

        // 5. Mark lostWallet as lost in the storage layer (using the old identity contract)
        _identityStorage.markWalletAsLost(address(oldIdentityContract), lostWallet);

        // 6. Remove lostWallet's active registration from storage
        _identityStorage.removeIdentityFromStorage(lostWallet);

        // 7. Register the newWallet with the NEW identity contract and preserved country code (only if needed)
        if (needsRegistration) {
            _identityStorage.addIdentityToStorage(newWallet, IIdentity(newOnchainId), existingCountryCode);
        }

        // 8. Establish the recovery link between old and new wallets for token reclaim
        _identityStorage.linkWalletRecovery(lostWallet, newWallet);

        emit IdentityRecovered(_msgSender(), lostWallet, newWallet, newOnchainId, address(oldIdentityContract));
        emit WalletRecoveryLinked(_msgSender(), lostWallet, newWallet);
    }

    // --- View Functions ---

    /// @inheritdoc ISMARTIdentityRegistry
    /// @notice Checks if a given user address is registered in the identity system.
    /// @dev This function queries the `_identityStorage` contract by attempting to retrieve the `storedIdentity`.
    /// If the retrieval is successful (does not revert), it means the identity exists, and the function returns `true`.
    /// If the retrieval reverts (e.g., identity not found in storage), it's caught, and the function returns `false`.
    /// This approach avoids a direct "exists" function on the storage if not available, relying on try/catch.
    /// @param _userAddress The user's blockchain address to check for registration.
    /// @return `true` if the `_userAddress` is registered, `false` otherwise.
    function contains(address _userAddress) external view override returns (bool) {
        // Try to retrieve the identity from storage. If it succeeds, the identity exists.
        try _identityStorage.storedIdentity(_userAddress) returns (IIdentity) {
            return true; // Identity found
        } catch {
            return false; // Identity not found (call to storage reverted)
        }
    }

    /// @inheritdoc ISMARTIdentityRegistry
    /// @notice Checks if a registered investor's wallet address is considered 'verified' using logical expressions.
    /// @dev This function evaluates a postfix (Reverse Polish Notation) expression using a stack-based algorithm.
    ///      The expression can combine claim topics using AND, OR, and NOT operations for flexible compliance rules.
    ///      Each TOPIC node is verified using the same logic as the array-based isVerified function.
    ///      Includes local caching to avoid redundant verification of the same topics within a single expression.
    /// @param _userAddress The investor's wallet address to verify.
    /// @param expression An array of ExpressionNode structs representing a postfix expression.
    /// @return True if the investor's identity satisfies the logical expression, false otherwise.
    function isVerified(
        address _userAddress,
        ExpressionNode[] calldata expression
    )
        external
        view
        override
        returns (bool)
    {
        // Check if the wallet is globally marked as lost first.
        if (_identityStorage.isWalletMarkedAsLost(_userAddress)) {
            return false;
        }

        // Early checks similar to the array-based version
        if (!this.contains(_userAddress)) {
            return false;
        }

        // Empty expression is considered true (no requirements specified)
        if (expression.length == 0) {
            return true;
        }

        // Local cache for topic verification results within this function call
        // Using parallel arrays since local mappings are not allowed in Solidity
        uint256[] memory cachedTopics = new uint256[](expression.length);
        bool[] memory cachedResults = new bool[](expression.length);
        uint256 cacheSize = 0;

        // Stack for evaluation - maximum size needed is expression length
        bool[] memory stack = new bool[](expression.length);
        uint256 stackIndex = 0;

        // Process each node in the postfix expression
        for (uint256 i = 0; i < expression.length;) {
            ExpressionNode memory node = expression[i];

            if (node.nodeType == ExpressionType.TOPIC) {
                bool hasClaim;

                // Check if we've already verified this topic
                bool topicFoundInCache = false;
                for (uint256 j = 0; j < cacheSize;) {
                    if (cachedTopics[j] == node.value) {
                        hasClaim = cachedResults[j];
                        topicFoundInCache = true;
                        break;
                    }
                    unchecked {
                        ++j;
                    }
                }

                if (!topicFoundInCache) {
                    // Verify the claim topic using existing logic and cache the result
                    hasClaim = _verifyClaimTopic(_userAddress, node.value);
                    cachedTopics[cacheSize] = node.value;
                    cachedResults[cacheSize] = hasClaim;
                    unchecked {
                        ++cacheSize;
                    }
                }

                // Push result onto stack
                if (stackIndex > stack.length - 1) {
                    revert ExpressionStackOverflow();
                }
                stack[stackIndex] = hasClaim;
                unchecked {
                    ++stackIndex;
                }
            } else if (node.nodeType == ExpressionType.NOT) {
                // NOT requires one operand
                if (stackIndex < 1) {
                    revert NotOperationRequiresOneOperand();
                }
                unchecked {
                    --stackIndex;
                }
                stack[stackIndex] = !stack[stackIndex];
                unchecked {
                    ++stackIndex;
                }
            } else if (node.nodeType == ExpressionType.AND || node.nodeType == ExpressionType.OR) {
                // AND/OR require two operands
                if (stackIndex < 2) {
                    revert AndOrOperationsRequireTwoOperands();
                }

                // Pop two operands
                unchecked {
                    --stackIndex;
                }
                bool operandB = stack[stackIndex];
                unchecked {
                    --stackIndex;
                }
                bool operandA = stack[stackIndex];

                // Perform operation and push result
                bool result = (node.nodeType == ExpressionType.AND) ? (operandA && operandB) : (operandA || operandB);
                stack[stackIndex] = result;
                unchecked {
                    ++stackIndex;
                }
            } else {
                revert UnknownExpressionType();
            }

            unchecked {
                ++i;
            }
        }

        // Valid expression should leave exactly one value on stack
        if (stackIndex != 1) {
            revert InvalidExpressionStackResult();
        }

        return stack[0];
    }

    /// @notice Internal helper function to verify a single claim topic for a user.
    /// @dev Internal helper function to verify a single claim topic for a user.
    ///      This encapsulates the claim verification logic used in both isVerified implementations.
    ///      Optimized to use getClaimIdsByTopic for efficient claim retrieval.
    /// @param _userAddress The user's address to verify claims for.
    /// @param claimTopic The claim topic ID to verify.
    /// @return True if the user has a valid claim for the topic from a trusted issuer.
    function _verifyClaimTopic(address _userAddress, uint256 claimTopic) internal view returns (bool) {
        // Skip zero topics (invalid)
        if (claimTopic == 0) {
            return false;
        }

        // Verify the topic is registered in the topic scheme registry
        if (!_topicSchemeRegistry.hasTopicScheme(claimTopic)) {
            return false;
        }

        // Get the identity contract for the user
        IIdentity identityToVerify = _identityStorage.storedIdentity(_userAddress);

        // Get all claim IDs for this topic at once (more efficient than per-issuer lookups)
        bytes32[] memory claimIds = identityToVerify.getClaimIdsByTopic(claimTopic);
        if (claimIds.length == 0) {
            return false; // No claims for this topic
        }

        // Get trusted issuers for this topic
        IClaimIssuer[] memory trustedIssuers =
            _trustedIssuersRegistry.getTrustedIssuersForClaimTopic(claimTopic, address(identityToVerify));
        if (trustedIssuers.length == 0) {
            return false; // No trusted issuers for this topic
        }

        // Check each claim against the list of trusted issuers
        for (uint256 i = 0; i < claimIds.length;) {
            // Get claim details
            (uint256 foundClaimTopic,, address issuer, bytes memory sig, bytes memory data,) =
                identityToVerify.getClaim(claimIds[i]);

            // Verify the claim topic matches (should always be true due to getClaimIdsByTopic)
            if (foundClaimTopic == claimTopic) {
                // Check if the issuer is trusted for this topic
                for (uint256 j = 0; j < trustedIssuers.length;) {
                    if (address(trustedIssuers[j]) == issuer) {
                        // Verify the claim is valid with the trusted issuer
                        if (trustedIssuers[j].isClaimValid(identityToVerify, claimTopic, sig, data)) {
                            return true; // Found valid claim from trusted issuer
                        }
                        break; // Found the issuer, no need to check others for this claim
                    }
                    unchecked {
                        ++j;
                    }
                }
            }

            unchecked {
                ++i;
            }
        }

        return false; // No valid claim found from trusted issuers
    }

    /// @inheritdoc ISMARTIdentityRegistry
    /// @notice Retrieves the `IIdentity` contract address associated with a given user address.
    /// @dev This function directly calls `_identityStorage.storedIdentity()` to fetch the identity contract.
    /// It's a public view function, meaning it can be called externally without gas costs for reading data.
    /// If the `_userAddress` is not registered, this call will likely revert (behavior depends on the storage
    /// contract).
    /// Consider using `contains()` first if a revert is not desired for non-existent users.
    /// @param _userAddress The user's blockchain address whose `IIdentity` contract is to be retrieved.
    /// @return The address of the `IIdentity` contract associated with the `_userAddress`.
    /// Returns address(0) or reverts if the user is not registered, depending on storage implementation.
    function identity(address _userAddress) public view override returns (IIdentity) {
        return _identityStorage.storedIdentity(_userAddress);
    }

    /// @inheritdoc ISMARTIdentityRegistry
    /// @notice Retrieves the country code associated with a registered user address.
    /// @dev This function first checks if the `_userAddress` is registered using `this.contains()`.
    /// If not registered, it reverts with `IdentityNotRegistered`.
    /// Otherwise, it calls `_identityStorage.storedInvestorCountry()` to fetch the country code.
    /// @param _userAddress The user's blockchain address whose country code is to be retrieved.
    /// @return The numerical country code (uint16) associated with the `_userAddress`.
    /// Reverts if the user is not registered.
    function investorCountry(address _userAddress) external view override returns (uint16) {
        if (!this.contains(_userAddress)) revert IdentityNotRegistered(_userAddress);
        return _identityStorage.storedInvestorCountry(_userAddress);
    }

    /// @inheritdoc ISMARTIdentityRegistry
    /// @notice Returns the address of the currently configured identity storage contract.
    /// @dev This allows external contracts or UIs to discover the location of the storage layer.
    /// @return The address of the `ISMARTIdentityRegistryStorage` contract.
    function identityStorage() external view override returns (ISMARTIdentityRegistryStorage) {
        return _identityStorage;
    }

    /// @inheritdoc ISMARTIdentityRegistry
    /// @notice Returns the address of the currently configured trusted issuers registry contract.
    /// @dev This allows external contracts or UIs to discover the location of the trusted issuers list.
    /// @return The address of the `ISMARTTrustedIssuersRegistry` contract.
    function issuersRegistry() external view override returns (ISMARTTrustedIssuersRegistry) {
        return _trustedIssuersRegistry;
    }

    /// @inheritdoc ISMARTIdentityRegistry
    /// @notice Returns the address of the currently configured topic scheme registry contract.
    /// @dev This allows external contracts or UIs to discover the location of the topic scheme registry.
    /// @return The address of the `ISMARTTopicSchemeRegistry` contract.
    function topicSchemeRegistry() external view override returns (ISMARTTopicSchemeRegistry) {
        return _topicSchemeRegistry;
    }

    // --- Lost Wallet View Functions ---

    /// @inheritdoc ISMARTIdentityRegistry
    function isWalletLost(address userWallet) external view override returns (bool) {
        return _identityStorage.isWalletMarkedAsLost(userWallet);
    }

    /// @inheritdoc ISMARTIdentityRegistry
    function getRecoveredWallet(address lostWallet) external view override returns (address) {
        return _identityStorage.getRecoveredWalletFromStorage(lostWallet);
    }

    // --- Internal Functions ---

    /// @notice Internal helper function to register an identity.
    /// @dev This function encapsulates the core logic for registering a new identity:
    /// 1. Validates `_userAddress` (cannot be zero address).
    /// 2. Validates `_identity` (cannot be zero address).
    /// 3. Checks if `_userAddress` is already registered using `this.contains()`.
    /// 4. If all checks pass, it calls `_identityStorage.addIdentityToStorage()` to persist the data.
    /// 5. Emits an `IdentityRegistered` event.
    /// This function is marked `internal`, meaning it can only be called from within this contract or derived
    /// contracts.
    /// It's used by `registerIdentity` and `batchRegisterIdentity`.
    /// @param _userAddress The user's blockchain address.
    /// @param _identity The `IIdentity` contract address for the user.
    /// @param _country The numerical country code for the user.
    /// Reverts with `InvalidUserAddress`, `InvalidIdentityAddress`, or `IdentityAlreadyRegistered` on failure.
    function _registerIdentity(address _userAddress, IIdentity _identity, uint16 _country) internal {
        if (_userAddress == address(0)) revert InvalidUserAddress();
        if (address(_identity) == address(0)) revert InvalidIdentityAddress();
        // Check if this user address is already associated with an identity.
        if (this.contains(_userAddress)) revert IdentityAlreadyRegistered(_userAddress);

        // Add the identity to the external storage contract.
        _identityStorage.addIdentityToStorage(_userAddress, _identity, _country);
        // Emit an event to log the successful registration.
        emit IdentityRegistered(_msgSender(), _userAddress, _identity, _country);
        emit CountryUpdated(_msgSender(), _userAddress, _country);
    }

    // --- Context Overrides (ERC2771) ---

    /// @notice Provides the actual sender of a transaction, supporting meta-transactions via ERC2771.
    /// @dev Overrides the `_msgSender()` function from both `ContextUpgradeable` and `ERC2771ContextUpgradeable`.
    /// If the transaction is relayed through a trusted forwarder (configured in `ERC2771ContextUpgradeable`),
    /// this function returns the original sender's address. Otherwise, it returns `msg.sender`.
    /// This is crucial for ensuring that access control and event emissions correctly attribute actions
    /// to the initiating user, even when a transaction is relayed.
    /// @return The address of the original transaction sender.
    function _msgSender()
        internal
        view
        virtual
        override(ERC2771ContextUpgradeable, ATKSystemAccessManaged)
        returns (address)
    {
        return ERC2771ContextUpgradeable._msgSender();
    }

    /// @inheritdoc IERC165
    /// @notice Indicates whether this contract supports a given interface ID.
    /// @dev This function is part of the ERC165 standard for interface detection.
    ///      It checks if the contract implements the `ISMARTIdentityRegistry` interface
    ///      or any interfaces supported by its parent contracts (via `super.supportsInterface`).
    ///      This allows other contracts to query if this registry conforms to the expected interface.
    /// @param interfaceId The EIP-165 interface identifier (bytes4) to check.
    /// @return `true` if the contract supports the `interfaceId`, `false` otherwise.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Upgradeable, IERC165)
        returns (bool)
    {
        // Check for ISMARTIdentityRegistry interface and then delegate to parent contracts.
        return interfaceId == type(IATKIdentityRegistry).interfaceId
            || interfaceId == type(ISMARTIdentityRegistry).interfaceId
            || interfaceId == type(IATKSystemAccessManaged).interfaceId || super.supportsInterface(interfaceId);
    }
}
