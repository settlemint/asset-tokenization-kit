// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Interface for ATK Vesting Airdrop Factory
/// @author SettleMint
/// @notice This interface defines the functions for creating and managing ATK vesting airdrop contracts.
interface IATKVestingAirdropFactory {
    /// @notice Emitted when the `atkVestingAirdropImplementation` is updated.
    /// @param oldImplementation The address of the previous implementation contract.
    /// @param newImplementation The address of the new implementation contract.
    event ImplementationUpdated(address indexed oldImplementation, address indexed newImplementation);

    /// @notice Emitted when a new `ATKVestingAirdrop` proxy contract is successfully created and deployed.
    /// @param airdrop The address of the newly deployed `ATKVestingAirdropProxy` contract.
    /// @param name The human-readable name for this airdrop.
    /// @param token The address of the ERC20 token to be distributed.
    /// @param root The Merkle root for verifying claims.
    /// @param owner The initial owner of the contract.
    /// @param vestingStrategy The address of the vesting strategy contract for vesting calculations.
    /// @param initializationDeadline The timestamp after which no new vesting can be initialized.
    /// @param creator The address that initiated the creation of the airdrop proxy.
    event ATKVestingAirdropCreated(
        address indexed airdrop,
        string name,
        address token,
        bytes32 root,
        address owner,
        address vestingStrategy,
        uint256 initializationDeadline,
        address creator
    );

    /// @notice Custom error for invalid address parameter.
    error InvalidAddress();
    /// @notice Custom error when attempting to set the same address.
    error SameAddress();
    /// @notice Custom error for invalid implementation address.
    error InvalidImplementation();

    /// @notice Returns the address of the current ATKVestingAirdrop logic contract (implementation).
    /// @dev This function is expected to be available on the factory contract.
    /// It's typically created automatically if the factory has a public state variable
    /// named `atkVestingAirdropImplementation`.
    function atkVestingAirdropImplementation() external view returns (address);

    /// @notice Creates a new ATKVestingAirdrop proxy contract.
    /// @dev This function is expected to be available on the factory contract.
    /// It's typically created automatically if the factory has a public state variable
    /// named `atkVestingAirdropImplementation`.
    /// @param name The human-readable name for this airdrop.
    /// @param token The address of the ERC20 token to be distributed.
    /// @param root The Merkle root for verifying claims.
    /// @param owner The initial owner of the contract.
    /// @param vestingStrategy The address of the vesting strategy contract for vesting calculations.
    /// @param initializationDeadline The timestamp after which no new vesting can be initialized.
    /// @return airdropProxyAddress The address of the newly created ATKVestingAirdropProxy contract.
    function create(
        string memory name,
        address token,
        bytes32 root,
        address owner,
        address vestingStrategy,
        uint256 initializationDeadline
    )
        external
        returns (address airdropProxyAddress);

    /// @notice Predicts the deployment address of a vesting airdrop proxy.
    /// @param name The human-readable name for this airdrop.
    /// @param token The address of the ERC20 token to be distributed.
    /// @param root The Merkle root for verifying claims.
    /// @param owner The initial owner of the contract.
    /// @param vestingStrategy The address of the vesting strategy contract for vesting calculations.
    /// @param initializationDeadline The timestamp after which no new vesting can be initialized.
    /// @return predictedAddress The predicted address of the vesting airdrop proxy.
    function predictVestingAirdropAddress(
        string memory name,
        address token,
        bytes32 root,
        address owner,
        address vestingStrategy,
        uint256 initializationDeadline
    )
        external
        view
        returns (address predictedAddress);

    /// @notice Returns the total number of vesting airdrop proxy contracts created by this factory.
    /// @return count The total number of vesting airdrop proxy contracts created.
    function allAirdropsLength() external view returns (uint256 count);
}
