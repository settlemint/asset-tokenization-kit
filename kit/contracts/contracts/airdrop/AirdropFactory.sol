// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {StandardAirdrop} from "./StandardAirdrop.sol";
import {VestingAirdrop} from "./VestingAirdrop.sol";
import {LinearVestingStrategy} from "./strategies/LinearVestingStrategy.sol";
import {PushAirdrop} from "./PushAirdrop.sol";

/**
 * @title AirdropFactory
 * @dev Allows easy deployment of different airdrop types
 */
contract AirdropFactory {
    // Events for deployment
    event StandardAirdropDeployed(
        address indexed airdropContract,
        address indexed tokenAddress,
        address indexed owner
    );
    event VestingAirdropDeployed(
        address indexed airdropContract,
        address indexed tokenAddress,
        address indexed owner,
        address strategy
    );
    event PushAirdropDeployed(
        address indexed airdropContract,
        address indexed tokenAddress,
        address indexed owner
    );

    /**
     * @notice Deploys a new standard airdrop contract
     * @param tokenAddress The token to be distributed
     * @param merkleRoot The Merkle root for verifying claims
     * @param owner The owner of the airdrop contract
     * @param startTime When claims can begin
     * @param endTime When claims end
     * @param trustedForwarder The address of the trusted forwarder for ERC2771
     * @return The address of the deployed airdrop contract
     */
    function deployStandardAirdrop(
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        uint256 startTime,
        uint256 endTime,
        address trustedForwarder
    ) external returns (address) {
        StandardAirdrop airdrop = new StandardAirdrop(
            tokenAddress,
            merkleRoot,
            owner,
            startTime,
            endTime,
            trustedForwarder
        );

        emit StandardAirdropDeployed(address(airdrop), tokenAddress, owner);
        return address(airdrop);
    }

    /**
     * @notice Deploys a new vesting airdrop with linear vesting strategy
     * @param tokenAddress The token to be distributed
     * @param merkleRoot The Merkle root for verifying claims
     * @param owner The owner of the airdrop contract
     * @param vestingDuration Total vesting duration in seconds
     * @param cliffDuration Initial cliff period before tokens unlock
     * @param claimPeriodEnd When users can no longer initialize vesting
     * @param trustedForwarder The address of the trusted forwarder for ERC2771
     * @return airdropAddress The address of the deployed airdrop contract
     * @return strategyAddress The address of the deployed vesting strategy
     */
    function deployLinearVestingAirdrop(
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        uint256 vestingDuration,
        uint256 cliffDuration,
        uint256 claimPeriodEnd,
        address trustedForwarder
    ) external returns (address airdropAddress, address strategyAddress) {
        // Deploy the linear vesting strategy
        LinearVestingStrategy strategy = new LinearVestingStrategy(
            vestingDuration,
            cliffDuration,
            owner,
            trustedForwarder
        );

        // Deploy the vesting airdrop with the strategy
        VestingAirdrop airdrop = new VestingAirdrop(
            tokenAddress,
            merkleRoot,
            owner,
            address(strategy),
            claimPeriodEnd,
            trustedForwarder
        );

        emit VestingAirdropDeployed(
            address(airdrop),
            tokenAddress,
            owner,
            address(strategy)
        );

        return (address(airdrop), address(strategy));
    }

    /**
     * @notice Deploys a new push airdrop contract
     * @param tokenAddress The token to be distributed
     * @param merkleRoot The Merkle root for verifying push distributions
     * @param owner The owner/admin who can push tokens
     * @param distributionCap Maximum tokens that can be distributed (0 for no cap)
     * @param trustedForwarder The address of the trusted forwarder for ERC2771
     * @return The address of the deployed push airdrop contract
     */
    function deployPushAirdrop(
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        uint256 distributionCap,
        address trustedForwarder
    ) external returns (address) {
        PushAirdrop airdrop = new PushAirdrop(
            tokenAddress,
            merkleRoot,
            owner,
            distributionCap,
            trustedForwarder
        );

        emit PushAirdropDeployed(address(airdrop), tokenAddress, owner);
        return address(airdrop);
    }
}
