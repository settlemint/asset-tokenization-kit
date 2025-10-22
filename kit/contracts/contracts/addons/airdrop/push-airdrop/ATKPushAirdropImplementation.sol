// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ATKAirdrop } from "../ATKAirdrop.sol";
import { ATKBitmapClaimTracker } from "../claim-tracker/ATKBitmapClaimTracker.sol";
import { IATKPushAirdrop } from "./IATKPushAirdrop.sol";
import { IATKAirdrop } from "../IATKAirdrop.sol";
import { InvalidInputArrayLengths, InvalidMerkleProof } from "../ATKAirdropErrors.sol";

/// @title ATK Push Airdrop Implementation
/// @author SettleMint
/// @notice Implementation of a push airdrop contract where only the admin can distribute tokens to recipients in the
/// ATK Protocol.
/// @dev This contract implements an admin-controlled distribution system where:
///      - Only the contract owner can distribute tokens to recipients
///      - Recipients cannot claim tokens themselves - they must be pushed by the admin
///      - Uses Merkle proof verification for secure distribution validation
///      - Tracks distributed status using ATKBitmapClaimTracker
///      - Supports both single and batch distributions
///      - Includes optional distribution cap for controlling total distributions
///
///      The contract extends ATKAirdrop but overrides claim functions to prevent user-initiated claims.
contract ATKPushAirdropImplementation is IATKPushAirdrop, ATKAirdrop, ReentrancyGuardUpgradeable {
    using SafeERC20 for IERC20;

    // --- Storage Variables ---

    /// @notice Total tokens distributed so far.
    /// @dev Tracks the cumulative amount of tokens that have been distributed.
    uint256 private _totalDistributed;

    /// @notice Maximum tokens that can be distributed (optional cap).
    /// @dev Set to 0 for no cap. Used to limit total distributions.
    uint256 private _distributionCap;

    // --- Events ---

    /// @notice Emitted when the distribution cap is updated.
    /// @param oldCap The previous distribution cap.
    /// @param newCap The new distribution cap.
    event DistributionCapUpdated(uint256 indexed oldCap, uint256 indexed newCap);

    /// @notice Constructor that prevents initialization of the implementation contract.
    /// @dev Uses the OpenZeppelin pattern to prevent the implementation from being initialized.
    /// @custom:oz-upgrades-unsafe-allow constructor
    /// @param forwarder_ The address of the forwarder contract.
    constructor(address forwarder_) ATKAirdrop(forwarder_) {
        _disableInitializers();
    }

    /// @notice Initializes the push airdrop contract with specified parameters.
    /// @dev Sets up the base airdrop functionality and push-specific parameters.
    ///      Deploys its own bitmap claim tracker for efficient distribution tracking.
    /// @param name_ The human-readable name for this airdrop.
    /// @param token_ The address of the ERC20 token to be distributed.
    /// @param root_ The Merkle root for verifying distributions.
    /// @param owner_ The initial owner of the contract (admin who can distribute tokens).
    /// @param distributionCap_ The maximum tokens that can be distributed (0 for no cap).
    function initialize(
        string calldata name_,
        address token_,
        bytes32 root_,
        address owner_,
        uint256 distributionCap_
    )
        external
        initializer
    {
        // Deploy bitmap claim tracker for this contract
        address claimTracker_ = address(new ATKBitmapClaimTracker(address(this)));

        // Initialize base airdrop contract
        __ATKAirdrop_init(name_, token_, root_, owner_, claimTracker_);
        __ReentrancyGuard_init();

        // Set push-specific state
        _distributionCap = distributionCap_;
    }

    // --- View Functions ---

    /// @notice Returns the total amount of tokens distributed so far.
    /// @return The total amount distributed.
    function totalDistributed() external view returns (uint256) {
        return _totalDistributed;
    }

    /// @notice Returns the distribution cap.
    /// @return The maximum tokens that can be distributed (0 for no cap).
    function distributionCap() external view returns (uint256) {
        return _distributionCap;
    }

    /// @notice Checks if tokens have been distributed to a specific index.
    /// @param index The index to check.
    /// @return distributed True if tokens have been distributed for this index.
    function isDistributed(uint256 index) external view returns (bool) {
        return getClaimedAmount(index) != 0;
    }

    // --- External Functions ---

    /// @notice Updates the distribution cap.
    /// @dev Only the owner can update the distribution cap.
    /// @param newDistributionCap_ The new distribution cap (0 for no cap).
    function setDistributionCap(uint256 newDistributionCap_) external onlyOwner {
        uint256 oldCap = _distributionCap;
        _distributionCap = newDistributionCap_;
        emit DistributionCapUpdated(oldCap, newDistributionCap_);
    }

    /// @notice Distributes tokens to a single recipient with Merkle proof verification.
    /// @dev Only the contract owner can distribute tokens. Verifies Merkle proof and distribution cap.
    /// @param index The index of the distribution in the Merkle tree.
    /// @param recipient The address to receive tokens.
    /// @param amount The amount of tokens to distribute.
    /// @param merkleProof The Merkle proof array for verification.
    function distribute(
        uint256 index,
        address recipient,
        uint256 amount,
        bytes32[] calldata merkleProof
    )
        external
        onlyOwner
        nonReentrant
    {
        if (recipient == address(0)) revert InvalidDistributionAddress();
        if (amount == 0) revert ZeroAmountToDistribute();

        // Check distribution cap
        if (_distributionCap > 0 && _totalDistributed + amount > _distributionCap) {
            revert DistributionCapExceeded();
        }

        // Check if already distributed
        if (getClaimedAmount(index) != 0) revert AlreadyDistributed();

        // Verify Merkle proof
        if (!_verifyMerkleProof(index, recipient, amount, merkleProof)) {
            revert InvalidMerkleProof();
        }

        // Record the distribution in the claim tracker
        _claimTracker.recordClaim(index, amount, amount);

        // Update total distributed
        _totalDistributed += amount;

        // Transfer tokens
        _token.safeTransfer(recipient, amount);
        emit AirdropTokensTransferred(recipient, index, amount);
    }

    /// @notice Distributes tokens to multiple recipients in a single transaction.
    /// @dev Only the contract owner can distribute tokens. Batch version for gas efficiency.
    /// @param indices The indices of the distributions in the Merkle tree.
    /// @param recipients The addresses to receive tokens.
    /// @param amounts The amounts of tokens to distribute to each recipient.
    /// @param merkleProofs The Merkle proof arrays for verification of each distribution.
    function batchDistribute(
        uint256[] calldata indices,
        address[] calldata recipients,
        uint256[] calldata amounts,
        bytes32[][] calldata merkleProofs
    )
        external
        onlyOwner
        nonReentrant
        checkBatchSize(indices.length)
    {
        if (
            indices.length != recipients.length || recipients.length != amounts.length
                || amounts.length != merkleProofs.length
        ) {
            revert InvalidInputArrayLengths();
        }

        uint256 batchTotal = 0;
        uint256 distributedCount = 0;

        // Perform cheap validations and calculate total
        for (uint256 i = 0; i < indices.length; ++i) {
            uint256 index = indices[i];
            address recipient = recipients[i];
            uint256 amount = amounts[i];

            // Fail fast on simple validations
            if (recipient == address(0)) revert InvalidDistributionAddress();
            if (amount == 0) revert ZeroAmountToDistribute();
            if (getClaimedAmount(index) != 0) {
                revert AlreadyDistributed();
            }

            // Add to batch total and count
            batchTotal += amount;
            ++distributedCount;
        }

        // Check distribution cap early to avoid wasting gas
        if (_distributionCap > 0 && _totalDistributed + batchTotal > _distributionCap) {
            revert DistributionCapExceeded();
        }

        // Verify Merkle proofs and perform actual distributions
        for (uint256 i = 0; i < indices.length; ++i) {
            uint256 index = indices[i];
            address recipient = recipients[i];
            uint256 amount = amounts[i];

            // Verify Merkle proof right before transfer
            if (!_verifyMerkleProof(index, recipient, amount, merkleProofs[i])) {
                revert InvalidMerkleProof();
            }

            // Record the distribution in the claim tracker
            _claimTracker.recordClaim(index, amount, amount);

            // Transfer tokens
            _token.safeTransfer(recipient, amount);
        }

        // Update total distributed
        _totalDistributed += batchTotal;

        emit AirdropBatchTokensTransferred(recipients, indices, amounts);
    }

    /// @notice Claims tokens for a recipient - NOT ALLOWED in push airdrops.
    /// @dev Overrides the abstract claim function from ATKAirdrop to prevent user-initiated claims.
    ///      In push airdrops, only the admin can distribute tokens.
    ///      All parameters are unused as this function always reverts.
    // solhint-disable-next-line use-natspec
    function claim(
        uint256, /* index - unused */
        uint256, /* totalAmount - unused */
        bytes32[] calldata /* merkleProof - unused */
    )
        external
        pure
        override(ATKAirdrop, IATKAirdrop)
    {
        revert PushAirdropClaimNotAllowed();
    }

    /// @notice Claims tokens for multiple recipients - NOT ALLOWED in push airdrops.
    /// @dev Overrides the abstract batchClaim function from ATKAirdrop to prevent user-initiated claims.
    ///      In push airdrops, only the admin can distribute tokens.
    ///      All parameters are unused as this function always reverts.
    // solhint-disable-next-line use-natspec
    function batchClaim(
        uint256[] calldata, /* indices - unused */
        uint256[] calldata, /* totalAmounts - unused */
        bytes32[][] calldata /* merkleProofs - unused */
    )
        external
        pure
        override(ATKAirdrop, IATKAirdrop)
    {
        revert PushAirdropClaimNotAllowed();
    }
}
