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
import { IATKSystemTrustedIssuersRegistry } from "./IATKSystemTrustedIssuersRegistry.sol";
import { IATKTrustedIssuersRegistry } from "./IATKTrustedIssuersRegistry.sol";
import { ISMARTTrustedIssuersRegistry } from "../../smart/interface/ISMARTTrustedIssuersRegistry.sol";
import { IClaimAuthorizer } from "../../onchainid/extensions/IClaimAuthorizer.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";

// Constants
import { ATKPeopleRoles } from "../ATKPeopleRoles.sol";
import { ATKSystemRoles } from "../ATKSystemRoles.sol";

// Extensions
import { ATKSystemAccessManaged } from "../access-manager/ATKSystemAccessManaged.sol";

/// @title ATK System Trusted Issuers Registry Implementation
/// @author SettleMint
/// @notice This contract is the upgradeable logic for managing a registry of trusted claim issuers and the specific
/// claim topics they are authorized to issue claims for. It implements the system trusted issuers registry.
/// @dev This registry plays a crucial role in decentralized identity and verifiable credential systems. It allows
/// relying parties (e.g., smart contracts controlling access to tokenized assets) to verify if a claim presented by
/// a user was issued by an entity trusted for that particular type of claim (claim topic).
/// Key features:
/// -   **Upgradeable:** Uses the UUPS (Universal Upgradeable Proxy Standard) pattern, allowing the logic to be
///     updated without changing the contract address or losing data.
/// -   **Access Control:** Leverages system access management for role-based permissions.
/// -   **Efficient Lookups:** Maintains mappings to quickly find all trusted issuers for a given claim topic
///     and to check if a specific issuer is trusted for a specific topic.
/// -   **Meta-transactions:** Supports gasless transactions for users via ERC2771ContextUpgradeable if a trusted
///     forwarder is configured.
/// -   **ERC165:** Implements supportsInterface for discoverability of its supported interfaces.
/// The contract stores TrustedIssuer structs, which link an issuer's address to an array of claim topics they are
/// authorized for. It also maintains an array of all registered issuer addresses for enumeration.
contract ATKSystemTrustedIssuersRegistryImplementation is
    Initializable,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    ATKSystemAccessManaged,
    IATKSystemTrustedIssuersRegistry
{
    // --- Storage Variables ---

    /// @notice Defines a structure to hold the details for a trusted claim issuer
    struct TrustedIssuer {
        address issuer;
        bool exists;
        uint256[] claimTopics;
    }

    /// @notice Primary mapping that stores TrustedIssuer details, keyed by the issuer's contract address
    mapping(address issuerAddress => TrustedIssuer issuerDetails) private _trustedIssuers;

    /// @notice Array storing the addresses of all currently registered and active trusted issuers
    address[] private _issuerAddresses;

    /// @notice Mapping from claim topic to array of issuer addresses trusted for that topic
    mapping(uint256 claimTopic => address[] issuers) private _issuersByClaimTopic;

    /// @notice Mapping for efficient removal and existence check of an issuer within a claim topic's list
    mapping(uint256 claimTopic => mapping(address issuer => uint256 indexPlusOne)) private _claimTopicIssuerIndex;

    // --- Events defined in IATKTrustedIssuersRegistry ---

    // --- Errors ---

    /// @notice Error triggered if an attempt is made to add or interact with an issuer using a zero address
    error InvalidIssuerAddress();

    /// @notice Error triggered if an attempt is made to add or update an issuer with an empty list of claim topics
    error NoClaimTopicsProvided();

    /// @notice Error triggered when attempting to add an issuer that is already registered
    /// @param issuerAddress The address of the issuer that already exists
    error IssuerAlreadyExists(address issuerAddress);

    /// @notice Error triggered when attempting to operate on an issuer that is not registered
    /// @param issuerAddress The address of the issuer that was not found
    error IssuerDoesNotExist(address issuerAddress);

    /// @notice Error triggered during removal when issuer not found in claim topic list
    /// @param issuerAddress The address of the issuer that was expected but not found
    /// @param claimTopic The specific claim topic from which the issuer was being removed
    error IssuerNotFoundInTopicList(address issuerAddress, uint256 claimTopic);

    /// @notice Error triggered when an address is not found in a list during removal
    /// @param addr The address that was not found in the list
    error AddressNotFoundInList(address addr);

    // --- Constructor ---

    /// @notice Constructor for the ATKSystemTrustedIssuersRegistryImplementation
    /// @param trustedForwarder The address of the trusted forwarder for meta-transactions
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    // --- Initializer ---

    /// @notice Initializes the system trusted issuers registry
    /// @param accessManager The address of the access manager
    function initialize(address accessManager) public initializer {
        __ATKSystemAccessManaged_init(accessManager);
        __ERC165_init_unchained();
    }

    // --- System Registry Functions (no subject parameters) ---

    /// @inheritdoc IATKTrustedIssuersRegistry
    function addTrustedIssuer(IClaimIssuer _trustedIssuer, uint256[] calldata _claimTopics)
        external
        override
        onlySystemRoles3(
            ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE,
            ATKSystemRoles.SYSTEM_MODULE_ROLE,
            ATKSystemRoles.TRUSTED_ISSUERS_META_REGISTRY_MODULE_ROLE
        )
    {
        address issuerAddress = address(_trustedIssuer);
        if (issuerAddress == address(0)) revert InvalidIssuerAddress();
        if (_claimTopics.length == 0) revert NoClaimTopicsProvided();
        if (_trustedIssuers[issuerAddress].exists) revert IssuerAlreadyExists(issuerAddress);

        // Store issuer details
        _trustedIssuers[issuerAddress] =
            TrustedIssuer({ issuer: issuerAddress, exists: true, claimTopics: _claimTopics });
        _issuerAddresses.push(issuerAddress);

        // Add issuer to claim topic mappings
        uint256 claimTopicsLength = _claimTopics.length;
        for (uint256 i = 0; i < claimTopicsLength;) {
            _addIssuerToClaimTopic(_claimTopics[i], issuerAddress);
            unchecked {
                ++i;
            }
        }

        // Emit subject-aware event with address(0) as subject for system registry
        emit TrustedIssuerAdded(_msgSender(), _trustedIssuer, _claimTopics, address(0));
    }

    /// @inheritdoc IATKTrustedIssuersRegistry
    function removeTrustedIssuer(IClaimIssuer _trustedIssuer)
        external
        override
        onlySystemRoles3(
            ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE,
            ATKSystemRoles.SYSTEM_MODULE_ROLE,
            ATKSystemRoles.TRUSTED_ISSUERS_META_REGISTRY_MODULE_ROLE
        )
    {
        address issuerAddress = address(_trustedIssuer);
        if (!_trustedIssuers[issuerAddress].exists) revert IssuerDoesNotExist(issuerAddress);

        uint256[] memory topicsToRemove = _trustedIssuers[issuerAddress].claimTopics;

        // Remove issuer from main list
        _removeAddressFromList(_issuerAddresses, issuerAddress);

        // Remove issuer from claim topic mappings
        uint256 topicsToRemoveLength = topicsToRemove.length;
        for (uint256 i = 0; i < topicsToRemoveLength;) {
            _removeIssuerFromClaimTopic(topicsToRemove[i], issuerAddress);
            unchecked {
                ++i;
            }
        }

        // Delete the issuer's record
        delete _trustedIssuers[issuerAddress];

        // Emit subject-aware event with address(0) as subject for system registry
        emit TrustedIssuerRemoved(_msgSender(), _trustedIssuer, address(0));
    }

    /// @inheritdoc IATKTrustedIssuersRegistry
    function updateIssuerClaimTopics(IClaimIssuer _trustedIssuer, uint256[] calldata _newClaimTopics)
        external
        override
        onlySystemRoles3(
            ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE,
            ATKSystemRoles.SYSTEM_MODULE_ROLE,
            ATKSystemRoles.TRUSTED_ISSUERS_META_REGISTRY_MODULE_ROLE
        )
    {
        address issuerAddress = address(_trustedIssuer);
        if (!_trustedIssuers[issuerAddress].exists) revert IssuerDoesNotExist(issuerAddress);
        if (_newClaimTopics.length == 0) revert NoClaimTopicsProvided();

        uint256[] storage currentClaimTopics = _trustedIssuers[issuerAddress].claimTopics;

        // Remove issuer from all current claim topic mappings
        uint256 currentClaimTopicsLength = currentClaimTopics.length;
        for (uint256 i = 0; i < currentClaimTopicsLength;) {
            _removeIssuerFromClaimTopic(currentClaimTopics[i], issuerAddress);
            unchecked {
                ++i;
            }
        }

        // Add issuer to all new claim topic mappings
        uint256 newClaimTopicsLength = _newClaimTopics.length;
        for (uint256 i = 0; i < newClaimTopicsLength;) {
            _addIssuerToClaimTopic(_newClaimTopics[i], issuerAddress);
            unchecked {
                ++i;
            }
        }

        // Update stored claim topics
        _trustedIssuers[issuerAddress].claimTopics = _newClaimTopics;

        // Emit subject-aware event with address(0) as subject for system registry
        emit ClaimTopicsUpdated(_msgSender(), _trustedIssuer, _newClaimTopics, address(0));
    }

    // --- System Registry Functions (no subject parameters) ---

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function getTrustedIssuers(address) external view override returns (IClaimIssuer[] memory) {
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

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function getTrustedIssuersForClaimTopic(uint256 claimTopic, address)
        external
        view
        override
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

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function isTrustedIssuer(address _issuer, address) external view override returns (bool) {
        return _trustedIssuers[_issuer].exists;
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function hasClaimTopic(address _issuer, uint256 _claimTopic, address) external view override returns (bool) {
        return _claimTopicIssuerIndex[_claimTopic][_issuer] > 0;
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function getTrustedIssuerClaimTopics(IClaimIssuer _trustedIssuer, address)
        external
        view
        override
        returns (uint256[] memory)
    {
        address issuerAddress = address(_trustedIssuer);
        if (!_trustedIssuers[issuerAddress].exists) revert IssuerDoesNotExist(issuerAddress);

        return _trustedIssuers[address(_trustedIssuer)].claimTopics;
    }

    // --- IClaimAuthorizer Implementation ---

    /// @inheritdoc IClaimAuthorizer
    function isAuthorizedToAddClaim(address issuer, uint256 topic, address subject)
        external
        view
        override
        returns (bool)
    {
        return this.hasClaimTopic(issuer, topic, subject);
    }

    // --- Internal Helper Functions ---

    /// @notice Adds an issuer to the list for a specific claim topic
    /// @param claimTopic The claim topic to add the issuer to
    /// @param issuerAddress The address of the issuer to add
    function _addIssuerToClaimTopic(uint256 claimTopic, address issuerAddress) internal {
        address[] storage issuers = _issuersByClaimTopic[claimTopic];
        _claimTopicIssuerIndex[claimTopic][issuerAddress] = issuers.length + 1;
        issuers.push(issuerAddress);
    }

    /// @notice Removes an issuer from the list for a specific claim topic
    /// @param claimTopic The claim topic to remove the issuer from
    /// @param issuerAddress The address of the issuer to remove
    function _removeIssuerFromClaimTopic(uint256 claimTopic, address issuerAddress) internal {
        uint256 indexToRemovePlusOne = _claimTopicIssuerIndex[claimTopic][issuerAddress];
        if (indexToRemovePlusOne == 0) revert IssuerNotFoundInTopicList(issuerAddress, claimTopic);
        uint256 indexToRemove = indexToRemovePlusOne - 1;

        address[] storage issuers = _issuersByClaimTopic[claimTopic];
        address lastIssuer = issuers[issuers.length - 1];

        if (issuerAddress != lastIssuer) {
            issuers[indexToRemove] = lastIssuer;
            _claimTopicIssuerIndex[claimTopic][lastIssuer] = indexToRemove + 1;
        }

        delete _claimTopicIssuerIndex[claimTopic][issuerAddress];
        issuers.pop();
    }

    /// @notice Removes an address from a storage array using swap-and-pop technique
    /// @param list The storage array to remove the address from
    /// @param addrToRemove The address to remove
    function _removeAddressFromList(address[] storage list, address addrToRemove) internal {
        uint256 listLength = list.length;
        for (uint256 i = 0; i < listLength;) {
            if (list[i] == addrToRemove) {
                list[i] = list[listLength - 1];
                list.pop();
                return;
            }
            unchecked {
                ++i;
            }
        }
        revert AddressNotFoundInList(addrToRemove);
    }

    // --- Context Overrides (ERC2771 for meta-transactions) ---

    /// @notice Provides the actual sender of a transaction, supporting meta-transactions via ERC2771
    /// @return The address of the original transaction sender
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
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Upgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == type(IATKSystemTrustedIssuersRegistry).interfaceId
            || interfaceId == type(IATKTrustedIssuersRegistry).interfaceId
            || interfaceId == type(ISMARTTrustedIssuersRegistry).interfaceId
            || interfaceId == type(IClaimAuthorizer).interfaceId
            || interfaceId == type(IATKSystemAccessManaged).interfaceId || super.supportsInterface(interfaceId);
    }
}
