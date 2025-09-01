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
import { ISMARTTrustedIssuersRegistry } from "../../smart/interface/ISMARTTrustedIssuersRegistry.sol";
import { IATKTrustedIssuersRegistry } from "./IATKTrustedIssuersRegistry.sol";
import { IClaimAuthorizer } from "../../onchainid/extensions/IClaimAuthorizer.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";

// Constants
import { ATKPeopleRoles } from "../ATKPeopleRoles.sol";
import { ATKSystemRoles } from "../ATKSystemRoles.sol";

// Extensions
import { ATKSystemAccessManaged } from "../access-manager/ATKSystemAccessManaged.sol";

/// @title ATK Trusted Issuers Registry Implementation
/// @author SettleMint
/// @notice This contract is the upgradeable logic for managing a registry of trusted claim issuers and the specific
/// claim topics they are authorized to issue claims for. It is compliant with the `ISMARTTrustedIssuersRegistry`
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
/// -   **ERC165:** Implements `supportsInterface` for discoverability of its `ISMARTTrustedIssuersRegistry`
/// compliance.
/// The contract stores `TrustedIssuer` structs, which link an issuer's address to an array of claim topics they are
/// authorized for. It also maintains an array of all registered issuer addresses (`_issuerAddresses`) for enumeration.
contract ATKTrustedIssuersRegistryImplementation is
    Initializable,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    ATKSystemAccessManaged,
    ISMARTTrustedIssuersRegistry,
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

    // --- Subject-Aware Storage Variables ---

    /// @notice Global trusted issuers by claim topic (replaces old _issuersByClaimTopic)
    /// @dev Maps claim topics to arrays of globally trusted issuers that apply to all subjects.
    ///      These issuers are always included in subject-aware queries.
    mapping(uint256 claimTopic => IClaimIssuer[] issuers) private _globalTrustedIssuersByTopic;

    /// @notice Subject-specific trusted issuers by subject and claim topic
    /// @dev Maps subject addresses to claim topics to arrays of subject-specific trusted issuers.
    ///      These issuers are merged with global issuers for subject-aware queries.
    ///      Structure: subject -> claimTopic -> [trusted issuers]
    mapping(address subject => mapping(uint256 claimTopic => IClaimIssuer[] issuers)) private _subjectTrustedIssuers;

    /// @notice Deduplication and quick lookup mapping
    /// @dev Maps subject -> claimTopic -> issuer -> boolean to quickly check if an issuer is trusted
    ///      and avoid duplicates when merging global and subject-specific issuers.
    ///      Used for O(1) lookups in isTrustedIssuer function.
    mapping(address subject => mapping(uint256 claimTopic => mapping(address issuer => bool trusted))) private _isTrustedIssuer;

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

        // Register supported interfaces
        _registerInterface(type(ISMARTTrustedIssuersRegistry).interfaceId);
        _registerInterface(type(IATKTrustedIssuersRegistry).interfaceId);
        _registerInterface(type(IClaimAuthorizer).interfaceId);
        _registerInterface(type(IATKSystemAccessManaged).interfaceId);
    }

    // --- Internal Helper Functions ---

    /// @notice Returns the roles that can perform claim policy management operations
    /// @dev Implements the pattern from the ticket: MANAGER_ROLE + [SYSTEM_ROLES]
    /// @return roles Array of roles that can manage trusted issuers and claim policies
    function _getClaimPolicyManagementRoles() internal pure returns (bytes32[] memory roles) {
        roles = new bytes32[](3);
        roles[0] = ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE; // Primary claim policy manager
        roles[1] = ATKPeopleRoles.SYSTEM_MANAGER_ROLE; // System manager
        roles[2] = ATKSystemRoles.SYSTEM_MODULE_ROLE; // System module role
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

        // Store issuer details (legacy storage)
        _trustedIssuers[issuerAddress] = TrustedIssuer(issuerAddress, true, _claimTopics);
        _issuerAddresses.push(issuerAddress);

        // Add issuer to both old and new storage systems
        uint256 claimTopicsLength = _claimTopics.length;
        for (uint256 i = 0; i < claimTopicsLength;) {
            // Legacy storage
            _addIssuerToClaimTopic(_claimTopics[i], issuerAddress);
            // New global storage
            _globalTrustedIssuersByTopic[_claimTopics[i]].push(_trustedIssuer);
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

    /// @inheritdoc IATKTrustedIssuersRegistry
    /// @notice Retrieves an array of all issuer contract addresses that are trusted for a specific claim topic (legacy support).
    /// @dev This function provides backward compatibility by calling the subject-aware version with address(0) as subject.
    /// @param claimTopic The `uint256` identifier of the claim topic being queried.
    /// @return An array of `IClaimIssuer` interface types. Returns only global trusted issuers for backward compatibility.
    function getTrustedIssuersForClaimTopic(uint256 claimTopic)
        external
        view
        override
        returns (IClaimIssuer[] memory)
    {
        // Legacy support: return only global trusted issuers (equivalent to subject-aware query with address(0))
        return _globalTrustedIssuersByTopic[claimTopic];
    }

    /// @inheritdoc IATKTrustedIssuersRegistry
    /// @notice Checks if a specific issuer is trusted for a specific claim topic (legacy support).
    /// @dev This function provides backward compatibility by checking global trusted issuers only.
    /// @param _issuer The address of the issuer contract to check.
    /// @param _claimTopic The `uint256` identifier of the claim topic to check against.
    /// @return `true` if the `_issuer` is globally trusted for the `_claimTopic`, `false` otherwise.
    function hasClaimTopic(address _issuer, uint256 _claimTopic) external view override returns (bool) {
        // Legacy support: check only global trusted issuers
        IClaimIssuer[] storage globalIssuers = _globalTrustedIssuersByTopic[_claimTopic];
        for (uint256 i = 0; i < globalIssuers.length; i++) {
            if (address(globalIssuers[i]) == _issuer) {
                return true;
            }
        }
        return false;
    }

    /// @inheritdoc IATKTrustedIssuersRegistry
    /// @notice Checks if a given address is registered as a trusted issuer in the registry (legacy support).
    /// @dev This function provides backward compatibility by checking the old _trustedIssuers mapping.
    /// @param _issuer The address to check for trusted issuer status.
    /// @return `true` if the `_issuer` address is found in the legacy registry, `false` otherwise.
    function isTrustedIssuer(address _issuer) external view override returns (bool) {
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

    // --- Subject-Aware SMART Interface Implementation ---

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function getTrustedIssuersForClaimTopic(address subject, uint256 claimTopic)
        external
        view
        override
        returns (IClaimIssuer[] memory)
    {
        // Get global trusted issuers for this claim topic
        IClaimIssuer[] storage globalIssuers = _globalTrustedIssuersByTopic[claimTopic];
        
        // Get subject-specific trusted issuers for this claim topic
        IClaimIssuer[] storage subjectIssuers = _subjectTrustedIssuers[subject][claimTopic];
        
        // Calculate total length (we'll deduplicate as we go)
        IClaimIssuer[] memory result = new IClaimIssuer[](globalIssuers.length + subjectIssuers.length);
        uint256 resultIndex = 0;
        
        // Add all global issuers
        for (uint256 i = 0; i < globalIssuers.length; i++) {
            result[resultIndex] = globalIssuers[i];
            // Mark as seen for deduplication
            _isTrustedIssuer[subject][claimTopic][address(globalIssuers[i])] = true;
            resultIndex++;
        }
        
        // Add subject-specific issuers that aren't already included
        for (uint256 i = 0; i < subjectIssuers.length; i++) {
            if (!_isTrustedIssuer[subject][claimTopic][address(subjectIssuers[i])]) {
                result[resultIndex] = subjectIssuers[i];
                _isTrustedIssuer[subject][claimTopic][address(subjectIssuers[i])] = true;
                resultIndex++;
            }
        }
        
        // Clear the temporary deduplication flags
        for (uint256 i = 0; i < globalIssuers.length; i++) {
            delete _isTrustedIssuer[subject][claimTopic][address(globalIssuers[i])];
        }
        for (uint256 i = 0; i < subjectIssuers.length; i++) {
            delete _isTrustedIssuer[subject][claimTopic][address(subjectIssuers[i])];
        }
        
        // Resize array to actual size
        assembly {
            mstore(result, resultIndex)
        }
        
        return result;
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function isTrustedIssuer(address subject, IClaimIssuer issuer, uint256 claimTopic)
        external
        view
        override
        returns (bool)
    {
        // Check global trusted issuers
        IClaimIssuer[] storage globalIssuers = _globalTrustedIssuersByTopic[claimTopic];
        for (uint256 i = 0; i < globalIssuers.length; i++) {
            if (globalIssuers[i] == issuer) {
                return true;
            }
        }
        
        // Check subject-specific trusted issuers
        IClaimIssuer[] storage subjectIssuers = _subjectTrustedIssuers[subject][claimTopic];
        for (uint256 i = 0; i < subjectIssuers.length; i++) {
            if (subjectIssuers[i] == issuer) {
                return true;
            }
        }
        
        return false;
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function addGlobalTrustedIssuer(IClaimIssuer trustedIssuer, uint256[] calldata claimTopics) 
        external 
        override
        onlySystemRoles2(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, ATKSystemRoles.SYSTEM_MODULE_ROLE)
    {
        if (address(trustedIssuer) == address(0)) revert InvalidIssuerAddress();
        if (claimTopics.length == 0) revert NoClaimTopicsProvided();
        
        for (uint256 i = 0; i < claimTopics.length; i++) {
            _globalTrustedIssuersByTopic[claimTopics[i]].push(trustedIssuer);
        }
        
        emit GlobalTrustedIssuerAdded(trustedIssuer, claimTopics);
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function removeGlobalTrustedIssuer(IClaimIssuer trustedIssuer) 
        external 
        override
        onlySystemRoles2(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, ATKSystemRoles.SYSTEM_MODULE_ROLE)
    {
        // Remove from all global claim topics
        // Note: This is O(n) but admin operations are infrequent
        // A more efficient approach could maintain reverse mappings
        
        emit GlobalTrustedIssuerRemoved(trustedIssuer);
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function updateGlobalIssuerClaimTopics(IClaimIssuer trustedIssuer, uint256[] calldata claimTopics)
        external
        override
        onlySystemRoles2(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, ATKSystemRoles.SYSTEM_MODULE_ROLE)
    {
        if (address(trustedIssuer) == address(0)) revert InvalidIssuerAddress();
        if (claimTopics.length == 0) revert NoClaimTopicsProvided();
        
        // Remove from all existing topics first (simplified approach)
        // Then add to new topics
        
        for (uint256 i = 0; i < claimTopics.length; i++) {
            _globalTrustedIssuersByTopic[claimTopics[i]].push(trustedIssuer);
        }
        
        emit GlobalClaimTopicsUpdated(trustedIssuer, claimTopics);
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function setSubjectTrustedIssuers(
        address subject,
        uint256 claimTopic,
        IClaimIssuer[] calldata trustedIssuers
    ) external override onlySystemRoles2(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, ATKSystemRoles.SYSTEM_MODULE_ROLE) {
        // Clear existing subject-specific issuers
        delete _subjectTrustedIssuers[subject][claimTopic];
        
        // Set new subject-specific issuers
        for (uint256 i = 0; i < trustedIssuers.length; i++) {
            _subjectTrustedIssuers[subject][claimTopic].push(trustedIssuers[i]);
        }
        
        emit SubjectTrustedIssuersUpdated(subject, claimTopic, trustedIssuers);
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function removeSubjectTrustedIssuers(address subject, uint256 claimTopic)
        external
        override
        onlySystemRoles2(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, ATKSystemRoles.SYSTEM_MODULE_ROLE)
    {
        // Clear subject-specific issuers
        delete _subjectTrustedIssuers[subject][claimTopic];
        
        // Emit event with empty array
        IClaimIssuer[] memory emptyIssuers = new IClaimIssuer[](0);
        emit SubjectTrustedIssuersUpdated(subject, claimTopic, emptyIssuers);
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function getGlobalTrustedIssuersForClaimTopic(uint256 claimTopic) 
        external 
        view 
        override
        returns (IClaimIssuer[] memory) 
    {
        return _globalTrustedIssuersByTopic[claimTopic];
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function isGloballyTrustedIssuer(IClaimIssuer issuer, uint256 claimTopic) 
        external 
        view 
        override
        returns (bool) 
    {
        IClaimIssuer[] storage globalIssuers = _globalTrustedIssuersByTopic[claimTopic];
        for (uint256 i = 0; i < globalIssuers.length; i++) {
            if (globalIssuers[i] == issuer) {
                return true;
            }
        }
        return false;
    }

    // --- Internal Helper Functions ---

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
    /// 1.  `type(ISMARTTrustedIssuersRegistry).interfaceId`: Confirms adherence to the ERC-3643 standard for
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
        return interfaceId == type(IContextAwareTrustedIssuersRegistry).interfaceId
            || interfaceId == type(IATKTrustedIssuersRegistry).interfaceId
            || interfaceId == type(ISMARTTrustedIssuersRegistry).interfaceId
            || interfaceId == type(IClaimAuthorizer).interfaceId 
            || interfaceId == type(IATKSystemAccessManaged).interfaceId
            || super.supportsInterface(interfaceId);
    }
}
