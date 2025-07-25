// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { IATKAirdrop } from "./IATKAirdrop.sol";
import { IATKClaimTracker } from "./claim-tracker/IATKClaimTracker.sol";
import {
    InvalidMerkleProof,
    IndexAlreadyClaimed,
    InvalidTokenAddress,
    InvalidAirdropName,
    InvalidInputArrayLengths,
    InvalidWithdrawalAddress,
    InvalidMerkleRoot,
    InvalidClaimTrackerAddress,
    InvalidClaimAmount,
    ZeroClaimAmount,
    BatchSizeExceedsLimit
} from "./ATKAirdropErrors.sol";

/// @title ATK Airdrop (Abstract)
/// @author SettleMint
/// @notice Abstract base contract for reusable Merkle-based airdrop distributions in the ATK Protocol.
///         This contract provides the core logic for Merkle proof-based airdrop claims, including:
///         - Flexible claim tracking using pluggable strategies
///         - Support for partial and full claims
///         - Meta-transaction support via ERC2771 (trusted forwarder)
///         - Withdrawals of unclaimed tokens by the owner
///         - Abstract claim and batchClaim functions for extension by concrete airdrop implementations
///
/// @dev This contract provides enhanced core logic for Merkle proof-based airdrop claims, including:
///  - Flexible claim tracking using the IATKClaimTracker interface
///  - Support for partial claims and progressive distributions
///  - Meta-transaction support via ERC2771 (trusted forwarder)
///  - Withdrawals of unclaimed tokens by the owner
///  - Abstract claim and batchClaim functions for extension by concrete airdrop implementations
///
/// The contract is intended to be inherited by specific airdrop implementations (e.g., standard, vesting, push).
/// It is not meant to be deployed directly.
abstract contract ATKAirdrop is IATKAirdrop, Initializable, OwnableUpgradeable, ERC2771ContextUpgradeable {
    using SafeERC20 for IERC20;

    // --- Constants ---

    /// @notice Maximum number of items allowed in batch operations to prevent OOM and gas limit issues.
    /// @dev Set to 100 to balance usability with gas efficiency.
    /// @return Maximum allowed batch size (100)
    uint256 public constant MAX_BATCH_SIZE = 100;

    // --- Modifiers ---

    /// @notice Modifier to check if batch size is within allowed limits.
    /// @param batchSize The size of the batch to validate.
    modifier checkBatchSize(uint256 batchSize) {
        if (batchSize > MAX_BATCH_SIZE) {
            revert BatchSizeExceedsLimit();
        }
        _;
    }

    // --- Storage Variables ---

    /// @notice The human-readable name of this airdrop.
    /// @dev Set once at initialization and immutable thereafter.
    string internal _name;

    /// @notice The ERC20 token being distributed in this airdrop.
    /// @dev Set once at initialization and immutable thereafter.
    IERC20 internal _token;

    /// @notice The Merkle root for verifying airdrop claims.
    /// @dev Set once at initialization and immutable thereafter. Used for Merkle proof verification.
    bytes32 internal _merkleRoot;

    /// @notice The claim tracker contract for managing claim states.
    /// @dev Set once at initialization and immutable thereafter. Handles claim tracking logic.
    IATKClaimTracker internal _claimTracker;

    /// @notice Constructor to initialize the airdrop base contract
    /// @dev Disables initializers to prevent implementation contract initialization
    /// @custom:oz-upgrades-unsafe-allow constructor
    /// @param forwarder_ The address of the forwarder contract.
    constructor(address forwarder_) ERC2771ContextUpgradeable(forwarder_) {
        _disableInitializers();
    }

    /// @notice Initializes the base airdrop contract.
    /// @dev Sets the name, token, Merkle root, claim tracker, owner, and trusted forwarder for meta-transactions.
    /// @param name_ The human-readable name for this airdrop.
    /// @param token_ The address of the ERC20 token to be distributed.
    /// @param root_ The Merkle root for verifying claims.
    /// @param owner_ The initial owner of the contract.
    /// @param claimTracker_ The address of the claim tracker contract.
    function __ATKAirdrop_init(
        string memory name_,
        address token_,
        bytes32 root_,
        address owner_,
        address claimTracker_
    )
        internal
        onlyInitializing
    {
        if (bytes(name_).length == 0) revert InvalidAirdropName();
        if (token_ == address(0)) revert InvalidTokenAddress();
        if (root_ == bytes32(0)) revert InvalidMerkleRoot();
        if (claimTracker_ == address(0)) revert InvalidClaimTrackerAddress();

        // Verify the token contract exists and implements IERC20 by attempting to call a view function
        try IERC20(token_).totalSupply() returns (uint256) {
            // Contract exists and implements IERC20
        } catch {
            revert InvalidTokenAddress();
        }

        // Verify the claim tracker contract exists and implements IATKClaimTracker by attempting to call a view
        // function
        try IATKClaimTracker(claimTracker_).isClaimed(0, 0) returns (bool) {
            // Contract exists and implements IATKClaimTracker
        } catch {
            revert InvalidClaimTrackerAddress();
        }

        __Ownable_init(owner_);

        _name = name_;
        _token = IERC20(token_);
        _merkleRoot = root_;
        _claimTracker = IATKClaimTracker(claimTracker_);
    }

    // --- View Functions ---

    /// @notice Returns the name of this airdrop.
    /// @return The human-readable name of the airdrop.
    function name() external view returns (string memory) {
        return _name;
    }

    /// @notice Returns the token being distributed in this airdrop.
    /// @return The ERC20 token being distributed.
    function token() external view returns (IERC20) {
        return _token;
    }

    /// @notice Returns the Merkle root for verifying airdrop claims.
    /// @return The Merkle root for verifying airdrop claims.
    function merkleRoot() external view returns (bytes32) {
        return _merkleRoot;
    }

    /// @notice Returns the claim tracker contract.
    /// @return The claim tracker contract.
    function claimTracker() external view returns (IATKClaimTracker) {
        return _claimTracker;
    }

    /// @notice Checks if a claim has been fully claimed for a specific index.
    /// @param index The index to check in the Merkle tree.
    /// @param totalAmount The total amount allocated for this index.
    /// @return claimed True if the index has been fully claimed, false otherwise.
    function isClaimed(uint256 index, uint256 totalAmount) public view returns (bool) {
        return _claimTracker.isClaimed(index, totalAmount);
    }

    /// @notice Gets the amount already claimed for a specific index.
    /// @param index The index to check.
    /// @return claimedAmount The amount already claimed for this index.
    function getClaimedAmount(uint256 index) public view returns (uint256) {
        return _claimTracker.getClaimedAmount(index);
    }

    // --- External Functions ---

    /// @notice Claims an airdrop allocation for the caller.
    /// @dev Must be implemented by derived contracts. Implementations must use `_msgSender()` instead of `msg.sender`
    /// and pass it to `_processClaim`.
    /// @param index The index of the claim in the Merkle tree.
    /// @param totalAmount The total amount allocated for this index.
    /// @param merkleProof The Merkle proof array.
    function claim(uint256 index, uint256 totalAmount, bytes32[] calldata merkleProof) external virtual;

    /// @notice Claims multiple airdrop allocations for the caller in a single transaction.
    /// @dev Must be implemented by derived contracts. Implementations must use `_msgSender()` instead of `msg.sender`
    /// and pass it to `_processBatchClaim`.
    /// @param indices The indices of the claims in the Merkle tree.
    /// @param totalAmounts The total amounts allocated for each index.
    /// @param merkleProofs The Merkle proofs for each index.
    function batchClaim(
        uint256[] calldata indices,
        uint256[] calldata totalAmounts,
        bytes32[][] calldata merkleProofs
    )
        external
        virtual;

    /// @notice Allows the owner to withdraw any tokens remaining in the contract.
    /// @param to The address to send the withdrawn tokens to.
    function withdrawTokens(address to) external onlyOwner {
        if (to == address(0)) revert InvalidWithdrawalAddress();
        uint256 balance = _token.balanceOf(address(this));
        _token.safeTransfer(to, balance);
        emit TokensWithdrawn(to, balance);
    }

    // --- Internal Functions ---

    /// @notice Verifies a Merkle proof for a claim.
    /// @dev IMPORTANT: Derived contracts implementing `claim` must ensure `account` == `_msgSender()`.
    /// @param index The index of the claim in the Merkle tree.
    /// @param account The address claiming the tokens.
    /// @param totalAmount The total amount allocated for this index.
    /// @param merkleProof The Merkle proof array.
    /// @return verified True if the proof is valid, false otherwise.
    function _verifyMerkleProof(
        uint256 index,
        address account,
        uint256 totalAmount,
        bytes32[] calldata merkleProof
    )
        internal
        view
        returns (bool verified)
    {
        // Double hash the leaf node for domain separation and security
        bytes32 node = keccak256(abi.encode(keccak256(abi.encode(index, account, totalAmount))));
        return MerkleProof.verify(merkleProof, _merkleRoot, node);
    }

    /// @notice Internal function to process a single claim.
    /// @dev Validates claim, verifies proof, records claim, and transfers tokens.
    /// @param index The index in the Merkle tree.
    /// @param account The address receiving the tokens.
    /// @param claimAmount The amount to transfer.
    /// @param totalAmount The total amount allocated for this index.
    /// @param merkleProof The proof to verify.
    function _processClaim(
        uint256 index,
        address account,
        uint256 claimAmount,
        uint256 totalAmount,
        bytes32[] calldata merkleProof
    )
        internal
    {
        if (claimAmount == 0) revert ZeroClaimAmount();

        // Check if already fully claimed
        if (_claimTracker.isClaimed(index, totalAmount)) revert IndexAlreadyClaimed();

        // Verify Merkle proof
        if (!_verifyMerkleProof(index, account, totalAmount, merkleProof)) {
            revert InvalidMerkleProof();
        }

        // Check if the new claim amount is valid
        if (!_claimTracker.isClaimAmountValid(index, claimAmount, totalAmount)) {
            revert InvalidClaimAmount();
        }

        // Record the claim
        _claimTracker.recordClaim(index, claimAmount, totalAmount);

        // Transfer tokens
        _token.safeTransfer(account, claimAmount);
        emit AirdropTokensTransferred(account, index, claimAmount);
    }

    /// @notice Internal function to process a batch claim.
    /// @dev Processes multiple claims in a single transaction with batch size validation.
    /// @param indices The indices in the Merkle tree.
    /// @param account The address receiving the tokens.
    /// @param claimAmounts The amounts to transfer for each index.
    /// @param totalAmounts The total amounts allocated for each index.
    /// @param merkleProofs The proofs to verify for each index.
    /// @return totalTransferred The total amount transferred.
    function _processBatchClaim(
        uint256[] calldata indices,
        address account,
        uint256[] memory claimAmounts,
        uint256[] calldata totalAmounts,
        bytes32[][] calldata merkleProofs
    )
        internal
        checkBatchSize(indices.length)
        returns (uint256 totalTransferred)
    {
        if (
            indices.length != claimAmounts.length || claimAmounts.length != totalAmounts.length
                || totalAmounts.length != merkleProofs.length
        ) {
            revert InvalidInputArrayLengths();
        }

        totalTransferred = 0;
        address[] memory recipients = new address[](indices.length);

        for (uint256 i = 0; i < indices.length; ++i) {
            uint256 index = indices[i];
            uint256 claimAmount = claimAmounts[i];
            uint256 totalAmount = totalAmounts[i];
            bytes32[] calldata merkleProof = merkleProofs[i];

            if (claimAmount == 0) revert ZeroClaimAmount();

            // Check if already fully claimed
            if (_claimTracker.isClaimed(index, totalAmount)) revert IndexAlreadyClaimed();

            // Verify Merkle proof
            if (!_verifyMerkleProof(index, account, totalAmount, merkleProof)) {
                revert InvalidMerkleProof();
            }

            // Check if the new claim amount is valid
            if (!_claimTracker.isClaimAmountValid(index, claimAmount, totalAmount)) {
                revert InvalidClaimAmount();
            }

            // Record the claim
            _claimTracker.recordClaim(index, claimAmount, totalAmount);

            totalTransferred += claimAmount;
            recipients[i] = account;
        }

        if (totalTransferred > 0) {
            _token.safeTransfer(account, totalTransferred);
            emit AirdropBatchTokensTransferred(recipients, indices, claimAmounts);
        }

        return totalTransferred;
    }

    // --- Context Overrides (ERC2771) ---

    /// @notice Returns the sender of the transaction, supporting ERC2771 meta-transactions.
    /// @dev Overrides both ContextUpgradeable and ERC2771ContextUpgradeable implementations.
    /// @return sender The address of the transaction sender.
    function _msgSender()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address sender)
    {
        return ERC2771ContextUpgradeable._msgSender();
    }

    /// @notice Returns the calldata of the transaction, supporting ERC2771 meta-transactions.
    /// @dev Overrides both ContextUpgradeable and ERC2771ContextUpgradeable implementations.
    /// @return data The calldata of the transaction.
    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata data)
    {
        return ERC2771ContextUpgradeable._msgData();
    }

    /// @notice Returns the context suffix length for ERC2771 compatibility.
    /// @dev Overrides both ContextUpgradeable and ERC2771ContextUpgradeable implementations.
    /// @return The length of the context suffix for meta-transactions.
    function _contextSuffixLength()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return ERC2771ContextUpgradeable._contextSuffixLength();
    }
}
