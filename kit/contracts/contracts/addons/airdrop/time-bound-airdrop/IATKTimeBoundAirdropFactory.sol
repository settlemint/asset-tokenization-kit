// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Interface for ATK Time-Bound Airdrop Factory
/// @author SettleMint
/// @notice Interface for creating and managing ATK Time-Bound Airdrop proxies
/// @dev This interface defines the standard for factories that create time-bound airdrop contracts
interface IATKTimeBoundAirdropFactory {
    /// @notice Custom error for invalid address parameter.
    error InvalidAddress();
    /// @notice Custom error when attempting to set the same address.
    error SameAddress();
    /// @notice Custom error for invalid implementation address.
    error InvalidImplementation();

    /// @notice Emitted when a new time-bound airdrop proxy is created
    /// @param airdropAddress The address of the newly created time-bound airdrop proxy
    /// @param creator The address that created the time-bound airdrop
    event ATKTimeBoundAirdropCreated(address indexed airdropAddress, address indexed creator);

    /// @notice Emitted when the implementation contract is updated
    /// @param oldImplementation The address of the previous implementation
    /// @param newImplementation The address of the new implementation
    event ImplementationUpdated(address indexed oldImplementation, address indexed newImplementation);

    /// @notice Initializes the factory with access manager and system address
    /// @param accessManager The address of the access manager.
    /// @param systemAddress The address of the `IATKSystem` contract.
    function initialize(address accessManager, address systemAddress) external;

    /// @notice Returns the address of the current ATKTimeBoundAirdrop logic contract (implementation)
    /// @return The address of the time-bound airdrop implementation
    function atkTimeBoundAirdropImplementation() external view returns (address);

    /// @notice Creates a new time-bound airdrop proxy contract
    /// @param name The human-readable name for the airdrop
    /// @param token The address of the ERC20 token to be distributed
    /// @param root The Merkle root for verifying claims
    /// @param owner The initial owner of the contract
    /// @param startTime The timestamp when claims can begin
    /// @param endTime The timestamp when claims end
    /// @return airdropProxyAddress The address of the newly created time-bound airdrop proxy
    function create(string memory name, address token, bytes32 root, address owner, uint256 startTime, uint256 endTime)
        external
        returns (address airdropProxyAddress);

    /// @notice Returns the total number of time-bound airdrop proxies created by this factory
    /// @return count The number of time-bound airdrop proxies created
    function allAirdropsLength() external view returns (uint256 count);

    /// @notice Predicts the deployment address of a time-bound airdrop proxy
    /// @param name The human-readable name for the airdrop
    /// @param token The address of the ERC20 token to be distributed
    /// @param root The Merkle root for verifying claims
    /// @param owner The initial owner of the contract
    /// @param startTime The timestamp when claims can begin
    /// @param endTime The timestamp when claims end
    /// @return predictedAddress The predicted address of the time-bound airdrop proxy
    function predictTimeBoundAirdropAddress(
        string memory name,
        address token,
        bytes32 root,
        address owner,
        uint256 startTime,
        uint256 endTime
    )
        external
        view
        returns (address predictedAddress);
}
