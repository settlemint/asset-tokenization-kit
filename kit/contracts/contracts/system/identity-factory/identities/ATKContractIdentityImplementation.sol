// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IATKContractIdentity } from "./IATKContractIdentity.sol";
import { IContractWithIdentity } from "../IContractWithIdentity.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IERC735 } from "@onchainid/contracts/interface/IERC735.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ERC735 } from "../../../onchainid/extensions/ERC735.sol";

/// @title ATK Contract Identity Implementation Contract
/// @author SettleMint Tokenization Services
/// @notice This contract provides the upgradeable logic for on-chain identities associated with contracts
///         that implement IContractWithIdentity within the ATK Protocol.
/// @dev This replaces the previous ATKTokenIdentity with a more generic solution that works for any contract
///      (tokens, vaults, etc.) that implements IContractWithIdentity. Permission checks are delegated
///      to the contract itself via canAddClaim/canRemoveClaim instead of using an external access manager.
contract ATKContractIdentityImplementation is
    IATKContractIdentity,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    ERC735
{
    // --- State Variables ---

    /// @notice The blockchain address of the contract that owns this identity
    /// @dev This contract must implement IContractWithIdentity interface
    address internal _contractAddress;

    // --- Errors ---

    /// @dev Error thrown when attempting to use key-based functionality
    error UnsupportedKeyOperation();

    /// @dev Error thrown when attempting to use execution functionality in an unsupported way
    error UnsupportedExecutionOperation();

    /// @dev Error thrown when trying to set an invalid contract address
    error InvalidContractAddress();

    /// @dev Error thrown when the caller is not authorized for the operation
    error UnauthorizedOperation(address caller);

    // --- Constructor ---

    /// @notice Constructor for the `ATKContractIdentityImplementation`.
    /// @dev Disables initializers to prevent implementation contract from being initialized
    /// @param trustedForwarder The address of the trusted forwarder for meta-transactions
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    // --- Initialization ---

    /// @notice Initializes the ATKContractIdentityImplementation.
    /// @dev Intended to be called once by a proxy via delegatecall.
    /// @param contractAddr The address of the contract that owns this identity
    function initialize(address contractAddr) external override initializer {
        if (contractAddr == address(0)) revert InvalidContractAddress();

        // Verify the contract implements IContractWithIdentity
        try IContractWithIdentity(contractAddr).supportsInterface(type(IContractWithIdentity).interfaceId) returns (
            bool supported
        ) {
            if (!supported) revert InvalidContractAddress();
        } catch {
            revert InvalidContractAddress();
        }

        __ERC165_init_unchained();

        _contractAddress = contractAddr;
    }

    // --- View Functions ---

    /// @notice Returns the address of the contract that owns this identity
    /// @return The contract address
    function contractAddress() external view returns (address) {
        return _contractAddress;
    }

    // --- ERC735 (Claim Holder) Functions - Overridden for Access Control ---

    /// @inheritdoc IERC735
    /// @dev Adds or updates a claim. Permission check is delegated to the contract via canAddClaim.
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
        override(ERC735, IERC735)
        returns (bytes32 claimId)
    {
        if (!IContractWithIdentity(_contractAddress).canAddClaim(_msgSender())) {
            revert UnauthorizedOperation(_msgSender());
        }
        return ERC735.addClaim(_topic, _scheme, _issuer, _signature, _data, _uri);
    }

    /// @inheritdoc IERC735
    /// @dev Removes a claim. Permission check is delegated to the contract via canRemoveClaim.
    function removeClaim(bytes32 _claimId) public virtual override(ERC735, IERC735) returns (bool success) {
        if (!IContractWithIdentity(_contractAddress).canRemoveClaim(_msgSender())) {
            revert UnauthorizedOperation(_msgSender());
        }
        return ERC735.removeClaim(_claimId);
    }

    // --- ERC734 (Key Holder) Functions - Disabled ---

    /// @dev Key operations are not supported in contract identities
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

    /// @dev Key operations are not supported in contract identities
    function removeKey(bytes32, /*_key*/ uint256 /*_purpose*/ ) public virtual override returns (bool) {
        revert UnsupportedKeyOperation();
    }

    /// @dev Execution operations are not supported in contract identities
    function approve(uint256, /*_id*/ bool /*_toApprove*/ ) public virtual override returns (bool) {
        revert UnsupportedExecutionOperation();
    }

    /// @dev Execution operations are not supported in contract identities
    function execute(
        address, /*_to*/
        uint256, /*_value*/
        bytes calldata /*_data*/
    )
        public
        payable
        virtual
        override
        returns (uint256)
    {
        revert UnsupportedExecutionOperation();
    }

    /// @dev Key operations are not supported in contract identities
    function getKey(bytes32 /*_key*/ ) external view virtual override returns (uint256[] memory, uint256, bytes32) {
        revert UnsupportedKeyOperation();
    }

    /// @dev Key operations are not supported in contract identities
    function getKeyPurposes(bytes32 /*_key*/ ) external view virtual override returns (uint256[] memory) {
        revert UnsupportedKeyOperation();
    }

    /// @dev Key operations are not supported in contract identities
    function getKeysByPurpose(uint256 /*_purpose*/ ) external view virtual override returns (bytes32[] memory) {
        revert UnsupportedKeyOperation();
    }

    /// @dev Key operations are not supported in contract identities
    function keyHasPurpose(bytes32, /*_key*/ uint256 /*_purpose*/ ) external view virtual override returns (bool) {
        revert UnsupportedKeyOperation();
    }

    // --- IIdentity Specific Functions ---

    /// @dev Contract identities do not issue claims, always returns false
    function isClaimValid(
        IIdentity, /*_identity*/
        uint256, /*claimTopic*/
        bytes calldata, /*sig*/
        bytes calldata /*data*/
    )
        external
        pure
        returns (bool)
    {
        // Contract identities are claim holders only, not claim issuers
        return false;
    }

    // --- ERC165 Support ---

    /// @notice Checks if the contract supports a given interface ID.
    /// @dev Declares support for IATKContractIdentity, IERC735, IIdentity, and IERC165.
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165Upgradeable) returns (bool) {
        return interfaceId == type(IATKContractIdentity).interfaceId || interfaceId == type(IERC735).interfaceId
            || interfaceId == type(IIdentity).interfaceId || super.supportsInterface(interfaceId);
    }
}
