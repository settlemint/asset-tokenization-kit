// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { StandardAirdrop } from "./StandardAirdrop.sol";
import { VestingAirdrop } from "./VestingAirdrop.sol";
import { LinearVestingStrategy } from "./strategies/LinearVestingStrategy.sol";
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
     * @return The address of the deployed airdrop contract
     */
    function deployStandardAirdrop(
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        uint256 startTime,
        uint256 endTime
    )
        external
        returns (address)
    {
        // Note: Standard deployment using `new` which doesn't use CREATE2 directly here.
        // Prediction function is provided separately.
        StandardAirdrop airdrop = new StandardAirdrop(
            tokenAddress,
            merkleRoot,
            owner,
            startTime,
            endTime,
            trustedForwarder() // Use internal forwarder
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
     * @return airdropAddress The address of the deployed airdrop contract
     * @return strategyAddress The address of the deployed vesting strategy
     */
    function deployLinearVestingAirdrop(
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        uint256 vestingDuration,
        uint256 cliffDuration,
        uint256 claimPeriodEnd
    )
        external
        returns (address airdropAddress, address strategyAddress)
    {
        // Deploy the linear vesting strategy first (standard deployment)
        LinearVestingStrategy strategy = new LinearVestingStrategy(
            vestingDuration,
            cliffDuration,
            owner,
            trustedForwarder() // Use internal forwarder
        );
        strategyAddress = address(strategy);

        // Deploy the vesting airdrop with the strategy (standard deployment)
        VestingAirdrop airdrop = new VestingAirdrop(
            tokenAddress,
            merkleRoot,
            owner,
            strategyAddress,
            claimPeriodEnd,
            trustedForwarder() // Use internal forwarder
        );
        airdropAddress = address(airdrop);

        emit VestingAirdropDeployed(airdropAddress, tokenAddress, owner, strategyAddress);

        // Returns are implicitly handled
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
        // Standard deployment
        PushAirdrop airdrop = new PushAirdrop(
            tokenAddress,
            merkleRoot,
            owner,
            distributionCap,
            trustedForwarder() // Use internal forwarder
        );

        emit PushAirdropDeployed(address(airdrop), tokenAddress, owner);
        return address(airdrop);
    }

    // --- Prediction Functions --- //

    /**
     * @notice Predicts the address where a StandardAirdrop would be deployed using CREATE2 logic.
     * @dev Requires the same parameters as deployStandardAirdrop.
     * @param deployer The address deploying the factory (usually msg.sender of factory deployment).
     * @param tokenAddress The token to be distributed
     * @param merkleRoot The Merkle root for verifying claims
     * @param owner The owner of the airdrop contract
     * @param startTime When claims can begin
     * @param endTime When claims end
     * @return predictedAddress The calculated CREATE2 address.
     */
    function predictStandardAirdropAddress(
        address deployer, // Explicitly pass the deployer address for prediction
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        uint256 startTime,
        uint256 endTime
    )
        public
        view
        returns (address predictedAddress)
    {
        address _trustedForwarder = trustedForwarder(); // Read state variable
        bytes32 salt =
            keccak256(abi.encodePacked(tokenAddress, merkleRoot, owner, startTime, endTime, _trustedForwarder));
        bytes32 bytecodeHash = keccak256(
            abi.encodePacked(
                type(StandardAirdrop).creationCode,
                abi.encode(tokenAddress, merkleRoot, owner, startTime, endTime, _trustedForwarder)
            )
        );
        predictedAddress =
            address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), deployer, salt, bytecodeHash)))));
    }

    /**
     * @notice Predicts the address where a VestingAirdrop and its LinearVestingStrategy would be deployed.
     * @dev Requires the same parameters as deployLinearVestingAirdrop.
     * Calculates addresses based on CREATE2 pattern, assuming sequential non-CREATE2 deployment isn't strictly
     * necessary for prediction.
     * @param deployer The address deploying the factory.
     * @param tokenAddress The token to be distributed
     * @param merkleRoot The Merkle root for verifying claims
     * @param owner The owner of the airdrop and strategy contract
     * @param vestingDuration Total vesting duration in seconds
     * @param cliffDuration Initial cliff period before tokens unlock
     * @param claimPeriodEnd When users can no longer initialize vesting
     * @return predictedAirdropAddress The calculated CREATE2 address for the VestingAirdrop.
     * @return predictedStrategyAddress The calculated CREATE2 address for the LinearVestingStrategy.
     */
    // NOTE: This prediction assumes CREATE2 deployment for *both* contracts, which differs
    // from the current `deployLinearVestingAirdrop` implementation using `new`.
    // If the goal is *only* to predict the *actual* addresses from the `new` deployment,
    // this function cannot do that deterministically without blockchain state access.
    // This function provides the *CREATE2 equivalent* prediction.
    function predictLinearVestingAirdropAddress(
        address deployer,
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        uint256 vestingDuration,
        uint256 cliffDuration,
        uint256 claimPeriodEnd
    )
        public
        view
        returns (address predictedAirdropAddress, address predictedStrategyAddress)
    {
        address _trustedForwarder = trustedForwarder(); // Read state variable

        // Predict Strategy Address
        bytes32 strategySalt = keccak256(abi.encodePacked(vestingDuration, cliffDuration, owner, _trustedForwarder));
        bytes32 strategyBytecodeHash = keccak256(
            abi.encodePacked(
                type(LinearVestingStrategy).creationCode,
                abi.encode(vestingDuration, cliffDuration, owner, _trustedForwarder)
            )
        );
        predictedStrategyAddress = address(
            uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), deployer, strategySalt, strategyBytecodeHash))))
        );

        // Predict Airdrop Address (using the *predicted* strategy address in args)
        bytes32 airdropSalt = keccak256(
            abi.encodePacked(
                tokenAddress, merkleRoot, owner, predictedStrategyAddress, claimPeriodEnd, _trustedForwarder
            )
        );
        bytes32 airdropBytecodeHash = keccak256(
            abi.encodePacked(
                type(VestingAirdrop).creationCode,
                abi.encode(tokenAddress, merkleRoot, owner, predictedStrategyAddress, claimPeriodEnd, _trustedForwarder)
            )
        );
        predictedAirdropAddress = address(
            uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), deployer, airdropSalt, airdropBytecodeHash))))
        );
    }

    /**
     * @notice Predicts the address where a PushAirdrop would be deployed using CREATE2 logic.
     * @dev Requires the same parameters as deployPushAirdrop.
     * @param deployer The address deploying the factory.
     * @param tokenAddress The token to be distributed
     * @param merkleRoot The Merkle root for verifying push distributions
     * @param owner The owner/admin who can push tokens
     * @param distributionCap Maximum tokens that can be distributed (0 for no cap)
     * @return predictedAddress The calculated CREATE2 address.
     */
    function predictPushAirdropAddress(
        address deployer,
        address tokenAddress,
        bytes32 merkleRoot,
        address owner,
        uint256 distributionCap
    )
        public
        view
        returns (address predictedAddress)
    {
        address _trustedForwarder = trustedForwarder(); // Read state variable
        bytes32 salt = keccak256(abi.encodePacked(tokenAddress, merkleRoot, owner, distributionCap, _trustedForwarder));
        bytes32 bytecodeHash = keccak256(
            abi.encodePacked(
                type(PushAirdrop).creationCode,
                abi.encode(tokenAddress, merkleRoot, owner, distributionCap, _trustedForwarder)
            )
        );
        predictedAddress =
            address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), deployer, salt, bytecodeHash)))));
    }
}
