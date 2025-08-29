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
import { IERC3643TrustedIssuersRegistry } from "../../../smart/interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol";

// Token interface
import { IATKToken } from "../IATKToken.sol";

// Asset roles
import { ATKAssetRoles } from "../../../assets/ATKAssetRoles.sol";

/// @title Token Trusted Issuers Registry
/// @author SettleMint
/// @notice ERC-3643 compliant trusted issuers registry that is scoped to a specific token contract.
///         Access control is delegated to the token's governance system via the GOVERNANCE_ROLE.
/// @dev This contract implements the IERC3643TrustedIssuersRegistry interface but differs from the
///      system-wide registry by having token-specific access control. Only accounts with the
///      GOVERNANCE_ROLE on the associated token contract can manage trusted issuers.
///
///      Key features:
///      - Full ERC-3643 compliance for trusted issuer management
///      - Token-specific access control via GOVERNANCE_ROLE
///      - Efficient O(1) lookups for issuer validation
///      - Event logging for all registry modifications
///      - Meta-transaction support via ERC2771
contract TokenTrustedIssuersRegistry is
    Initializable,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    IERC3643TrustedIssuersRegistry
{
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

    /// @notice Error triggered when caller lacks the required GOVERNANCE_ROLE
    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);

    // --- Events ---

    /// @notice Emitted when a new trusted issuer is added to the registry
    /// @param sender The address that performed the addition
    /// @param _issuer The address of the added trusted issuer
    /// @param _claimTopics The claim topics the issuer is trusted for
    event TrustedIssuerAdded(address indexed sender, address indexed _issuer, uint256[] _claimTopics);

    /// @notice Emitted when a trusted issuer is removed from the registry
    /// @param sender The address that performed the removal
    /// @param _issuer The address of the removed trusted issuer
    event TrustedIssuerRemoved(address indexed sender, address indexed _issuer);

    /// @notice Emitted when an issuer's claim topics are updated
    /// @param sender The address that performed the update
    /// @param _issuer The address of the issuer whose topics were updated
    /// @param _claimTopics The new claim topics for the issuer
    event ClaimTopicsUpdated(address indexed sender, address indexed _issuer, uint256[] _claimTopics);

    // --- Constructor ---

    /// @notice Constructor for the TokenTrustedIssuersRegistry
    /// @dev Disables initializers to prevent direct initialization on the implementation
    /// @param trustedForwarder The address of the trusted forwarder for meta-transactions
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    // --- Initializer ---

    /// @notice Initializes the TokenTrustedIssuersRegistry contract
    /// @dev This function acts as the constructor for the upgradeable contract and can only be called once
    /// @param token The address of the IATKToken that this registry is associated with
    function initialize(address token) public initializer {
        if (token == address(0)) revert InvalidTokenAddress();

        _token = IATKToken(token);
        __ERC165_init_unchained();
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

    // --- IERC3643TrustedIssuersRegistry Implementation ---

    /// @inheritdoc IERC3643TrustedIssuersRegistry
    function addTrustedIssuer(
        IClaimIssuer _trustedIssuer,
        uint256[] calldata _claimTopics
    ) external override onlyTokenGovernance {
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
            unchecked { ++i; }
        }

        emit TrustedIssuerAdded(_msgSender(), issuerAddress, _claimTopics);
    }

    /// @inheritdoc IERC3643TrustedIssuersRegistry
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
            unchecked { ++i; }
        }

        // Delete the issuer's record
        delete _trustedIssuers[issuerAddress];

        emit TrustedIssuerRemoved(_msgSender(), issuerAddress);
    }

    /// @inheritdoc IERC3643TrustedIssuersRegistry
    function updateIssuerClaimTopics(
        IClaimIssuer _trustedIssuer,
        uint256[] calldata _newClaimTopics
    ) external override onlyTokenGovernance {
        address issuerAddress = address(_trustedIssuer);
        if (!_trustedIssuers[issuerAddress].exists) revert IssuerDoesNotExist(issuerAddress);
        if (_newClaimTopics.length == 0) revert NoClaimTopicsProvided();

        uint256[] storage currentClaimTopics = _trustedIssuers[issuerAddress].claimTopics;

        // Remove issuer from all current claim topic mappings
        uint256 currentClaimTopicsLength = currentClaimTopics.length;
        for (uint256 i = 0; i < currentClaimTopicsLength;) {
            _removeIssuerFromClaimTopic(currentClaimTopics[i], issuerAddress);
            unchecked { ++i; }
        }

        // Add issuer to all new claim topic mappings
        uint256 newClaimTopicsLength = _newClaimTopics.length;
        for (uint256 i = 0; i < newClaimTopicsLength;) {
            _addIssuerToClaimTopic(_newClaimTopics[i], issuerAddress);
            unchecked { ++i; }
        }

        // Update the stored claim topics
        _trustedIssuers[issuerAddress].claimTopics = _newClaimTopics;

        emit ClaimTopicsUpdated(_msgSender(), issuerAddress, _newClaimTopics);
    }

    /// @inheritdoc IERC3643TrustedIssuersRegistry
    function getTrustedIssuers() external view override returns (IClaimIssuer[] memory) {
        IClaimIssuer[] memory issuers = new IClaimIssuer[](_issuerAddresses.length);
        uint256 issuerAddressesLength = _issuerAddresses.length;
        for (uint256 i = 0; i < issuerAddressesLength;) {
            issuers[i] = IClaimIssuer(_issuerAddresses[i]);
            unchecked { ++i; }
        }
        return issuers;
    }

    /// @inheritdoc IERC3643TrustedIssuersRegistry
    function getTrustedIssuerClaimTopics(IClaimIssuer _trustedIssuer)
        external
        view
        override
        returns (uint256[] memory)
    {
        address issuerAddress = address(_trustedIssuer);
        if (!_trustedIssuers[issuerAddress].exists) revert IssuerDoesNotExist(issuerAddress);
        return _trustedIssuers[issuerAddress].claimTopics;
    }

    /// @inheritdoc IERC3643TrustedIssuersRegistry
    function getTrustedIssuersForClaimTopic(uint256 claimTopic)
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
            unchecked { ++i; }
        }
        return issuers;
    }

    /// @inheritdoc IERC3643TrustedIssuersRegistry
    function hasClaimTopic(address _issuer, uint256 _claimTopic) external view override returns (bool) {
        return _claimTopicIssuerIndex[_claimTopic][_issuer] > 0;
    }

    /// @inheritdoc IERC3643TrustedIssuersRegistry
    function isTrustedIssuer(address _issuer) external view override returns (bool) {
        return _trustedIssuers[_issuer].exists;
    }

    // --- Getters ---

    /// @notice Returns the token contract that this registry is associated with
    /// @return The IATKToken interface of the associated token
    function token() external view returns (IATKToken) {
        return _token;
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
            unchecked { ++i; }
        }
        revert AddressNotFoundInList(addrToRemove);
    }

    // --- Context Overrides (ERC2771 for meta-transactions) ---

    /// @notice Provides the actual sender of a transaction, supporting meta-transactions via ERC2771
    /// @return The address of the original transaction sender
    function _msgSender() internal view virtual override returns (address) {
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
        return interfaceId == type(IERC3643TrustedIssuersRegistry).interfaceId
            || super.supportsInterface(interfaceId);
    }
}