// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

contract CTRStorage {
    /// @dev All required Claim Topics
    uint256[] internal _claimTopics;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     */
    uint256[49] private __gap;
}
