// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IClaimStrategy } from "../interfaces/IClaimStrategy.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";

/**
 * @title LinearVestingStrategy
 * @dev Implements a linear vesting strategy for CustomizableAirdrop
 * NOTE: This strategy maintains its own aggregated state per user.
 * It relies on the Airdrop contract calling `recordClaim` to keep state synchronized.
 * Now includes ERC2771 support for meta-transactions (primarily for Ownable).
 */
contract LinearVestingStrategy is IClaimStrategy, Ownable, ReentrancyGuard, ERC2771Context {
    // Vesting parameters
    uint256 public immutable vestingDuration;
    uint256 public immutable cliffDuration;

    // User vesting data
    struct VestingData {
        uint256 totalAmount; // Total allocation aggregated across all user's indices
        uint256 claimedAmount; // Total amount claimed by the user (strategy's internal tracking)
        uint256 vestingStart; // Timestamp when vesting began for the user
        bool initialized; // Whether vesting has been initialized for the user
    }

    // Map of user address to their vesting data
    mapping(address => VestingData) public vestingData;

    // Events
    event VestingInitialized(address indexed account, uint256 totalAmount, uint256 vestingStart);

    // Removed VestingClaimed as strategy doesn't reliably track claims anymore

    /**
     * @dev Creates a linear vesting strategy
     * @param _vestingDuration Total vesting duration in seconds
     * @param _cliffDuration Initial cliff duration in seconds
     * @param initialOwner The owner of the contract
     * @param trustedForwarder The address of the trusted forwarder for ERC2771
     */
    constructor(
        uint256 _vestingDuration,
        uint256 _cliffDuration,
        address initialOwner,
        address trustedForwarder
    )
        Ownable(initialOwner)
        ERC2771Context(trustedForwarder)
    {
        require(_vestingDuration > 0, "Vesting duration must be positive");
        // Allow cliffDuration == 0
        require(_cliffDuration <= _vestingDuration, "Cliff cannot exceed duration");
        vestingDuration = _vestingDuration;
        cliffDuration = _cliffDuration;
    }

    /**
     * @notice Records that a claim has been processed and tokens transferred.
     * @dev Called by VestingAirdrop *after* a successful transfer.
     * Updates the strategy's internal tracking of claimed amounts.
     * Added nonReentrant modifier as a safety measure, although calls originate from trusted Airdrop contract.
     * @param account The address for whom the claim was made
     * @param amountClaimed The amount of tokens successfully transferred
     */
    function recordClaim(address account, uint256 amountClaimed) external override nonReentrant {
        VestingData storage data = vestingData[account];
        // Only record if initialized and amount is positive
        if (data.initialized && amountClaimed > 0) {
            data.claimedAmount += amountClaimed;
        }
    }

    /**
     * @notice Checks if an account is eligible to claim *something*.
     * @dev Checks if the total vested amount > strategy's tracked claimed amount.
     * Note: Strategy's claimedAmount might be stale (see processClaim).
     * @param account The address to check
     * @return eligible Whether the account might be able to claim more tokens.
     */
    function isEligibleToClaim(address account) external view override returns (bool eligible) {
        VestingData storage data = vestingData[account];
        // Must be initialized to be eligible
        if (!data.initialized) {
            return false;
        }
        // Check if calculated total vested is greater than what strategy thinks is claimed
        return _calculateVestedAmount(account) > data.claimedAmount;
    }

    /**
     * @notice Calculate the amount claimable *for a specific index* based on vesting parameters.
     * @dev This calculation is based on the allocation (`amount`) of the specific index.
     * @param account Address of the claimant (unused in this calculation logic)
     * @param amount Total allocation for the specific index being claimed
     * @param startTimestamp Global vesting start timestamp for the user (passed by VestingAirdrop)
     * @param alreadyClaimed Amount already claimed *for this specific index* (passed by VestingAirdrop)
     * @return claimableAmount The amount from *this index* that can be claimed now.
     */
    function calculateClaimableAmount(
        address account,
        uint256 amount,
        uint256 startTimestamp,
        uint256 alreadyClaimed
    )
        external
        view
        override
        returns (uint256 claimableAmount)
    {
        // Suppress unused variable warning
        account;

        // Calculate time elapsed since vesting started
        uint256 timeElapsed = block.timestamp - startTimestamp;

        // Nothing vested before cliff
        if (timeElapsed < cliffDuration) {
            return 0;
        }

        // Calculate vested amount for this specific index's allocation
        uint256 vestedAmountForIndex;
        if (timeElapsed >= vestingDuration) {
            // All tokens for this index vested
            vestedAmountForIndex = amount;
        } else {
            // Linear vesting calculation for this index
            // Safe division: vestingDuration checked > 0 in constructor
            vestedAmountForIndex = (amount * timeElapsed) / vestingDuration;
        }

        // Ensure vested amount doesn't exceed the index's total amount due to potential rounding
        if (vestedAmountForIndex > amount) {
            vestedAmountForIndex = amount;
        }

        // Return claimable amount (vested for this index minus already claimed for this index)
        uint256 claimableNow = vestedAmountForIndex > alreadyClaimed ? vestedAmountForIndex - alreadyClaimed : 0;

        return claimableNow;
    }

    /**
     * @notice Initialize vesting for an account or aggregate total amount during batch init.
     * @dev Called potentially multiple times by VestingAirdrop during batch init.
     * Sets vestingStart on first call. Aggregates totalAmount.
     * @param account Address initializing the claim
     * @param amount Total allocation amount for the index being initialized
     * @return initialAmount Amount to transfer immediately (if cliff duration is 0).
     */
    function initializeVesting(address account, uint256 amount) external override returns (uint256 initialAmount) {
        VestingData storage data = vestingData[account];
        initialAmount = 0;

        // Initialize vesting data on the very first call for this user
        if (!data.initialized) {
            data.initialized = true;
            data.vestingStart = block.timestamp;
            data.claimedAmount = 0; // Initialize claimed amount to zero
            data.totalAmount = amount; // Start aggregating total amount

            emit VestingInitialized(account, data.totalAmount, data.vestingStart);

            // If there's no cliff, calculate initial release based on 1 second elapsed
            if (cliffDuration == 0 && vestingDuration > 0) {
                // Minimal time elapsed for calculation robustness
                uint256 timeElapsed = 1;
                initialAmount = (amount * timeElapsed) / vestingDuration;

                // Ensure initial amount doesn't exceed amount due to rounding/duration=1 edge case
                if (initialAmount > amount) {
                    initialAmount = amount;
                }

                // DO NOT update claimedAmount here. `recordClaim` handles it.
            }
        } else {
            // If already initialized (likely subsequent call in a batch init),
            // just add to the total amount. Start time and claimed amount remain.
            data.totalAmount += amount;
            // Emit event again to signal updated total amount (optional)
            emit VestingInitialized(account, data.totalAmount, data.vestingStart);

            // Recalculate initial amount for zero-cliff case based on the *new total*
            // This handles batching correctly if cliff is zero.
            if (cliffDuration == 0 && vestingDuration > 0) {
                uint256 timeElapsed = block.timestamp - data.vestingStart;
                // For robustness on the exact init block, use at least 1 sec
                if (timeElapsed == 0) timeElapsed = 1;

                uint256 totalVestedImmediately = (data.totalAmount * timeElapsed) / vestingDuration;

                if (totalVestedImmediately > data.totalAmount) {
                    totalVestedImmediately = data.totalAmount;
                }

                // How much *newly* vested amount needs to be released now?
                if (totalVestedImmediately > data.claimedAmount) {
                    uint256 newlyClaimable = totalVestedImmediately - data.claimedAmount;
                    initialAmount = newlyClaimable; // This call returns the newly claimable part
                        // DO NOT update claimedAmount here. `recordClaim` handles it.
                } else {
                    initialAmount = 0; // Nothing new claimable right now
                }
            }
        }
        return initialAmount;
    }

    /**
     * @notice Finalize batch processing. Called by VestingAirdrop.
     * @dev No strategy-specific state needs cleanup in this simplified version.
     */
    function finalizeBatch(address /* account */ ) external pure override {
        // Intentionally empty in this strategy implementation
    }

    /**
     * @notice Returns whether this strategy requires multiple claims (vesting).
     * @return isVesting Always true for LinearVestingStrategy.
     */
    function supportsMultipleClaims() external pure override returns (bool) {
        return true;
    }

    /**
     * @notice Gets the vesting status for an account based on strategy's internal state.
     * @dev claimedAmount might lag behind actual claims (see processClaim).
     * @param account The account to check
     * @return totalAmount Total allocation aggregated by strategy
     * @return claimedAmount Amount claimed according to strategy's internal state
     * @return vestedAmount Total amount vested so far calculated by strategy
     * @return claimableAmount Amount currently claimable (vestedAmount - claimedAmount)
     * @return startTimestamp The vesting start timestamp
     * @return initialized Whether vesting has been initialized
     */
    function getVestingStatus(address account)
        external
        view
        returns (
            uint256 totalAmount,
            uint256 claimedAmount, // Strategy's view, should now be accurate
            uint256 vestedAmount,
            uint256 claimableAmount,
            uint256 startTimestamp,
            bool initialized
        )
    {
        VestingData storage data = vestingData[account];
        totalAmount = data.totalAmount; // Strategy's view
        claimedAmount = data.claimedAmount; // Strategy's view - now synchronized via recordClaim
        initialized = data.initialized;
        startTimestamp = data.vestingStart;

        if (!initialized) {
            return (0, 0, 0, 0, 0, false);
        }

        // Calculate total vested based on strategy's state
        vestedAmount = _calculateVestedAmount(account);
        claimableAmount = vestedAmount > claimedAmount ? vestedAmount - claimedAmount : 0;
    }

    /**
     * @dev Internal function to calculate the total vested amount for an account.
     * Uses the strategy's stored totalAmount and vestingStart.
     * @param account The account to calculate for
     * @return amount The total vested amount calculated based on strategy state.
     */
    function _calculateVestedAmount(address account) internal view returns (uint256 amount) {
        VestingData storage data = vestingData[account];

        // If not initialized or total amount is 0
        if (!data.initialized || data.totalAmount == 0) {
            return 0;
        }

        // Calculate time elapsed since vesting started
        uint256 timeElapsed = block.timestamp - data.vestingStart;

        // Nothing vested before cliff
        if (timeElapsed < cliffDuration) {
            return 0;
        }

        // After vesting duration, everything is vested
        if (timeElapsed >= vestingDuration) {
            return data.totalAmount;
        }

        // Linear vesting calculation
        // Safe division: vestingDuration checked > 0 in constructor
        amount = (data.totalAmount * timeElapsed) / vestingDuration;

        // Ensure vested amount doesn't exceed totalAmount due to potential rounding
        if (amount > data.totalAmount) {
            amount = data.totalAmount;
        }
        return amount;
    }

    // --- ERC2771 Context Overrides ---

    /**
     * @dev Overrides the underlying `_msgSender` logic to support ERC2771.
     */
    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address sender) {
        return ERC2771Context._msgSender();
    }

    /**
     * @dev Overrides the underlying `_msgData` logic to support ERC2771.
     */
    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata data) {
        return ERC2771Context._msgData();
    }

    /**
     * @dev Overrides the underlying `_contextSuffixLength` logic for ERC2771 compatibility.
     */
    function _contextSuffixLength() internal view virtual override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }
}
