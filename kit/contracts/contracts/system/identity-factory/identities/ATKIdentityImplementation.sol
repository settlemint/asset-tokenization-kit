// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IATKIdentity } from "./IATKIdentity.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IERC735 } from "@onchainid/contracts/interface/IERC735.sol";
import { IERC734 } from "@onchainid/contracts/interface/IERC734.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";

// Import local extensions
import { ERC734 } from "../../../onchainid/extensions/ERC734.sol";
import { ERC735 } from "../../../onchainid/extensions/ERC735.sol";
import { OnChainIdentity } from "../../../onchainid/extensions/OnChainIdentity.sol";
import { OnChainIdentityWithRevocation } from "../../../onchainid/extensions/OnChainIdentityWithRevocation.sol";
import { ClaimAuthorizationExtension } from "../../../onchainid/extensions/ClaimAuthorizationExtension.sol";
import { ERC734KeyPurposes } from "../../../onchainid/ERC734KeyPurposes.sol";

/// @title ATK Identity Implementation Contract (Logic for Wallet Identities)
/// @author SettleMint
/// @notice This contract provides the upgradeable logic for standard on-chain identities associated with user wallets
///         within the ATK Protocol. It implements `IIdentity` using local `ERC734` and `ERC735` extensions.
/// @dev This contract is intended to be deployed once and then used as the logic implementation target for multiple
///      `ATKIdentityProxy` contracts. It inherits `ERC734` for key management, `ERC735` for claim management,
///      `ERC165Upgradeable` for interface detection, and `ERC2771ContextUpgradeable` for meta-transactions.
contract ATKIdentityImplementation is
    IATKIdentity,
    ERC734,
    ERC735,
    OnChainIdentityWithRevocation,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    ClaimAuthorizationExtension
{
    // --- State Variables ---
    bool private _smartIdentityInitialized;

    // --- Custom Errors for ATKIdentityImplementation ---
    error AlreadyInitialized();
    error SenderLacksManagementKey();
    error SenderLacksActionKey();
    error SenderLacksClaimSignerKey();
    // Errors for checks that might be redundant if ERC734.sol handles them robustly
    error ReplicatedExecutionIdDoesNotExist(uint256 executionId);
    error ReplicatedExecutionAlreadyPerformed(uint256 executionId);

    // --- Modifiers for Access Control ---
    modifier onlyManager() {
        if (!(_msgSender() == address(this)
                    || keyHasPurpose(keccak256(abi.encode(_msgSender())), ERC734KeyPurposes.MANAGEMENT_KEY))) {
            revert SenderLacksManagementKey();
        }
        _;
    }

    modifier onlyClaimKey() {
        if (!(_msgSender() == address(this)
                    || keyHasPurpose(keccak256(abi.encode(_msgSender())), ERC734KeyPurposes.CLAIM_SIGNER_KEY))) {
            revert SenderLacksClaimSignerKey();
        }
        _;
    }

    modifier onlyActionKey() {
        if (!(_msgSender() == address(this)
                    || keyHasPurpose(keccak256(abi.encode(_msgSender())), ERC734KeyPurposes.ACTION_KEY))) {
            revert SenderLacksActionKey();
        }
        _;
    }

    /// @notice Constructor for the `ATKIdentityImplementation`.
    /// @dev Initializes ERC2771 context with the provided forwarder.
    ///      The main identity initialization (setting the first management key) is done via `initializeATKIdentity`.
    /// @param forwarder The address of the trusted forwarder for meta-transactions.
    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) ERC734(address(0), true) {
        _disableInitializers();
    }

    /**
     * @notice Initializes the ATKIdentityImplementation state.
     * @dev This function is intended to be called only once by a proxy contract via delegatecall.
     *      It sets the initial management key for this identity and initializes ERC165 support.
     *      It also registers the provided claim authorization contracts.
     *      This replaces the old `__Identity_init` call.
     * @param initialManagementKey The address to be set as the initial management key for this identity.
     * @param claimAuthorizationContracts Array of addresses implementing IClaimAuthorizer to register as claim
     * authorizers.
     */
    function initialize(address initialManagementKey, address[] calldata claimAuthorizationContracts)
        external
        override(IATKIdentity)
        initializer
    {
        if (_smartIdentityInitialized) revert AlreadyInitialized();
        _smartIdentityInitialized = true;

        __ERC165_init_unchained(); // Initialize ERC165 storage
        __ERC734_init(initialManagementKey);

        // Register the claim authorization contracts
        // This is done during initialization when we have full control over the identity
        uint256 contractsLength = claimAuthorizationContracts.length;
        for (uint256 i = 0; i < contractsLength;) {
            if (claimAuthorizationContracts[i] != address(0)) {
                _registerClaimAuthorizationContract(claimAuthorizationContracts[i], _msgSender());
            }
            unchecked {
                ++i;
            }
        }
    }

    // --- OnchainIdentityWithRevocation Functions ---
    /// @notice Revokes a claim by its signature
    /// @dev Revokes a claim by its signature
    /// @param signature The signature of the claim to revoke
    function revokeClaimBySignature(bytes calldata signature) external virtual override onlyManager {
        _revokeClaimBySignature(signature);
    }

    /// @notice Revokes a claim by its ID
    /// @dev Revokes a claim by its ID
    /// @param _claimId The ID of the claim to revoke
    /// @param _identity The address of the identity (not used in this implementation)
    /// @return success True if the claim was successfully revoked
    function revokeClaim(bytes32 _claimId, address _identity) external virtual override onlyManager returns (bool) {
        return _revokeClaim(_claimId, _identity);
    }

    // --- Claim Authorization Management Functions ---

    /// @notice Registers a claim authorization contract
    /// @param authorizationContract The address of the contract implementing IClaimAuthorization
    /// @dev Only management keys can register authorization contracts
    function registerClaimAuthorizationContract(address authorizationContract) external onlyManager {
        _registerClaimAuthorizationContract(authorizationContract, _msgSender());
    }

    /// @notice Removes a claim authorization contract
    /// @param authorizationContract The address of the contract to remove
    /// @dev Only management keys can remove authorization contracts
    function removeClaimAuthorizationContract(address authorizationContract) external onlyManager {
        _removeClaimAuthorizationContract(authorizationContract, _msgSender());
    }

    // --- ERC734 (Key Holder) Functions - Overridden for Access Control & Specific Logic ---

    /// @inheritdoc IERC734
    /// @dev Adds a key with a specific purpose and type. Requires MANAGEMENT_KEY purpose.
    function addKey(bytes32 _key, uint256 _purpose, uint256 _keyType)
        public
        virtual
        override(ERC734, IERC734) // Overrides ERC734's implementation and fulfills IERC734
        onlyManager
        returns (bool success)
    {
        return ERC734.addKey(_key, _purpose, _keyType);
    }

    /// @inheritdoc IERC734
    /// @dev Removes a purpose from a key. If it's the last purpose, the key is removed. Requires MANAGEMENT_KEY
    /// purpose.
    function removeKey(bytes32 _key, uint256 _purpose)
        public
        virtual
        override(ERC734, IERC734)
        onlyManager
        returns (bool success)
    {
        return ERC734.removeKey(_key, _purpose);
    }

    /// @inheritdoc IERC734
    /// @dev Approves or disapproves an execution.
    ///      Requires MANAGEMENT_KEY if the execution targets the identity itself.
    ///      Requires ACTION_KEY if the execution targets an external contract.
    function approve(uint256 _id, bool _toApprove) public virtual override(ERC734, IERC734) returns (bool success) {
        Execution storage executionToApprove = _executions[_id];
        // solhint-disable-next-line gas-strict-inequalities
        if (_id >= _executionNonce) revert ReplicatedExecutionIdDoesNotExist({ executionId: _id });
        if (executionToApprove.executed) revert ReplicatedExecutionAlreadyPerformed({ executionId: _id });

        bytes32 senderKeyHash = keccak256(abi.encode(_msgSender()));
        if (executionToApprove.to == address(this)) {
            if (!keyHasPurpose(senderKeyHash, ERC734KeyPurposes.MANAGEMENT_KEY)) {
                revert SenderLacksManagementKey();
            }
        } else {
            if (!keyHasPurpose(senderKeyHash, ERC734KeyPurposes.ACTION_KEY)) {
                revert SenderLacksActionKey();
            }
        }
        return ERC734.approve(_id, _toApprove);
    }

    /// @inheritdoc IERC734
    /// @dev Initiates an execution. If the sender has MANAGEMENT_KEY, or ACTION_KEY (for external calls),
    ///      the execution is auto-approved.
    function execute(address _to, uint256 _value, bytes calldata _data)
        public
        payable
        virtual
        override(ERC734, IERC734)
        returns (uint256 executionId)
    {
        executionId = ERC734.execute(_to, _value, _data);

        bytes32 senderKeyHash = keccak256(abi.encode(_msgSender()));
        bool autoApproved = false;

        if (keyHasPurpose(senderKeyHash, ERC734KeyPurposes.MANAGEMENT_KEY)) {
            autoApproved = true;
        } else if (_to != address(this) && keyHasPurpose(senderKeyHash, ERC734KeyPurposes.ACTION_KEY)) {
            autoApproved = true;
        }

        if (autoApproved) {
            this.approve(executionId, true);
        }

        return executionId;
    }

    /// @notice Checks if a key has a specific purpose
    /// @param _key The key to check
    /// @param _purpose The purpose to check for
    /// @return exists True if the key has the specified purpose, false otherwise
    function keyHasPurpose(bytes32 _key, uint256 _purpose)
        public
        view
        virtual
        override(ERC734, OnChainIdentity, IERC734)
        returns (bool exists)
    {
        return ERC734.keyHasPurpose(_key, _purpose);
    }

    // --- ERC735 (Claim Holder) Functions - Overridden for Access Control ---

    /// @inheritdoc IERC735
    /// @dev Adds or updates a claim. Checks authorization contracts first, falls back to CLAIM_ACTION_KEY if no
    /// authorization contracts.
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
        returns (bytes32 claimId)
    {
        // First check if any authorization contracts approve this claim
        bool authorizedByContract = _isAuthorizedToAddClaim(_msgSender(), _issuer, _topic);

        if (!authorizedByContract) {
            // If no authorization contracts approve, require ACTION_KEY (existing behavior)
            bytes32 senderKeyHash = keccak256(abi.encode(_msgSender()));
            if (!(_msgSender() == address(this) || keyHasPurpose(senderKeyHash, ERC734KeyPurposes.ACTION_KEY))) {
                revert SenderLacksActionKey();
            }
        }

        return ERC735.addClaim(_topic, _scheme, _issuer, _signature, _data, _uri);
    }

    /// @inheritdoc IERC735
    /// @dev Removes a claim. Requires CLAIM_SIGNER_KEY purpose from the sender.
    function removeClaim(bytes32 _claimId)
        public
        virtual
        override(ERC735, IERC735)
        onlyActionKey
        returns (bool success)
    {
        return ERC735.removeClaim(_claimId);
    }

    /// @notice Retrieves a claim by its ID
    /// @dev Retrieves a claim by its ID from the claims storage
    /// @param _claimId The ID of the claim to retrieve
    /// @return topic The claim's topic
    /// @return scheme The claim's scheme
    /// @return issuer The claim's issuer address
    /// @return signature The claim's signature
    /// @return data The claim's data
    /// @return uri The claim's URI
    function getClaim(bytes32 _claimId)
        public
        view
        virtual
        override(ERC735, OnChainIdentityWithRevocation, IERC735)
        returns (uint256, uint256, address, bytes memory, bytes memory, string memory)
    {
        return ERC735.getClaim(_claimId);
    }

    // --- ERC165 Support ---

    /// @inheritdoc IERC165
    /// @notice Checks if the contract supports a given interface ID.
    /// @dev It declares support for `IIdentity`, `IERC734`, `IERC735` (components of `IIdentity`),
    ///      and `IERC165` itself. It chains to `ERC165Upgradeable.supportsInterface`.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Upgradeable) // Overrides the one from ERC165Upgradeable
        returns (bool)
    {
        return interfaceId == type(IATKIdentity).interfaceId || interfaceId == type(IERC734).interfaceId
            || interfaceId == type(IERC735).interfaceId || interfaceId == type(IIdentity).interfaceId
            || super.supportsInterface(interfaceId);
    }

    // _msgSender() is inherited from ERC2771ContextUpgradeable and should be used for access control.
}
