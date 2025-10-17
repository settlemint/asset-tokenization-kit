// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Interface for ATK Push Airdrop Factory
/// @author SettleMint
/// @notice Interface for creating and managing ATK Push Airdrop proxies
/// @dev This interface defines the standard for factories that create push airdrop contracts
interface IATKPushAirdropFactory {
    /// @notice Custom error for invalid address parameter.
    error InvalidAddress();
    /// @notice Custom error when attempting to set the same address.
    error SameAddress();
    /// @notice Custom error for invalid implementation address.
    error InvalidImplementation();

    /// @notice Emitted when a new push airdrop proxy is created
    /// @param airdropAddress The address of the newly created push airdrop proxy
    /// @param creator The address that created the push airdrop
    event ATKPushAirdropCreated(address indexed airdropAddress, address indexed creator);

    /// @notice Emitted when the implementation contract is updated
    /// @param oldImplementation The address of the previous implementation
    /// @param newImplementation The address of the new implementation
    event ImplementationUpdated(address indexed oldImplementation, address indexed newImplementation);

    /// @notice Initializes the factory with access manager and system address
    /// @param accessManager The address of the access manager.
    /// @param systemAddress The address of the `IATKSystem` contract.
    function initialize(address accessManager, address systemAddress) external;

    /// @notice Returns the address of the current ATKPushAirdrop logic contract (implementation)
    /// @return The address of the push airdrop implementation
    function atkPushAirdropImplementation() external view returns (address);

    /// @notice Creates a new push airdrop proxy contract
    /// @param name The human-readable name for the airdrop
    /// @param token The address of the ERC20 token to be distributed
    /// @param root The Merkle root for verifying distributions
    /// @param owner The initial owner of the contract (admin who can distribute tokens)
    /// @param distributionCap The maximum tokens that can be distributed (0 for no cap)
    /// @return airdropProxyAddress The address of the newly created push airdrop proxy
    function create(string memory name, address token, bytes32 root, address owner, uint256 distributionCap)
        external
        returns (address airdropProxyAddress);

    /// @notice Returns the total number of push airdrop proxies created by this factory
    /// @return count The number of push airdrop proxies created
    function allAirdropsLength() external view returns (uint256 count);

    /// @notice Predicts the deployment address of a push airdrop proxy
    /// @param name The human-readable name for the airdrop
    /// @param token The address of the ERC20 token to be distributed
    /// @param root The Merkle root for verifying distributions
    /// @param owner The initial owner of the contract
    /// @param distributionCap The maximum tokens that can be distributed
    /// @return predictedAddress The predicted address of the push airdrop proxy
    function predictPushAirdropAddress(
        string memory name,
        address token,
        bytes32 root,
        address owner,
        uint256 distributionCap
    )
        external
        view
        returns (address predictedAddress);
}
