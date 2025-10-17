// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { ERC165 } from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// OnchainID imports
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

// Interface imports
import { IATKTokenTrustedIssuersRegistry } from "./IATKTokenTrustedIssuersRegistry.sol";
import { IATKTrustedIssuersRegistry } from "../../trusted-issuers-registry/IATKTrustedIssuersRegistry.sol";
import { ISMARTTrustedIssuersRegistry } from "../../../smart/interface/ISMARTTrustedIssuersRegistry.sol";
import { IClaimAuthorizer } from "../../../onchainid/extensions/IClaimAuthorizer.sol";

// Token interface
import { IATKToken } from "../IATKToken.sol";

// Asset roles
import { ATKAssetRoles } from "../../../assets/ATKAssetRoles.sol";

/// @title Token Trusted Issuers Registry
/// @author SettleMint
/// @notice Subject-aware trusted issuers registry that is scoped to a specific token contract.
///         Access control is delegated to the token's governance system via the GOVERNANCE_ROLE.
/// @dev This contract implements the ISMARTTrustedIssuersRegistry interface with token-specific
///      access control and subject validation. Only accounts with the GOVERNANCE_ROLE on the
///      associated token contract can manage trusted issuers.
///
///      Key features:
///      - Subject-aware trusted issuer management (validates subject is token's onchainID)
///      - Token-specific access control via GOVERNANCE_ROLE
///      - Efficient O(1) lookups for issuer validation
///      - Subject-aware event logging for all registry modifications
///      - Meta-transaction support via ERC2771
contract TokenTrustedIssuersRegistry is ERC165, ERC2771Context, IATKTokenTrustedIssuersRegistry {
    // --- Storage Variables ---

    /// @notice The token contract that this registry is associated with
    /// @dev Used for access control - only accounts with GOVERNANCE_ROLE on this token can manage issuers
    IATKToken private _token;

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

    // --- Errors ---

    /// @notice Error triggered when the token address is invalid (zero address)
    error InvalidTokenAddress();

    /// @notice Error triggered when attempting to interact with an invalid issuer address
    error InvalidIssuerAddress();

    /// @notice Error triggered when no claim topics are provided for an issuer
    error NoClaimTopicsProvided();

    /// @notice Error triggered when attempting to add an issuer that already exists
    error IssuerAlreadyExists(address issuerAddress);

    /// @notice Error triggered when attempting to operate on a non-existent issuer
    error IssuerDoesNotExist(address issuerAddress);

    /// @notice Error triggered when an issuer is not found in a claim topic list
    error IssuerNotFoundInTopicList(address issuerAddress, uint256 claimTopic);

    /// @notice Error triggered when an address is not found in a list during removal
    error AddressNotFoundInList(address addr);

    /// @notice Error triggered when an invalid subject is provided (must be address(0) or this token's onchainID)
    error InvalidSubjectAddress();

    /// @notice Error triggered when caller lacks the required GOVERNANCE_ROLE
    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);

    // --- Events are defined in IATKTrustedIssuersRegistryWithSubject ---

    // --- Constructor ---

    /// @notice Constructor for the TokenTrustedIssuersRegistry
    /// @dev Initializes the registry with the associated token contract
    /// @param trustedForwarder The address of the trusted forwarder for meta-transactions
    /// @param token_ The address of the IATKToken that this registry is associated with
    constructor(address trustedForwarder, address token_) ERC2771Context(trustedForwarder) {
        if (token_ == address(0)) revert InvalidTokenAddress();
        _token = IATKToken(token_);
    }

    // --- Access Control Modifier ---

    /// @notice Modifier to restrict access to accounts with GOVERNANCE_ROLE on the associated token
    /// @dev Checks if the caller has the GOVERNANCE_ROLE on the token contract
    modifier onlyTokenGovernance() {
        if (!_token.hasRole(ATKAssetRoles.GOVERNANCE_ROLE, _msgSender())) {
            revert AccessControlUnauthorizedAccount(_msgSender(), ATKAssetRoles.GOVERNANCE_ROLE);
        }
        _;
    }

    // --- Token-Specific Getters ---

    /// @inheritdoc IATKTokenTrustedIssuersRegistry
    function token() external view override returns (IATKToken) {
        return _token;
    }

    // --- Token-Specific Modification Functions ---

    /// @inheritdoc IATKTrustedIssuersRegistry
    function addTrustedIssuer(IClaimIssuer _trustedIssuer, uint256[] calldata _claimTopics)
        external
        override
        onlyTokenGovernance
    {
        address issuerAddress = address(_trustedIssuer);
        if (issuerAddress == address(0)) revert InvalidIssuerAddress();
        if (_claimTopics.length == 0) revert NoClaimTopicsProvided();
        if (_trustedIssuers[issuerAddress].exists) revert IssuerAlreadyExists(issuerAddress);

        // Store issuer details
        _trustedIssuers[issuerAddress] = TrustedIssuer(issuerAddress, true, _claimTopics);
        _issuerAddresses.push(issuerAddress);

        // Add issuer to claim topic mappings
        uint256 claimTopicsLength = _claimTopics.length;
        for (uint256 i = 0; i < claimTopicsLength;) {
            _addIssuerToClaimTopic(_claimTopics[i], issuerAddress);
            unchecked {
                ++i;
            }
        }

        emit TrustedIssuerAdded(_msgSender(), _trustedIssuer, _claimTopics, _token.onchainID());
    }

    /// @inheritdoc IATKTrustedIssuersRegistry
    function removeTrustedIssuer(IClaimIssuer _trustedIssuer) external override onlyTokenGovernance {
        address issuerAddress = address(_trustedIssuer);
        if (!_trustedIssuers[issuerAddress].exists) revert IssuerDoesNotExist(issuerAddress);

        uint256[] memory topicsToRemove = _trustedIssuers[issuerAddress].claimTopics;

        // Remove issuer from the main list
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

        emit TrustedIssuerRemoved(_msgSender(), _trustedIssuer, _token.onchainID());
    }

    /// @inheritdoc IATKTrustedIssuersRegistry
    function updateIssuerClaimTopics(IClaimIssuer _trustedIssuer, uint256[] calldata _newClaimTopics)
        external
        override
        onlyTokenGovernance
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

        // Update the stored claim topics
        _trustedIssuers[issuerAddress].claimTopics = _newClaimTopics;

        emit ClaimTopicsUpdated(_msgSender(), _trustedIssuer, _newClaimTopics, _token.onchainID());
    }

    // --- ISMARTTrustedIssuersRegistry Implementation ---

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function getTrustedIssuers(address _subject) external view override returns (IClaimIssuer[] memory) {
        if (_subject != _token.onchainID()) revert InvalidSubjectAddress();
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
    /// @param claimTopic The claim topic to filter trusted issuers
    /// @param _subject The subject identifier (address(0) for global only, or specific subject address)
    /// @return Array of IClaimIssuer contracts trusted for this subject + claim topic (deduplicated)
    function getTrustedIssuersForClaimTopic(uint256 claimTopic, address _subject)
        external
        view
        override
        returns (IClaimIssuer[] memory)
    {
        return _getTrustedIssuersForClaimTopic(claimTopic, _subject);
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function isTrustedIssuer(address _issuer, address _subject) external view override returns (bool) {
        if (_subject != _token.onchainID()) revert InvalidSubjectAddress();
        return _trustedIssuers[_issuer].exists;
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function hasClaimTopic(address _issuer, uint256 _claimTopic, address _subject)
        external
        view
        override
        returns (bool)
    {
        if (_subject != _token.onchainID()) revert InvalidSubjectAddress();
        return _claimTopicIssuerIndex[_claimTopic][_issuer] > 0;
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function getTrustedIssuerClaimTopics(IClaimIssuer _trustedIssuer, address _subject)
        external
        view
        override
        returns (uint256[] memory)
    {
        if (_subject != _token.onchainID()) revert InvalidSubjectAddress();
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

    /// @notice Internal helper to get trusted issuers for a specific claim topic and subject
    /// @param claimTopic The claim topic to filter trusted issuers
    /// @param subject The subject identifier (must be this token's onchainID)
    /// @return Array of IClaimIssuer contracts trusted for the given claim topic
    function _getTrustedIssuersForClaimTopic(uint256 claimTopic, address subject)
        internal
        view
        returns (IClaimIssuer[] memory)
    {
        if (subject != _token.onchainID()) revert InvalidSubjectAddress();
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
    function _msgSender() internal view virtual override returns (address) {
        return ERC2771Context._msgSender();
    }

    /// @inheritdoc IERC165
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IATKTokenTrustedIssuersRegistry).interfaceId
            || interfaceId == type(IATKTrustedIssuersRegistry).interfaceId
            || interfaceId == type(ISMARTTrustedIssuersRegistry).interfaceId
            || interfaceId == type(IClaimAuthorizer).interfaceId || super.supportsInterface(interfaceId);
    }
}
