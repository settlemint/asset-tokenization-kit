// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { StandardAirdrop } from "./StandardAirdrop.sol";
import { VestingAirdrop } from "./VestingAirdrop.sol";
import { LinearVestingStrategy } from "./airdrop/strategies/LinearVestingStrategy.sol";
import { PushAirdrop } from "./PushAirdrop.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/**
 * @title AirdropFactory
 * @dev Allows easy deployment of different airdrop types
 * Includes prediction functions for deterministic address calculation using CREATE2 pattern.
 * Inherits ERC2771Context for potential meta-transaction support and consistent forwarder handling.
 */
contract AirdropFactory is ERC2771Context {
    // Events for deployment
    event StandardAirdropDeployed(address indexed airdropContract, address indexed tokenAddress, address indexed owner);
    event VestingAirdropDeployed(
        address indexed airdropContract, address indexed tokenAddress, address indexed owner, address strategy
    );
    event PushAirdropDeployed(address indexed airdropContract, address indexed tokenAddress, address indexed owner);

    /**
     * @notice Deploys a new AirdropFactory contract
     * @param forwarder The address of the trusted forwarder for meta-transactions
     */
    constructor(address forwarder) ERC2771Context(forwarder) { }

    /**
     * @notice Deploys a new standard airdrop contract
     * @param tokenAddress The token to be distributed
     * @param merkleRoot The Merkle root for verifying claims
     * @param owner The owner of the airdrop contract
     * @param startTime When claims can begin
     * @param endTime When claims end
     * @param name The name of the airdrop
     * @param distributionIpfsHash IPFS hash containing distribution details
     * @return The address of the deployed airdrop contract
     */
    function deployStandardAirdrop(
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        uint256 startTime,
        uint256 endTime,
        string memory name,
        string memory distributionIpfsHash
    )
        external
        returns (address)
    {
        bytes32 salt = _calculateStandardAirdropSalt(
            tokenAddress, merkleRoot, owner, startTime, endTime, name, distributionIpfsHash
        );

        StandardAirdrop airdrop = new StandardAirdrop{ salt: salt }(
            tokenAddress, merkleRoot, owner, startTime, endTime, trustedForwarder(), name, distributionIpfsHash
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
     * @param name The name of the airdrop
     * @param distributionIpfsHash IPFS hash containing distribution details
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
        string memory name,
        string memory distributionIpfsHash
    )
        external
        returns (address airdropAddress, address strategyAddress)
    {
        bytes32 strategySalt = _calculateLinearVestingStrategySalt(vestingDuration, cliffDuration, owner);

        LinearVestingStrategy strategy = new LinearVestingStrategy{ salt: strategySalt }(
            vestingDuration,
            cliffDuration,
            owner,
            trustedForwarder() // Use internal forwarder
        );
        strategyAddress = address(strategy);

        bytes32 airdropSalt = _calculateVestingAirdropSalt(
            tokenAddress, merkleRoot, owner, strategyAddress, claimPeriodEnd, name, distributionIpfsHash
        );

        VestingAirdrop airdrop = new VestingAirdrop{ salt: airdropSalt }(
            tokenAddress,
            merkleRoot,
            owner,
            strategyAddress,
            claimPeriodEnd,
            trustedForwarder(),
            name,
            distributionIpfsHash
        );
        airdropAddress = address(airdrop);

        emit VestingAirdropDeployed(airdropAddress, tokenAddress, owner, strategyAddress);
    }

    /**
     * @notice Deploys a new push airdrop contract
     * @param tokenAddress The token to be distributed
     * @param merkleRoot The Merkle root for verifying push distributions
     * @param owner The owner/admin who can push tokens
     * @param distributionCap Maximum tokens that can be distributed (0 for no cap)
     * @return The address of the deployed push airdrop contract
     */
    function deployPushAirdrop(
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        uint256 distributionCap
    )
        external
        returns (address)
    {
        bytes32 salt = _calculatePushAirdropSalt(tokenAddress, merkleRoot, owner, distributionCap);

        PushAirdrop airdrop =
            new PushAirdrop{ salt: salt }(tokenAddress, merkleRoot, owner, distributionCap, trustedForwarder());

        emit PushAirdropDeployed(address(airdrop), tokenAddress, owner);
        return address(airdrop);
    }

    /**
     * @notice Predicts the address where a StandardAirdrop would be deployed using CREATE2 logic.
     * @dev Requires the same parameters as deployStandardAirdrop.
     * @param tokenAddress The token to be distributed
     * @param merkleRoot The Merkle root for verifying claims
     * @param owner The owner of the airdrop contract
     * @param startTime When claims can begin
     * @param endTime When claims end
     * @param name The name of the airdrop
     * @param distributionIpfsHash IPFS hash containing distribution details
     * @return predictedAddress The calculated CREATE2 address.
     */
    function predictStandardAirdropAddress(
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        uint256 startTime,
        uint256 endTime,
        string memory name,
        string memory distributionIpfsHash
    )
        public
        view
        returns (address predictedAddress)
    {
        bytes32 salt = _calculateStandardAirdropSalt(
            tokenAddress, merkleRoot, owner, startTime, endTime, name, distributionIpfsHash
        );
        bytes32 bytecodeHash = keccak256(
            abi.encodePacked(
                type(StandardAirdrop).creationCode,
                abi.encode(
                    tokenAddress, merkleRoot, owner, startTime, endTime, trustedForwarder(), name, distributionIpfsHash
                )
            )
        );
        predictedAddress =
            address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, bytecodeHash)))));
    }

    /**
     * @notice Predicts the address where a VestingAirdrop and its LinearVestingStrategy would be deployed.
     * @dev Requires the same parameters as deployLinearVestingAirdrop.
     * @param tokenAddress The token to be distributed
     * @param merkleRoot The Merkle root for verifying claims
     * @param owner The owner of the airdrop and strategy contract
     * @param vestingDuration Total vesting duration in seconds
     * @param cliffDuration Initial cliff period before tokens unlock
     * @param claimPeriodEnd When users can no longer initialize vesting
     * @param name The name of the airdrop
     * @param distributionIpfsHash IPFS hash containing distribution details
     * @return predictedAirdropAddress The calculated CREATE2 address for the VestingAirdrop.
     * @return predictedStrategyAddress The calculated CREATE2 address for the LinearVestingStrategy.
     */
    function predictLinearVestingAirdropAddress(
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        uint256 vestingDuration,
        uint256 cliffDuration,
        uint256 claimPeriodEnd,
        string memory name,
        string memory distributionIpfsHash
    )
        public
        view
        returns (address predictedAirdropAddress, address predictedStrategyAddress)
    {
        bytes32 strategySalt = _calculateLinearVestingStrategySalt(vestingDuration, cliffDuration, owner);
        bytes32 strategyBytecodeHash = keccak256(
            abi.encodePacked(
                type(LinearVestingStrategy).creationCode,
                abi.encode(vestingDuration, cliffDuration, owner, trustedForwarder())
            )
        );
        predictedStrategyAddress = address(
            uint160(
                uint256(keccak256(abi.encodePacked(bytes1(0xff), address(this), strategySalt, strategyBytecodeHash)))
            )
        );

        bytes32 airdropSalt = _calculateVestingAirdropSalt(
            tokenAddress, merkleRoot, owner, predictedStrategyAddress, claimPeriodEnd, name, distributionIpfsHash
        );
        bytes32 airdropBytecodeHash = keccak256(
            abi.encodePacked(
                type(VestingAirdrop).creationCode,
                abi.encode(
                    tokenAddress,
                    merkleRoot,
                    owner,
                    predictedStrategyAddress,
                    claimPeriodEnd,
                    trustedForwarder(),
                    name,
                    distributionIpfsHash
                )
            )
        );
        predictedAirdropAddress = address(
            uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), address(this), airdropSalt, airdropBytecodeHash))))
        );
    }

    /**
     * @notice Predicts the address where a PushAirdrop would be deployed using CREATE2 logic.
     * @dev Requires the same parameters as deployPushAirdrop.
     * @param tokenAddress The token to be distributed
     * @param merkleRoot The Merkle root for verifying push distributions
     * @param owner The owner/admin who can push tokens
     * @param distributionCap Maximum tokens that can be distributed (0 for no cap)
     * @return predictedAddress The calculated CREATE2 address.
     */
    function predictPushAirdropAddress(
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        uint256 distributionCap
    )
        public
        view
        returns (address predictedAddress)
    {
        bytes32 salt = _calculatePushAirdropSalt(tokenAddress, merkleRoot, owner, distributionCap);
        bytes32 bytecodeHash = keccak256(
            abi.encodePacked(
                type(PushAirdrop).creationCode,
                abi.encode(tokenAddress, merkleRoot, owner, distributionCap, trustedForwarder())
            )
        );
        predictedAddress =
            address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, bytecodeHash)))));
    }

    /**
     * @notice Calculates the salt for StandardAirdrop CREATE2 deployment
     * @param tokenAddress The token to be distributed
     * @param merkleRoot The Merkle root for verifying claims
     * @param owner The owner of the airdrop contract
     * @param startTime When claims can begin
     * @param endTime When claims end
     * @param name The name of the airdrop
     * @param distributionIpfsHash IPFS hash containing distribution details
     * @return The calculated salt for CREATE2 deployment
     */
    function _calculateStandardAirdropSalt(
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        uint256 startTime,
        uint256 endTime,
        string memory name,
        string memory distributionIpfsHash
    )
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(abi.encodePacked(tokenAddress, merkleRoot, owner, startTime, endTime, name, distributionIpfsHash));
    }

    /**
     * @notice Calculates the salt for LinearVestingStrategy CREATE2 deployment
     * @param vestingDuration Total vesting duration in seconds
     * @param cliffDuration Initial cliff period before tokens unlock
     * @param owner The owner of the strategy contract
     * @return The calculated salt for CREATE2 deployment
     */
    function _calculateLinearVestingStrategySalt(
        uint256 vestingDuration,
        uint256 cliffDuration,
        address owner
    )
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(vestingDuration, cliffDuration, owner));
    }

    /**
     * @notice Calculates the salt for VestingAirdrop CREATE2 deployment
     * @param tokenAddress The token to be distributed
     * @param merkleRoot The Merkle root for verifying claims
     * @param owner The owner of the airdrop contract
     * @param strategyAddress The address of the vesting strategy
     * @param claimPeriodEnd When users can no longer initialize vesting
     * @param name The name of the airdrop
     * @param distributionIpfsHash IPFS hash containing distribution details
     * @return The calculated salt for CREATE2 deployment
     */
    function _calculateVestingAirdropSalt(
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        address strategyAddress,
        uint256 claimPeriodEnd,
        string memory name,
        string memory distributionIpfsHash
    )
        internal
        pure
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                tokenAddress, merkleRoot, owner, strategyAddress, claimPeriodEnd, name, distributionIpfsHash
            )
        );
    }

    /**
     * @notice Calculates the salt for PushAirdrop CREATE2 deployment
     * @param tokenAddress The token to be distributed
     * @param merkleRoot The Merkle root for verifying push distributions
     * @param owner The owner/admin who can push tokens
     * @param distributionCap Maximum tokens that can be distributed (0 for no cap)
     * @return The calculated salt for CREATE2 deployment
     */
    function _calculatePushAirdropSalt(
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        uint256 distributionCap
    )
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(tokenAddress, merkleRoot, owner, distributionCap));
    }
}
