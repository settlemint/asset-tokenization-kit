// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { ISMARTTokenIdentity } from "./ISMARTTokenIdentity.sol";
import { IIdentity } from "@onchainid/contracts/smart/interface/IIdentity.sol";
import { IERC735 } from "@onchainid/contracts/smart/interface/IERC735.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ISMARTTokenAccessManaged } from "../../../smart/extensions/access-managed/ISMARTTokenAccessManaged.sol";
import { ISMARTTokenAccessManager } from "../../../smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { ERC735 } from "./smart/extensions/ERC735.sol";
import { SMARTSystemRoles } from "../../SMARTSystemRoles.sol";
/// @title SMART Token Identity Implementation Contract
/// @author SettleMint Tokenization Services
/// @notice This contract provides the upgradeable logic for on-chain identities associated with tokens/assets
///         within the SMART Protocol. It is based on the OnchainID `Identity` contract but restricts
///         ERC734 key management, relying on an external Access Manager for ERC735 claim operations.
/// @dev Inherits `Identity` for ERC735 storage and basic claim logic, `ERC165Upgradeable` for interface detection,
///      and `ERC2771ContextUpgradeable` for meta-transaction support. ERC734 functions are disabled.

contract SMARTTokenIdentityImplementation is
    ISMARTTokenIdentity,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    ERC735,
    ISMARTTokenAccessManaged
{
    // --- State Variables ---

    /// @notice The blockchain address of the central `SMARTTokenAccessManager` contract.
    /// @dev This manager contract is responsible for all role assignments and checks.
    ///      This variable is declared `internal`, meaning it's accessible within this contract
    ///      and any contracts that inherit from it, but not externally.
    address internal _accessManager;

    // --- Errors ---

    /// @dev Error thrown when attempting to use key-based functionality
    error UnsupportedKeyOperation();

    /// @dev Error thrown when attempting to use execution functionality in an unsupported way
    error UnsupportedExecutionOperation();

    /// @dev Error thrown when trying to set an invalid access manager
    error InvalidAccessManager();

    // --- Modifiers ---

    modifier onlyAccessManagerRole(bytes32 role) {
        _checkRole(role, _msgSender());
        _;
    }

    /// @notice Constructor for the `SMARTTokenIdentityImplementation`.
    /// @dev Calls the constructor of the parent `Identity` contract.
    ///      - `address(0)`: This indicates that the identity contract itself is not initially owned by another identity
    /// contract.
    ///      - `true`: This boolean likely signifies that the deployer (`msg.sender` of this logic contract deployment,
    /// if deployed directly)
    ///                is *not* automatically added as a management key. The `initialize` function called via
    /// `delegatecall` by the proxy
    ///                is responsible for setting up the initial management key(s) for each specific identity instance.
    ///      This constructor will only be called once when this logic contract is deployed.
    ///      For proxied identities, the state (including keys and claims) is managed in the proxy's storage,
    /// initialized via `delegatecall` to `Identity.initialize(initialManagementKey)`.
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    /**
     * @notice Initializes the SMARTTokenIdentityImplementation.
     * @dev Intended to be called once by a proxy via delegatecall.
     *      NOTE: Named `initializeSMARTTokenIdentity` to avoid conflict with the non-virtual `initialize`
     *      function in the base `Identity` contract from OnchainID.
     * @param accessManagerAddress The address of the ISMARTTokenAccessManager contract.
     */
    function initialize(address accessManagerAddress) external override initializer {
        if (accessManagerAddress == address(0)) revert InvalidAccessManager();

        __ERC165_init_unchained();

        _accessManager = accessManagerAddress;
    }

    // --- Access Manager Functions ---

    /// @notice Checks if a given account has a specific role, as defined by the `_accessManager`.
    /// @dev This function implements the `ISMARTTokenAccessManaged` interface.
    ///      It delegates the actual role check to the `hasRole` function of the `_accessManager` contract.
    ///      The `virtual` keyword means that this function can be overridden by inheriting contracts.
    /// @param role The `bytes32` identifier of the role to check.
    /// @param account The address of the account whose roles are being checked.
    /// @return `true` if the account has the role, `false` otherwise.
    function hasRole(bytes32 role, address account) external view virtual override returns (bool) {
        if (_accessManager == address(0)) return false; // Not yet initialized or access manager not set
        return ISMARTTokenAccessManager(_accessManager).hasRole(role, account);
    }

    /// @notice Returns the address of the access manager for the token.
    /// @return The address of the access manager.
    function accessManager() external view returns (address) {
        return _accessManager;
    }

    // --- ERC735 (Claim Holder) Functions - Overridden for Access Control ---

    /// @inheritdoc IERC735
    /// @dev Adds or updates a claim. Requires CLAIM_SIGNER_KEY purpose from the sender.
    function addClaim(
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes memory _signature,
        bytes memory _data,
        string memory _uri
    )
        public
        virtual
        override(ERC735, IERC735) // Overrides ERC735's implementation and fulfills IERC735
        onlyAccessManagerRole(SMARTSystemRoles.CLAIM_MANAGER_ROLE)
        returns (bytes32 claimId)
    {
        return ERC735.addClaim(_topic, _scheme, _issuer, _signature, _data, _uri);
    }

    /// @inheritdoc IERC735
    /// @dev Removes a claim. Requires CLAIM_SIGNER_KEY purpose from the sender.
    function removeClaim(bytes32 _claimId)
        public
        virtual
        override(ERC735, IERC735)
        onlyAccessManagerRole(SMARTSystemRoles.CLAIM_MANAGER_ROLE)
        returns (bool success)
    {
        return ERC735.removeClaim(_claimId);
    }

    // --- ERC734 (Key Holder) Functions - Overridden for Access Control & Specific Logic ---

    /// @dev Adds a key with a specific purpose and type. Requires MANAGEMENT_KEY purpose.
    ///      The parameters (_key, _purpose, _keyType) are unused as key operations are unsupported in this
    /// implementation.
    function addKey(
        bytes32, /*_key*/
        uint256, /*_purpose*/
        uint256 /*_keyType*/
    )
        public
        virtual
        override
        returns (bool)
    {
        revert UnsupportedKeyOperation();
    }

    /// @dev Removes a purpose from a key. If it's the last purpose, the key is removed. Requires MANAGEMENT_KEY
    /// purpose.
    ///      The parameters (_key, _purpose) are unused as key operations are unsupported in this implementation.
    function removeKey(bytes32, /*_key*/ uint256 /*_purpose*/ ) public virtual override returns (bool /*success*/ ) {
        revert UnsupportedKeyOperation();
    }

    /// @dev Approves or disapproves an execution.
    ///      Requires MANAGEMENT_KEY if the execution targets the identity itself.
    ///      Requires ACTION_KEY if the execution targets an external contract.
    ///      The parameters (_id, _toApprove) are unused as execution operations are unsupported in this implementation.
    function approve(uint256, /*_id*/ bool /*_toApprove*/ ) public virtual override returns (bool /*success*/ ) {
        revert UnsupportedExecutionOperation();
    }

    /// @dev Initiates an execution. If the sender has MANAGEMENT_KEY, or ACTION_KEY (for external calls),
    ///      the execution is auto-approved.
    ///      The parameters (_to, _value, _data) are unused as execution operations are unsupported in this
    /// implementation.
    function execute(
        address, /*_to*/
        uint256, /*_value*/
        bytes calldata /*_data*/
    )
        public
        payable
        virtual
        override
        returns (uint256 /*executionId*/ )
    {
        revert UnsupportedExecutionOperation();
    }

    /// @dev Gets key data. This operation is unsupported in this identity model.
    ///      The parameter (_key) is unused as key operations are unsupported in this implementation.
    function getKey(bytes32 /*_key*/ )
        external
        view
        virtual
        override
        returns (uint256[] memory, /*purposes*/ uint256, /*keyType*/ bytes32 /*key*/ )
    {
        revert UnsupportedKeyOperation();
    }

    /// @dev Gets key purposes. This operation is unsupported in this identity model.
    ///      The parameter (_key) is unused as key operations are unsupported in this implementation.
    function getKeyPurposes(bytes32 /*_key*/ )
        external
        view
        virtual
        override
        returns (uint256[] memory /*_purposes*/ )
    {
        revert UnsupportedKeyOperation();
    }

    /// @dev Gets keys by purpose. This operation is unsupported in this identity model.
    ///      The parameter (_purpose) is unused as key operations are unsupported in this implementation.
    function getKeysByPurpose(uint256 /*_purpose*/ )
        external
        view
        virtual
        override
        returns (bytes32[] memory /*keys*/ )
    {
        revert UnsupportedKeyOperation();
    }

    /// @dev Checks if a key has a purpose. This operation is unsupported.
    ///      The parameters (_key, _purpose) are unused as key operations are unsupported in this implementation.
    function keyHasPurpose(
        bytes32, /*_key*/
        uint256 /*_purpose*/
    )
        external
        view
        virtual
        override
        returns (bool /*exists*/ )
    {
        revert UnsupportedKeyOperation();
    }

    // --- IIdentity Specific Functions ---

    /// @dev Checks claim validity.
    ///      Parameters (_identity, claimTopic, sig, data) are unused as this identity implementation
    ///      does not issue claims and always returns false.
    function isClaimValid(
        IIdentity, /*_identity*/
        uint256, /*claimTopic*/
        bytes calldata, /*sig*/
        bytes calldata /*data*/
    )
        external
        pure
        returns (bool /*claimValid*/ )
    {
        // Since this identity does not have keys it cannot distribute claims,
        // it's only a claim holder identity.
        return false;
    }

    // --- ERC165 Support ---

    /// @notice Checks if the contract supports a given interface ID.
    /// @dev It declares support for `IIdentity`, `IERC734`, `IERC735` (components of `IIdentity`),
    ///      and `IERC165` itself. It chains to `ERC165Upgradeable.supportsInterface`.
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165Upgradeable) returns (bool) {
        return interfaceId == type(ISMARTTokenIdentity).interfaceId || interfaceId == type(IERC735).interfaceId
            || interfaceId == type(IIdentity).interfaceId || super.supportsInterface(interfaceId);
    }

    // --- Internal functions ---

    /// @notice Internal view function to verify if an account has a specific role.
    /// @dev If the account does not have the role, this function reverts the transaction
    ///      with an `AccessControlUnauthorizedAccount` error, providing the account address
    ///      and the role that was needed.
    ///      This is often used in modifiers or at the beginning of functions to guard access.
    /// @param role The `bytes32` identifier of the role to check for.
    /// @param account The address of the account to verify.
    function _checkRole(bytes32 role, address account) internal view {
        if (_accessManager == address(0) || !ISMARTTokenAccessManager(_accessManager).hasRole(role, account)) {
            revert AccessControlUnauthorizedAccount(account, role);
        }
    }
}
