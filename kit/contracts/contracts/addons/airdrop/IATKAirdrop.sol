// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Interface imports
import { IATKClaimTracker } from "./claim-tracker/IATKClaimTracker.sol";

/// @title Interface for a ATK Airdrop
/// @author SettleMint
/// @notice Defines the core functionality for Merkle-based airdrop distributions in the ATK Protocol.
/// @dev This interface provides the base functionality for airdrop contracts including:
///      - Merkle proof verification
///      - Claim tracking
///      - Token distribution
///      - Meta-transaction support
///      - Named airdrop identification
interface IATKAirdrop {
    // --- Events ---

    /// @notice Emitted when tokens are transferred from the airdrop contract.
    /// @dev Fired on user claims or admin-initiated push distributions.
    /// @param recipient The address that received the tokens.
    /// @param index The allocation index from the Merkle tree.
    /// @param amount The amount transferred.
    event AirdropTokensTransferred(address indexed recipient, uint256 indexed index, uint256 indexed amount);

    /// @notice Emitted when multiple token allocations are transferred in one transaction.
    /// @dev Handles both batch claims by a single user and batch distributions to many.
    /// @param recipients An array of addresses that received tokens.
    /// @param indices The corresponding allocation indices from the Merkle tree.
    /// @param amounts The corresponding amounts transferred for each allocation.
    event AirdropBatchTokensTransferred(address[] recipients, uint256[] indices, uint256[] amounts);

    /// @notice Emitted when the contract owner withdraws unclaimed tokens.
    /// @param to The address receiving the withdrawn tokens.
    /// @param amount The amount of tokens withdrawn.
    event TokensWithdrawn(address indexed to, uint256 indexed amount);

    // --- View Functions ---

    /// @notice Returns the name of this airdrop.
    /// @return The human-readable name of the airdrop.
    function name() external view returns (string memory);

    /// @notice Returns the token being distributed in this airdrop.
    /// @return The ERC20 token being distributed.
    function token() external view returns (IERC20);

    /// @notice Returns the Merkle root for verifying airdrop claims.
    /// @return The Merkle root for verifying airdrop claims.
    function merkleRoot() external view returns (bytes32);

    /// @notice Returns the claim tracker contract.
    /// @return The claim tracker contract.
    function claimTracker() external view returns (IATKClaimTracker);

    /// @notice Checks if a claim has been fully claimed for a specific index.
    /// @param index The index to check in the Merkle tree.
    /// @param totalAmount The total amount allocated for this index.
    /// @return claimed True if the index has been fully claimed, false otherwise.
    function isClaimed(uint256 index, uint256 totalAmount) external view returns (bool);

    /// @notice Gets the amount already claimed for a specific index.
    /// @param index The index to check.
    /// @return claimedAmount The amount already claimed for this index.
    function getClaimedAmount(uint256 index) external view returns (uint256);

    // --- State-Changing Functions ---

    /// @notice Claims an airdrop allocation for the caller.
    /// @param index The index of the claim in the Merkle tree.
    /// @param totalAmount The total amount allocated for this index.
    /// @param merkleProof The Merkle proof array.
    function claim(uint256 index, uint256 totalAmount, bytes32[] calldata merkleProof) external;

    /// @notice Claims multiple airdrop allocations for the caller in a single transaction.
    /// @param indices The indices of the claims in the Merkle tree.
    /// @param totalAmounts The total amounts allocated for each index.
    /// @param merkleProofs The Merkle proofs for each index.
    function batchClaim(
        uint256[] calldata indices,
        uint256[] calldata totalAmounts,
        bytes32[][] calldata merkleProofs
    )
        external;

    /// @notice Allows the owner to withdraw any tokens remaining in the contract.
    /// @param to The address to send the withdrawn tokens to.
    function withdrawTokens(address to) external;
}
