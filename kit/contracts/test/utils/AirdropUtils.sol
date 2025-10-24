// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Airdrop Test Utils
/// @notice Shared utilities for airdrop test contracts
/// @dev Provides common functionality for Merkle tree generation, proof creation, and test data setup
library AirdropUtils {
    /// @notice Standard test user amounts used across airdrop tests
    uint256 public constant USER1_AMOUNT = 100 ether;
    uint256 public constant USER2_AMOUNT = 200 ether;
    uint256 public constant USER3_AMOUNT = 300 ether;

    /// @notice Structure to hold test user data
    struct TestUserData {
        address user1;
        address user2;
        address user3;
        mapping(address => uint256) allocations;
        mapping(address => uint256) indices;
        mapping(address => bytes32[]) proofs;
        bytes32 merkleRoot;
    }

    /// @notice Sets up standard test user allocations and indices
    /// @param userData The TestUserData struct to populate
    /// @param user1 Address of first test user
    /// @param user2 Address of second test user
    /// @param user3 Address of third test user
    function setupTestUsers(TestUserData storage userData, address user1, address user2, address user3) internal {
        userData.user1 = user1;
        userData.user2 = user2;
        userData.user3 = user3;

        userData.allocations[user1] = USER1_AMOUNT;
        userData.allocations[user2] = USER2_AMOUNT;
        userData.allocations[user3] = USER3_AMOUNT;

        userData.indices[user1] = 0;
        userData.indices[user2] = 1;
        userData.indices[user3] = 2;
    }

    /// @notice Generates a Merkle root for the standard 3-user test setup
    /// @param user1 Address of first test user
    /// @param user2 Address of second test user
    /// @param user3 Address of third test user
    /// @return root The computed Merkle root
    function generateMerkleRoot(address user1, address user2, address user3) internal pure returns (bytes32 root) {
        bytes32 leaf1 = keccak256(abi.encode(keccak256(abi.encode(0, user1, USER1_AMOUNT))));
        bytes32 leaf2 = keccak256(abi.encode(keccak256(abi.encode(1, user2, USER2_AMOUNT))));
        bytes32 leaf3 = keccak256(abi.encode(keccak256(abi.encode(2, user3, USER3_AMOUNT))));

        bytes32 node1 = hashPair(leaf1, leaf2);
        root = hashPair(node1, leaf3);
    }

    /// @notice Generates Merkle proofs for the standard 3-user test setup
    /// @param userData The TestUserData struct to populate with proofs
    function generateMerkleProofs(TestUserData storage userData) internal {
        address user1 = userData.user1;
        address user2 = userData.user2;
        address user3 = userData.user3;

        bytes32 leaf1 = keccak256(abi.encode(keccak256(abi.encode(0, user1, USER1_AMOUNT))));
        bytes32 leaf2 = keccak256(abi.encode(keccak256(abi.encode(1, user2, USER2_AMOUNT))));
        bytes32 leaf3 = keccak256(abi.encode(keccak256(abi.encode(2, user3, USER3_AMOUNT))));

        bytes32 node1 = hashPair(leaf1, leaf2);

        // Proof for user1: [leaf2, leaf3]
        userData.proofs[user1] = new bytes32[](2);
        userData.proofs[user1][0] = leaf2;
        userData.proofs[user1][1] = leaf3;

        // Proof for user2: [leaf1, leaf3]
        userData.proofs[user2] = new bytes32[](2);
        userData.proofs[user2][0] = leaf1;
        userData.proofs[user2][1] = leaf3;

        // Proof for user3: [node1]
        userData.proofs[user3] = new bytes32[](1);
        userData.proofs[user3][0] = node1;
    }

    /// @notice Utility function to hash a pair of bytes32 values in sorted order
    /// @param a First hash
    /// @param b Second hash
    /// @return The keccak256 hash of the concatenated values in sorted order
    function hashPair(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b ? keccak256(abi.encodePacked(a, b)) : keccak256(abi.encodePacked(b, a));
    }

    /// @notice Creates dummy batch data for testing batch operations
    /// @param size The size of arrays to create
    /// @return dummyIndices Array of dummy indices
    /// @return dummyAmounts Array of dummy amounts
    /// @return dummyProofs Array of dummy merkle proofs
    function createDummyBatchData(uint256 size)
        internal
        pure
        returns (uint256[] memory dummyIndices, uint256[] memory dummyAmounts, bytes32[][] memory dummyProofs)
    {
        dummyIndices = new uint256[](size);
        dummyAmounts = new uint256[](size);
        dummyProofs = new bytes32[][](size);

        for (uint256 i = 0; i < size; i++) {
            dummyIndices[i] = i;
            dummyAmounts[i] = 1 ether;
            dummyProofs[i] = new bytes32[](1);
            dummyProofs[i][0] = bytes32(i);
        }
    }

    /// @notice Creates dummy batch data for push airdrop testing (includes recipients)
    /// @param size The size of arrays to create
    /// @return dummyIndices Array of dummy indices
    /// @return dummyRecipients Array of dummy recipient addresses
    /// @return dummyAmounts Array of dummy amounts
    /// @return dummyProofs Array of dummy merkle proofs
    function createDummyPushBatchData(uint256 size)
        internal
        pure
        returns (
            uint256[] memory dummyIndices,
            address[] memory dummyRecipients,
            uint256[] memory dummyAmounts,
            bytes32[][] memory dummyProofs
        )
    {
        dummyIndices = new uint256[](size);
        dummyRecipients = new address[](size);
        dummyAmounts = new uint256[](size);
        dummyProofs = new bytes32[][](size);

        for (uint256 i = 0; i < size; i++) {
            dummyIndices[i] = i;
            // forge-lint: disable-next-line(unsafe-typecast) -- i < size so i+1 fits within 160 bits
            dummyRecipients[i] = address(uint160(i + 1)); // Generate dummy addresses
            dummyAmounts[i] = 1 ether;
            dummyProofs[i] = new bytes32[](1);
            dummyProofs[i][0] = bytes32(i);
        }
    }

    /// @notice Sets up complete test environment with users, allocations, and proofs
    /// @param userData The TestUserData struct to populate
    /// @param user1 Address of first test user
    /// @param user2 Address of second test user
    /// @param user3 Address of third test user
    /// @return merkleRoot The generated Merkle root
    function setupCompleteTestEnvironment(TestUserData storage userData, address user1, address user2, address user3)
        internal
        returns (bytes32 merkleRoot)
    {
        setupTestUsers(userData, user1, user2, user3);
        merkleRoot = generateMerkleRoot(user1, user2, user3);
        userData.merkleRoot = merkleRoot;
        generateMerkleProofs(userData);
        return merkleRoot;
    }
}
