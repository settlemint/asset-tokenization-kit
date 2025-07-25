// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

import { IATKClaimTracker } from "./IATKClaimTracker.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ATK Bitmap Claim Tracker
/// @author SettleMint
/// @notice Implementation of binary claim tracking using bitmaps for ATK airdrop contracts.
/// @dev This contract implements claim tracking for airdrops where users can only claim their full
///      allocation in a single transaction (all-or-nothing claims). It uses a bitmap for gas-efficient
///      storage, tracking claimed status as binary flags.
///
///      This implementation is optimized for scenarios with fixed allocation amounts and single claims.
///      Only the owner (typically the airdrop contract) can record claims to prevent unauthorized manipulation.
contract ATKBitmapClaimTracker is IATKClaimTracker, Ownable {
    // --- Storage Variables ---

    /// @notice Bitmap to track claimed status for each index using packed bits for gas efficiency.
    /// @dev Maps word index to a 256-bit word containing claimed flags for 256 indices.
    ///      Each bit represents whether the corresponding index has been claimed.
    mapping(uint256 => uint256) private _claimedBitMap;

    // --- Constructor ---

    /// @notice Initializes the claim tracker with the specified owner.
    /// @param owner_ The address that will own this claim tracker (typically the airdrop contract).
    constructor(address owner_) Ownable(owner_) { }

    /// @notice Checks if a claim has been fully claimed for a specific index.
    /// @dev For bitmap tracking, once claimed, the full amount is always claimed.
    ///      The second parameter is kept for interface compatibility but not used in logic.
    /// @param index The index to check in the Merkle tree.
    /// @return claimed True if the index has been claimed, false otherwise.
    // solhint-disable-next-line use-natspec
    function isClaimed(uint256 index, uint256) external view override returns (bool claimed) {
        return _isClaimedBitmap(index);
    }

    /// @notice Gets the amount already claimed for a specific index.
    /// @dev For bitmap tracking, returns either 0 (not claimed) or the total amount (fully claimed).
    /// @param index The index to check.
    /// @return claimedAmount 0 if not claimed, or a very large number to indicate fully claimed.
    function getClaimedAmount(uint256 index) external view override returns (uint256 claimedAmount) {
        return _isClaimedBitmap(index) ? type(uint256).max : 0;
    }

    /// @notice Records a claim for a specific index.
    /// @dev Only the owner (airdrop contract) can record claims to prevent unauthorized manipulation.
    ///      For bitmap tracking, any claim marks the index as fully claimed.
    /// @param index The index of the claim in the Merkle tree.
    /// @param claimedAmount The amount being claimed.
    /// @param totalAmount The total amount allocated for this index.
    function recordClaim(uint256 index, uint256 claimedAmount, uint256 totalAmount) external override onlyOwner {
        _setClaimedBitmap(index);
        emit ClaimRecorded(index, claimedAmount, totalAmount);
    }

    /// @notice Checks if a new claim amount is valid for a specific index.
    /// @dev For bitmap tracking, only valid if the index hasn't been claimed yet.
    ///      The second and third parameters are kept for interface compatibility but not used in logic.
    /// @param index The index to check.
    /// @return isValid True if the index hasn't been claimed yet, false otherwise.
    // solhint-disable-next-line use-natspec
    function isClaimAmountValid(uint256 index, uint256, uint256) external view override returns (bool isValid) {
        return !_isClaimedBitmap(index);
    }

    // --- Internal Functions ---

    /// @notice Checks if a claim has been made for a specific index using bitmap logic.
    /// @dev Uses bit manipulation to efficiently check claim status.
    /// @param index The index to check.
    /// @return Whether the index has been claimed.
    function _isClaimedBitmap(uint256 index) internal view returns (bool) {
        uint256 wordIndex = index / 256;
        uint256 bitIndex = index % 256;
        uint256 word = _claimedBitMap[wordIndex];
        uint256 mask = 1 << bitIndex;
        return (word & mask) != 0;
    }

    /// @notice Internal function to mark an index as claimed using bitmap logic.
    /// @dev Uses bit manipulation to efficiently set claim status.
    /// @param index The index to mark as claimed.
    function _setClaimedBitmap(uint256 index) internal {
        uint256 wordIndex = index / 256;
        uint256 bitIndex = index % 256;
        _claimedBitMap[wordIndex] |= (1 << bitIndex);
    }
}
