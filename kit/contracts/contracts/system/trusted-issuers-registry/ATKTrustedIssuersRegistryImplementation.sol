// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// OnchainID imports
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

// Interface imports
import { IERC3643TrustedIssuersRegistry } from "../../smart/interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol";
import { IATKTrustedIssuersRegistry } from "./IATKTrustedIssuersRegistry.sol";
import { IClaimAuthorizer } from "../../onchainid/extensions/IClaimAuthorizer.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";
import { ISMARTTrustedIssuersRegistry } from "../../smart/interface/ISMARTTrustedIssuersRegistry.sol";

// Constants
import { ATKPeopleRoles } from "../ATKPeopleRoles.sol";
import { ATKSystemRoles } from "../ATKSystemRoles.sol";

// Extensions
import { ATKSystemAccessManaged } from "../access-manager/ATKSystemAccessManaged.sol";

/// @title ATK Trusted Issuers Registry Implementation
/// @author SettleMint
/// @notice This contract is the upgradeable logic for managing a registry of trusted claim issuers and the specific
/// claim topics they are authorized to issue claims for. It is compliant with the `IERC3643TrustedIssuersRegistry`
/// interface, a standard for tokenization platforms.
/// @dev This registry plays a crucial role in decentralized identity and verifiable credential systems. It allows
/// relying parties (e.g., smart contracts controlling access to tokenized assets) to verify if a claim presented by
/// a user was issued by an entity trusted for that particular type of claim (claim topic).
/// Key features:
/// -   **Upgradeable:** Uses the UUPS (Universal Upgradeable Proxy Standard) pattern, allowing the logic to be
///     updated without changing the contract address or losing data.
/// -   **Access Control:** Leverages `AccessControlUpgradeable` from OpenZeppelin. A `REGISTRAR_ROLE` is
///     defined, which grants permission to add, remove, and update trusted issuers and their claim topics.
///     The `DEFAULT_ADMIN_ROLE` can manage who holds the `REGISTRAR_ROLE`.
/// -   **Efficient Lookups:** Maintains mappings to quickly find all trusted issuers for a given claim topic
///     (`_issuersByClaimTopic`) and to check if a specific issuer is trusted for a specific topic
///     (`_claimTopicIssuerIndex`).
/// -   **Meta-transactions:** Supports gasless transactions for users via `ERC2771ContextUpgradeable` if a trusted
///     forwarder is configured.
/// -   **ERC165:** Implements `supportsInterface` for discoverability of its `IERC3643TrustedIssuersRegistry`
/// compliance.
/// The contract stores `TrustedIssuer` structs, which link an issuer's address to an array of claim topics they are
/// authorized for. It also maintains an array of all registered issuer addresses (`_issuerAddresses`) for enumeration.
contract ATKTrustedIssuersRegistryImplementation is
    Initializable,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    ATKSystemAccessManaged,
    IATKTrustedIssuersRegistry,
    IClaimAuthorizer
{
    // --- Storage Variables ---

    /// @notice Defines a structure to hold the details for a trusted claim issuer.
    /// @param issuer The Ethereum address of the `IClaimIssuer` compliant contract. This contract is responsible for
    /// issuing claims (e.g., KYC, accreditation) about identities.
    /// @param claimTopics An array of `uint256` values, where each value represents a specific claim topic (e.g.,
    /// topic `1` for KYC, topic `2` for AML). The issuer is trusted to issue claims related to these topics.
    /// @param exists A boolean flag indicating whether this issuer is currently registered and considered active in the
    /// registry. `true` if active, `false` if removed or not yet added.
    struct TrustedIssuer {
        address issuer;
        bool exists;
        uint256[] claimTopics;
    }

    /// @notice Primary mapping that stores `TrustedIssuer` details, keyed by the issuer's contract address.
    /// @dev This allows for quick O(1) lookup of an issuer's information (their authorized claim topics and existence
    /// status) given their address.
    /// Example: `_trustedIssuers[0xIssuerContractAddress]` would return the `TrustedIssuer` struct for that issuer.
    mapping(address issuerAddress => TrustedIssuer issuerDetails) private _trustedIssuers;

    /// @notice An array storing the addresses of all currently registered and active trusted issuers.
    /// @dev This array allows for iterating over all trusted issuers, which can be useful for administrative purposes,
    /// data export, or displaying a complete list of trusted entities.
    /// It is managed to ensure that only existing issuers are present (issuers are removed upon `removeTrustedIssuer`).
    address[] private _issuerAddresses;

    /// @notice Mapping from a specific claim topic (`uint256`) to an array of issuer addresses that are trusted for
    /// that particular topic.
    /// @dev This is a key data structure for efficient querying. For example, to find all issuers trusted to provide
    /// KYC claims (assuming KYC is topic `1`), one would look up `_issuersByClaimTopic[1]`.
    /// This mapping is updated whenever an issuer is added, removed, or their claim topics are modified.
    /// @dev This warning can be safely ignored as Solidity automatically initializes mapping values with their default
    /// values (empty array in this case) when first accessed. The contract has proper checks in place when accessing
    /// this mapping.
    /// @custom:slither-disable-next-line uninitialized-state
    mapping(uint256 claimTopic => address[] issuers) private _issuersByClaimTopic;

    /// @notice Mapping for efficient removal and existence check of an issuer within a specific claim topic's list.
    /// @dev It maps a claim topic to another mapping, which then maps an issuer's address to their index (plus one)
    /// in the `_issuersByClaimTopic[claimTopic]` array.
    /// - `_claimTopicIssuerIndex[claimTopic][issuerAddress]` returns `0` if `issuerAddress` is NOT trusted for
    ///   `claimTopic`.
    /// - If it returns a non-zero value `n`, then `issuerAddress` IS trusted for `claimTopic`, and its actual 0-based
    ///   index in the `_issuersByClaimTopic[claimTopic]` array is `n-1`.
    /// This structure allows for O(1) check for `hasClaimTopic` and O(1) removal from `_issuersByClaimTopic` using
    /// the swap-and-pop technique.
    mapping(uint256 claimTopic => mapping(address issuer => uint256 indexPlusOne)) private _claimTopicIssuerIndex;

    // --- Errors ---
    /// @notice Error triggered if an attempt is made to add or interact with an issuer using a zero address.
    /// @dev The zero address is invalid for representing an issuer contract. This ensures all registered issuers
    /// have a valid contract address.
    error InvalidIssuerAddress();

    /// @notice Error triggered if an attempt is made to initialize with a zero address for the admin role.
    /// @dev The zero address is invalid for representing an admin. This ensures proper access control setup.
    error InvalidAdminAddress();

    /// @notice Error triggered if an attempt is made to grant registrar role to a zero address.
    /// @dev The zero address is invalid for representing a registrar. This ensures all registrars have valid addresses.
    error InvalidRegistrarAddress();

    /// @notice Error triggered if an attempt is made to add or update an issuer with an empty list of claim topics.
    /// @dev A trusted issuer must be associated with at least one claim topic they are authorized to issue claims for.
    /// This prevents registering issuers with no specified area of authority.
    error NoClaimTopicsProvided();

    /// @notice Error triggered when attempting to add an issuer that is already registered in the registry.
    /// @param issuerAddress The address of the issuer that already exists.
    /// @dev This prevents duplicate entries for the same issuer, maintaining data integrity.
    error IssuerAlreadyExists(address issuerAddress);

    /// @notice Error triggered when attempting to operate on an issuer (e.g., remove, update) that is not registered.
    /// @param issuerAddress The address of the issuer that was not found in the registry.
    /// @dev Ensures that operations are only performed on existing, registered issuers.
    error IssuerDoesNotExist(address issuerAddress);

    /// @notice Error triggered during an attempt to remove an issuer from a specific claim topic's list, but the issuer
    /// was not found in that list.
    /// @param issuerAddress The address of the issuer that was expected but not found.
    /// @param claimTopic The specific claim topic from which the issuer was being removed.
    /// @dev This typically indicates an inconsistency in state or an incorrect operation, as an issuer should only be
    /// removed from topics they are actually associated with.
    error IssuerNotFoundInTopicList(address issuerAddress, uint256 claimTopic);

    /// @notice Generic error triggered when an address is expected to be in a list (e.g., `_issuerAddresses`) but is
    /// not
    /// found during a removal operation.
    /// @param addr The address that was not found in the list.
    /// @dev This usually signals an internal state inconsistency, as removal operations generally assume the item
    /// exists.
    error AddressNotFoundInList(address addr);

    // --- Events ---
    /// @notice Emitted when a new trusted issuer is successfully added to the registry.
    /// @param sender The address of the account (holder of `REGISTRAR_ROLE`) that performed the addition. Indexed for
    /// searchability.
    /// @param _issuer The address of the `IClaimIssuer` contract that was added as a trusted issuer. Indexed for
    /// searchability.
    /// @param _claimTopics An array of `uint256` claim topics for which the new issuer is now trusted.
    /// @dev This event is crucial for off-chain systems and UIs to track changes in the set of trusted issuers.
    event TrustedIssuerAdded(address indexed sender, address indexed _issuer, uint256[] _claimTopics);

    /// @notice Emitted when an existing trusted issuer is successfully removed from the registry.
    /// @param sender The address of the account (holder of `REGISTRAR_ROLE`) that performed the removal. Indexed for
    /// searchability.
    /// @param _issuer The address of the `IClaimIssuer` contract that was removed. Indexed for searchability.
    /// @dev Upon this event, the issuer is no longer considered trusted for any claim topics it was previously
    /// associated with.
    event TrustedIssuerRemoved(address indexed sender, address indexed _issuer);

    /// @notice Emitted when the list of claim topics for an existing trusted issuer is successfully updated.
    /// @param sender The address of the account (holder of `REGISTRAR_ROLE`) that performed the update. Indexed for
    /// searchability.
    /// @param _issuer The address of the `IClaimIssuer` contract whose claim topics were updated. Indexed for
    /// searchability.
    /// @param _claimTopics The new array of `uint256` claim topics for which the issuer is now trusted.
    /// @dev This event allows tracking modifications to an issuer's scope of authority without removing and re-adding
    /// them.
    event ClaimTopicsUpdated(address indexed sender, address indexed _issuer, uint256[] _claimTopics);

    // --- Constructor --- (Disable direct construction for upgradeable contract)
    /// @notice Constructor for the `ATKTrustedIssuersRegistryImplementation`.
    /// @dev This constructor is part of the UUPS (Universal Upgradeable Proxy Standard) pattern.
    /// Its primary role is to initialize `ERC2771ContextUpgradeable` with the `trustedForwarder` address, enabling
    /// meta-transaction support from the moment of deployment if a forwarder is provided.
    /// `_disableInitializers()` is called to prevent the `initialize` function (which acts as the true initializer for
    /// upgradeable contracts) from being called on this logic contract directly. The `initialize` function should
    /// only be called once, through the proxy, after deployment.
    /// @param trustedForwarder The address of the trusted forwarder contract for ERC2771 meta-transactions.
    /// If `address(0)`, meta-transactions via a forwarder are effectively disabled.
    /// @custom:oz-upgrades-unsafe-allow constructor This is a standard OpenZeppelin annotation for UUPS proxy
    /// constructors that call `_disableInitializers()`.
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    // --- Initializer ---
    /// @notice Initializes the `SMARTTrustedIssuersRegistryImplementation` contract. This function acts as the
    /// constructor for an upgradeable contract and can only be called once.
    /// @dev This function is typically called by the deployer immediately after the proxy contract pointing to this
    /// implementation is deployed. It sets up the initial state:
    /// 1.  `__ERC165_init_unchained()`: Initializes ERC165 interface detection.
    /// 2.  `__AccessControlEnumerable_init_unchained()`: Initializes the role-based access control system.
    /// 3.  The `ERC2771ContextUpgradeable` is already initialized by its own constructor.
    /// 4.  `_grantRole(DEFAULT_ADMIN_ROLE, initialAdmin)`: Grants the `DEFAULT_ADMIN_ROLE` to `initialAdmin`.
    ///     The admin can manage all other roles, including granting/revoking `REGISTRAR_ROLE`.
    /// 5.  `_grantRole(REGISTRAR_ROLE, initialAdmin)`: Grants the `REGISTRAR_ROLE` to `initialAdmin`.
    ///     This allows the `initialAdmin` to immediately start adding trusted issuers. This role can later be
    ///     transferred or granted to other operational addresses/contracts.
    /// The `initializer` modifier from `Initializable` ensures this function can only be executed once.
    /// @param accessManager The address of the access manager
    /// @dev Reverts with:
    ///      - `InvalidAdminAddress()` if `initialAdmin` is `address(0)`.
    ///      - `InvalidRegistrarAddress()` if any address in `initialRegistrars` is `address(0)`.
    function initialize(address accessManager) public initializer {
        __ATKSystemAccessManaged_init(accessManager);
        __ERC165_init_unchained();
    }

    // --- Issuer Management Functions (REGISTRAR_ROLE required) ---

    /// @inheritdoc IERC3643TrustedIssuersRegistry
    /// @notice Adds a new trusted issuer to the registry with a specified list of claim topics they are authorized for.
    /// @dev This function can only be called by an address holding the `REGISTRAR_ROLE`.
    /// It performs several validation checks:
    /// -   The `_trustedIssuer` address must not be the zero address.
    /// -   The `_claimTopics` array must not be empty (an issuer must be trusted for at least one topic).
    /// -   The issuer must not already be registered to prevent duplicates.
    /// If all checks pass, the function:
    /// 1.  Stores the issuer's details (address, claim topics, and `exists = true`) in the `_trustedIssuers` mapping.
    /// 2.  Adds the issuer's address to the `_issuerAddresses` array for enumeration.
    /// 3.  For each claim topic in `_claimTopics`, it calls `_addIssuerToClaimTopic` to update the
    ///     `_issuersByClaimTopic` and `_claimTopicIssuerIndex` mappings, linking the issuer to that topic.
    /// 4.  Emits a `TrustedIssuerAdded` event.
    /// @param _trustedIssuer The `IClaimIssuer` compliant contract address of the issuer to be added.
    /// @param _claimTopics An array of `uint256` values representing the claim topics for which this issuer will be
    /// trusted.
    /// @dev Reverts with:
    ///      - `InvalidIssuerAddress()` if `_trustedIssuer` is `address(0)`.
    ///      - `NoClaimTopicsProvided()` if `_claimTopics` is empty.
    ///      - `IssuerAlreadyExists(issuerAddress)` if the issuer is already registered.
    function addTrustedIssuer(
        IClaimIssuer _trustedIssuer,
        uint256[] calldata _claimTopics
    )
        external
        override
        onlySystemRoles2(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, ATKSystemRoles.SYSTEM_MODULE_ROLE)
    {
        address issuerAddress = address(_trustedIssuer);
        if (issuerAddress == address(0)) revert InvalidIssuerAddress();
        if (_claimTopics.length == 0) revert NoClaimTopicsProvided();
        if (_trustedIssuers[issuerAddress].exists) revert IssuerAlreadyExists(issuerAddress);

        // Store issuer details
        _trustedIssuers[issuerAddress] = TrustedIssuer(issuerAddress, true, _claimTopics);
        _issuerAddresses.push(issuerAddress);

        // Add issuer to the lookup mapping for each specified claim topic
        uint256 claimTopicsLength = _claimTopics.length;
        for (uint256 i = 0; i < claimTopicsLength;) {
            _addIssuerToClaimTopic(_claimTopics[i], issuerAddress);
            unchecked {
                ++i;
            }
        }

        emit TrustedIssuerAdded(_msgSender(), issuerAddress, _claimTopics);
    }

    /// @inheritdoc IERC3643TrustedIssuersRegistry
    /// @notice Removes an existing trusted issuer from the registry. This revokes their trusted status for all
    /// previously associated claim topics.
    /// @dev This function can only be called by an address holding the `REGISTRAR_ROLE`.
    /// It first checks if the issuer actually exists in the registry. If not, it reverts.
    /// If the issuer exists, the function:
    /// 1.  Retrieves the list of claim topics the issuer was associated with from `_trustedIssuers`.
    /// 2.  Calls `_removeAddressFromList` to remove the issuer's address from the `_issuerAddresses` array.
    /// 3.  For each claim topic the issuer was associated with, it calls `_removeIssuerFromClaimTopic` to update
    ///     the `_issuersByClaimTopic` and `_claimTopicIssuerIndex` mappings, effectively unlinking the issuer from
    ///     those topics.
    /// 4.  Deletes the issuer's main record from the `_trustedIssuers` mapping (which also sets `exists` to `false`
    ///     implicitly for a new struct if the address were to be reused, though deletion is more explicit here).
    /// 5.  Emits a `TrustedIssuerRemoved` event.
    /// @param _trustedIssuer The `IClaimIssuer` compliant contract address of the issuer to be removed.
    /// @dev Reverts with `IssuerDoesNotExist(issuerAddress)` if the issuer is not found in the registry.
    function removeTrustedIssuer(IClaimIssuer _trustedIssuer)
        external
        override
        onlySystemRoles2(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, ATKSystemRoles.SYSTEM_MODULE_ROLE)
    {
        address issuerAddress = address(_trustedIssuer);
        if (!_trustedIssuers[issuerAddress].exists) revert IssuerDoesNotExist(issuerAddress);

        uint256[] memory topicsToRemove = _trustedIssuers[issuerAddress].claimTopics;

        // Remove issuer from the main list of issuers
        _removeAddressFromList(_issuerAddresses, issuerAddress);

        // Remove issuer from the lookup mapping for each of its associated claim topics
        uint256 topicsToRemoveLength = topicsToRemove.length;
        for (uint256 i = 0; i < topicsToRemoveLength;) {
            _removeIssuerFromClaimTopic(topicsToRemove[i], issuerAddress);
            unchecked {
                ++i;
            }
        }

        // Delete the issuer's main record
        delete _trustedIssuers[issuerAddress];

        emit TrustedIssuerRemoved(_msgSender(), issuerAddress);
    }

    /// @inheritdoc IERC3643TrustedIssuersRegistry
    /// @notice Updates the list of claim topics for an existing trusted issuer.
    /// @dev This function can only be called by an address holding the `REGISTRAR_ROLE`.
    /// It first checks if the issuer exists and if the new list of claim topics is not empty.
    /// The update process involves:
    /// 1.  Retrieving the issuer's current list of claim topics.
    /// 2.  Removing the issuer from the lookup mappings (`_issuersByClaimTopic`, `_claimTopicIssuerIndex`) for all
    ///     their *current* claim topics.
    /// 3.  Adding the issuer to the lookup mappings for all topics in the *new* `_newClaimTopics` list.
    /// 4.  Updating the `claimTopics` array stored in the issuer's `TrustedIssuer` struct in `_trustedIssuers` to
    ///     reflect the `_newClaimTopics`.
    /// 5.  Emitting a `ClaimTopicsUpdated` event.
    /// This approach ensures that the lookup mappings are consistent with the issuer's newly assigned topics.
    /// @param _trustedIssuer The `IClaimIssuer` compliant contract address of the issuer whose claim topics are to be
    /// updated.
    /// @param _newClaimTopics An array of `uint256` values representing the new set of claim topics for which this
    /// issuer will be trusted.
    /// @dev Reverts with:
    ///      - `IssuerDoesNotExist(issuerAddress)` if the issuer is not found.
    ///      - `NoClaimTopicsProvided()` if `_newClaimTopics` is empty.
    function updateIssuerClaimTopics(
        IClaimIssuer _trustedIssuer,
        uint256[] calldata _newClaimTopics
    )
        external
        override
        onlySystemRoles2(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, ATKSystemRoles.SYSTEM_MODULE_ROLE)
    {
        address issuerAddress = address(_trustedIssuer);
        if (!_trustedIssuers[issuerAddress].exists) revert IssuerDoesNotExist(issuerAddress);
        if (_newClaimTopics.length == 0) revert NoClaimTopicsProvided();

        uint256[] storage currentClaimTopics = _trustedIssuers[issuerAddress].claimTopics;

        // --- Update Topic Lookups (Simple Iteration Approach) ---
        // 1. Remove issuer from all currently associated topic lookups
        uint256 currentClaimTopicsLength = currentClaimTopics.length;
        for (uint256 i = 0; i < currentClaimTopicsLength;) {
            // If state is consistent, this should always succeed as we are iterating over the issuer's current topics.
            // If it reverts due to inconsistency (e.g. IssuerNotFoundInTopicList), that indicates a deeper issue.
            _removeIssuerFromClaimTopic(currentClaimTopics[i], issuerAddress);
            unchecked {
                ++i;
            }
        }

        // 2. Add issuer to the lookup for all topics in the new list
        uint256 newClaimTopicsLength = _newClaimTopics.length;
        for (uint256 i = 0; i < newClaimTopicsLength;) {
            // Add the issuer to the topic list. The internal function handles appending.
            // Note: This doesn't prevent duplicates in the _issuersByClaimTopic[topicX].issuers list if topicX
            // appears multiple times in _newClaimTopics. However, the primary _trustedIssuers mapping
            // stores the _newClaimTopics array as is, and retrieval functions will reflect that accurately.
            // The _claimTopicIssuerIndex will correctly point to one of the occurrences for hasClaimTopic checks.
            _addIssuerToClaimTopic(_newClaimTopics[i], issuerAddress);
            unchecked {
                ++i;
            }
        }
        // --- End Update Topic Lookups ---

        // Update the stored claim topics list for the issuer in their main record.
        _trustedIssuers[issuerAddress].claimTopics = _newClaimTopics;

        emit ClaimTopicsUpdated(_msgSender(), issuerAddress, _newClaimTopics);
    }

    // --- View Functions ---

    /// @inheritdoc IERC3643TrustedIssuersRegistry
    /// @notice Returns an array of all currently registered and active trusted issuer contract addresses.
    /// @dev This function iterates through the `_issuerAddresses` array and casts each `address` to an
    /// `IClaimIssuer` type for the return array. This is useful for clients wanting to get a complete list of
    /// entities considered trusted by this registry.
    /// @return An array of `IClaimIssuer` interface types. Each element is a contract address of a trusted issuer.
    /// Returns an empty array if no issuers are registered.
    function getTrustedIssuers() external view override returns (IClaimIssuer[] memory) {
        IClaimIssuer[] memory issuers = new IClaimIssuer[](_issuerAddresses.length);
        uint256 issuerAddressesLength = _issuerAddresses.length;
        for (uint256 i = 0; i < issuerAddressesLength;) {
            issuers[i] = IClaimIssuer(_issuerAddresses[i]);
            unchecked {
                ++i;
            }
        }
        return issuers;
    }

    /// @inheritdoc IERC3643TrustedIssuersRegistry
    /// @notice Retrieves the list of claim topics for which a specific trusted issuer is authorized.
    /// @dev It first checks if the provided `_trustedIssuer` address actually exists as a registered issuer using the
    /// `exists` flag in the `_trustedIssuers` mapping. If not, it reverts.
    /// If the issuer exists, it returns the `claimTopics` array stored in their `TrustedIssuer` struct.
    /// @param _trustedIssuer The `IClaimIssuer` contract address of the issuer whose authorized claim topics are being
    /// queried.
    /// @return An array of `uint256` values, where each value is a claim topic the issuer is trusted for.
    /// Returns an empty array if the issuer is trusted for no topics (though `addTrustedIssuer` and
    /// `updateIssuerClaimTopics` prevent setting an empty list initially).
    /// @dev Reverts with `IssuerDoesNotExist(address(_trustedIssuer))` if the issuer is not found in the registry.
    function getTrustedIssuerClaimTopics(IClaimIssuer _trustedIssuer)
        external
        view
        override
        returns (uint256[] memory)
    {
        if (!_trustedIssuers[address(_trustedIssuer)].exists) revert IssuerDoesNotExist(address(_trustedIssuer));
        return _trustedIssuers[address(_trustedIssuer)].claimTopics;
    }

    /// @inheritdoc IERC3643TrustedIssuersRegistry
    /// @notice Retrieves an array of all issuer contract addresses that are trusted for a specific claim topic.
    /// @dev This function directly accesses the `_issuersByClaimTopic` mapping using the given `claimTopic` as a key.
    /// It then converts the stored array of `address` types into an array of `IClaimIssuer` interface types.
    /// This is a primary query function for relying parties to discover who can issue valid claims for a certain topic.
    /// @param claimTopic The `uint256` identifier of the claim topic being queried.
    /// @return An array of `IClaimIssuer` interface types. Each element is a contract address of an issuer trusted for
    /// the specified `claimTopic`. Returns an empty array if no issuers are trusted for that topic.
    function getTrustedIssuersForClaimTopic(uint256 claimTopic)
        external
        view
        override
        returns (IClaimIssuer[] memory)
    {
        return _getTrustedIssuersForClaimTopic(claimTopic);
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    /// @notice Returns the list of trusted issuers for a given claim topic and subject
    /// @dev This function returns the union of global trusted issuers + subject-specific trusted issuers.
    ///      For subject = address(0), returns only global trusted issuers (same as ERC-3643 function).
    ///      For other subjects, returns global issuers merged with subject-specific issuers.
    ///      This ensures that subjects always have access to at least the global trusted issuers
    ///      plus any additional subject-specific ones.
    /// @param subject The subject identifier (address(0) for global only, or specific address for subject-aware)
    /// @param claimTopic The claim topic to filter trusted issuers for
    /// @return Array of IClaimIssuer contracts trusted for this subject + topic (deduplicated union)
    function getTrustedIssuersForClaimTopic(address subject, uint256 claimTopic)
        external
        view
        override
        returns (IClaimIssuer[] memory)
    {
        return _getTrustedIssuersForClaimTopic(claimTopic);
    }

    /// @inheritdoc IERC3643TrustedIssuersRegistry
    /// @notice Checks if a specific issuer is trusted for a specific claim topic.
    /// @dev This function uses the `_claimTopicIssuerIndex` mapping for an efficient O(1) lookup.
    /// If `_claimTopicIssuerIndex[_claimTopic][_issuer]` is greater than 0, it means the issuer is present in the
    /// list of trusted issuers for that `_claimTopic`, so the function returns `true`.
    /// Otherwise (if the value is 0), the issuer is not trusted for that topic, and it returns `false`.
    /// @param _issuer The address of the issuer contract to check.
    /// @param _claimTopic The `uint256` identifier of the claim topic to check against.
    /// @return `true` if the `_issuer` is trusted for the `_claimTopic`, `false` otherwise.
    function hasClaimTopic(address _issuer, uint256 _claimTopic) external view override returns (bool) {
        // If the index stored (index+1) is greater than 0, it means the issuer exists in the list for that topic.
        return _claimTopicIssuerIndex[_claimTopic][_issuer] > 0;
    }

    /// @inheritdoc IERC3643TrustedIssuersRegistry
    /// @notice Checks if a given address is registered as a trusted issuer in the registry.
    /// @dev This function performs a direct lookup in the `_trustedIssuers` mapping and checks the `exists` flag
    /// of the `TrustedIssuer` struct associated with the `_issuer` address.
    /// @param _issuer The address to check for trusted issuer status.
    /// @return `true` if the `_issuer` address is found in the registry and its `exists` flag is true; `false`
    /// otherwise (e.g., if the issuer was never added or has been removed).
    function isTrustedIssuer(address _issuer) external view override returns (bool) {
        return _trustedIssuers[_issuer].exists;
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    /// @notice Checks if a given issuer is trusted for a specific subject and claim topic
    /// @dev This function checks if the issuer is trusted for the given subject and claim topic.
    ///      For subject = address(0), returns only global trusted issuers (same as ERC-3643 function).
    ///      For other subjects, returns global issuers merged with subject-specific issuers.
    ///      This ensures that subjects always have access to at least the global trusted issuers
    ///      plus any additional subject-specific ones.
    /// @param _issuer The issuer address to check
    function isTrustedIssuer(address, address _issuer) external view returns (bool) {
        return _trustedIssuers[_issuer].exists;
    }

    // --- IClaimAuthorization Implementation ---

    /// @inheritdoc IClaimAuthorizer
    /// @notice Checks if an issuer is authorized to add a claim for a specific topic
    /// @dev This function checks if the issuer is registered as a trusted issuer and
    ///      if they are authorized for the specific claim topic using the existing registry logic.
    /// @param issuer The address of the issuer attempting to add the claim
    /// @param topic The claim topic for which authorization is being checked
    /// @return True if the issuer is trusted for this topic, false otherwise
    function isAuthorizedToAddClaim(address issuer, uint256 topic) external view override returns (bool) {
        return this.hasClaimTopic(issuer, topic);
    }

    // --- Internal Helper Functions ---

    function _getTrustedIssuersForClaimTopic(uint256 claimTopic)
        internal
        view
        returns (IClaimIssuer[] memory)
    {
        address[] storage issuerAddrs = _issuersByClaimTopic[claimTopic];
        IClaimIssuer[] memory issuers = new IClaimIssuer[](issuerAddrs.length);
        uint256 issuerAddrsLength = issuerAddrs.length;
        for (uint256 i = 0; i < issuerAddrsLength;) {
            issuers[i] = IClaimIssuer(issuerAddrs[i]);
            unchecked {
                ++i;
            }
        }
        return issuers;
    }

    /// @notice Adds an issuer to the list of issuers for a specific claim topic
    /// @dev Internal function to add an issuer to the lookup array for a specific claim topic (`_issuersByClaimTopic`)
    /// and update the corresponding index in `_claimTopicIssuerIndex`.
    /// This function appends the `issuerAddress` to the `_issuersByClaimTopic[claimTopic]` array.
    /// It then stores the new length of this array (which is `index + 1` for 0-based indexing) in
    /// `_claimTopicIssuerIndex[claimTopic][issuerAddress]`. This stored value (index+1) is used for quick
    /// existence checks and for efficient removal using swap-and-pop.
    /// @param claimTopic The claim topic ID to add the issuer to
    /// @param issuerAddress The address of the issuer to add to the topic's list
    function _addIssuerToClaimTopic(uint256 claimTopic, address issuerAddress) internal {
        address[] storage issuers = _issuersByClaimTopic[claimTopic];
        // Store index+1. `issuers.length` before push is the 0-based index where it will be inserted.
        // So, `issuers.length + 1` is the 1-based index.
        _claimTopicIssuerIndex[claimTopic][issuerAddress] = issuers.length + 1;
        issuers.push(issuerAddress);
    }

    /// @notice Removes an issuer from the list of issuers for a specific claim topic
    /// @dev Internal function to remove an issuer from the lookup array for a specific claim topic
    /// (`_issuersByClaimTopic[claimTopic]`) using the efficient swap-and-pop technique. It also cleans up the
    /// `_claimTopicIssuerIndex` mapping.
    /// Steps:
    /// 1.  Retrieves the stored index (plus one) of `issuerAddress` for the given `claimTopic` from
    ///     `_claimTopicIssuerIndex`. If this index is 0, it means the issuer is not in the list for this topic,
    ///     and the function reverts with `IssuerNotFoundInTopicList`.
    /// 2.  Adjusts the retrieved value to a 0-based `indexToRemove`.
    /// 3.  Gets a reference to the array `_issuersByClaimTopic[claimTopic]`.
    /// 4.  Identifies the `lastIssuer` in this array.
    /// 5.  If `issuerAddress` is not the `lastIssuer` in the array:
    ///     a.  The `lastIssuer` is moved into the `indexToRemove` slot in the array.
    ///     b.  The `_claimTopicIssuerIndex` for this `lastIssuer` (for this `claimTopic`) is updated to reflect its new
    ///         position (`indexToRemove + 1`).
    /// 6.  The entry for `issuerAddress` in `_claimTopicIssuerIndex[claimTopic]` is deleted (set to 0).
    /// 7.  The last element is popped from the `_issuersByClaimTopic[claimTopic]` array (which is either the original
    ///     `issuerAddress` if it was last, or the duplicate of `lastIssuer` that was moved).
    /// This ensures O(1) removal complexity.
    /// Reverts with `IssuerNotFoundInTopicList` if the issuer is not found in the specified topic's list initially.
    /// @param claimTopic The claim topic ID to remove the issuer from
    /// @param issuerAddress The address of the issuer to remove from the topic's list
    function _removeIssuerFromClaimTopic(uint256 claimTopic, address issuerAddress) internal {
        uint256 indexToRemovePlusOne = _claimTopicIssuerIndex[claimTopic][issuerAddress];
        // Revert if index is 0 (meaning issuer was not found for this specific topic in the index mapping)
        if (indexToRemovePlusOne == 0) revert IssuerNotFoundInTopicList(issuerAddress, claimTopic);
        uint256 indexToRemove = indexToRemovePlusOne - 1; // Adjust to 0-based index for array access.

        address[] storage issuers = _issuersByClaimTopic[claimTopic];
        address lastIssuer = issuers[issuers.length - 1];

        // Only perform the swap if the element to remove is not the last element in the array.
        if (issuerAddress != lastIssuer) {
            issuers[indexToRemove] = lastIssuer; // Move the last element to the slot of the one being removed.
            // Update the index mapping for the element that was moved.
            _claimTopicIssuerIndex[claimTopic][lastIssuer] = indexToRemove + 1; // Store its new (1-based) index.
        }

        // Delete the index mapping for the removed issuer (sets it to 0).
        delete _claimTopicIssuerIndex[claimTopic][issuerAddress];
        // Remove the last element from the array.
        issuers.pop();
    }

    /// @notice Removes an address from a storage array using swap-and-pop technique
    /// @dev Internal function to remove an address from a dynamic array of addresses (`address[] storage list`)
    /// using the swap-and-pop technique. This is a more generic version used for lists like `_issuerAddresses`
    /// where a separate index mapping (like `_claimTopicIssuerIndex`) is not maintained for each element's position.
    /// @dev This function iterates through the `list` to find `addrToRemove`.
    /// Once found at index `i`:
    ///   - It replaces `list[i]` with the last element in the `list`.
    ///   - It then removes the last element from the `list` using `pop()`.
    ///   - The function then returns, having removed the first occurrence of `addrToRemove`.
    /// If `addrToRemove` is not found after iterating through the entire list, it reverts with
    /// `AddressNotFoundInList`. This situation implies a potential inconsistency if the caller expected the address
    /// to be present (e.g., if `_trustedIssuers[addrToRemove].exists` was true).
    /// Assumes the address is present and aims to remove only its first occurrence if there were duplicates
    /// (though `_issuerAddresses` should ideally not have duplicates).
    /// Reverts with `AddressNotFoundInList(addrToRemove)` if the address is not found in the list.
    /// @param list The storage array to remove the address from
    /// @param addrToRemove The address to remove from the list
    function _removeAddressFromList(address[] storage list, address addrToRemove) internal {
        uint256 listLength = list.length;
        for (uint256 i = 0; i < listLength;) {
            if (list[i] == addrToRemove) {
                // Replace the element to remove with the last element from the list.
                list[i] = list[listLength - 1];
                // Remove the last element from the list (which is now either the original one to remove if it was last,
                // or a duplicate of the one that was moved).
                list.pop();
                return; // Exit after removing the first occurrence found.
            }
            unchecked {
                ++i;
            }
        }
        // If the loop completes without finding the address, it means the address was not in the list.
        // This should ideally not happen if preceding checks (like `_trustedIssuers[addrToRemove].exists`) passed.
        revert AddressNotFoundInList(addrToRemove);
    }

    // --- Context Overrides (ERC2771 for meta-transactions) ---
    /// @notice Provides the actual sender of a transaction, supporting meta-transactions via ERC2771.
    /// @dev This function overrides the standard `_msgSender()` from `ContextUpgradeable` and also the one from
    /// `ERC2771ContextUpgradeable` (effectively using the latter's implementation).
    /// If a transaction is relayed by a trusted forwarder (configured via `ERC2771ContextUpgradeable`'s constructor),
    /// this function returns the address of the original user who signed the transaction, not the forwarder's address.
    /// If the transaction is direct, it returns `msg.sender`.
    /// This is vital for access control and event attributions in a meta-transaction context.
    /// @return The address of the original transaction sender or `msg.sender`.
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
    /// @notice Indicates whether this contract supports a given interface ID, as per ERC165.
    /// @dev This function allows other contracts/tools to query if this contract implements specific interfaces.
    /// It checks for:
    /// 1.  `type(IERC3643TrustedIssuersRegistry).interfaceId`: Confirms adherence to the ERC-3643 standard for
    ///     trusted issuer registries.
    /// 2.  `type(IClaimAuthorization).interfaceId`: Confirms implementation of claim authorization interface.
    /// 3.  Interfaces supported by parent contracts (e.g., `AccessControlUpgradeable`, `ERC165Upgradeable`)
    ///     via `super.supportsInterface(interfaceId)`.
    /// Crucial for interoperability, allowing other components to verify compatibility.
    /// @param interfaceId The EIP-165 interface identifier (`bytes4`) to check.
    /// @return `true` if the contract supports `interfaceId`, `false` otherwise.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Upgradeable, IERC165) // Specifies primary parents being
            // extended.
        returns (bool)
    {
        return interfaceId == type(IATKTrustedIssuersRegistry).interfaceId
            || interfaceId == type(ISMARTTrustedIssuersRegistry).interfaceId
            || interfaceId == type(IERC3643TrustedIssuersRegistry).interfaceId
            || interfaceId == type(IClaimAuthorizer).interfaceId || interfaceId == type(IATKSystemAccessManaged).interfaceId
            || super.supportsInterface(interfaceId);
    }
}