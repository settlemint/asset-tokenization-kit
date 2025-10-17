// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title IATKVaultFactory Interface
/// @author SettleMint
/// @notice Interface for the ATK Vault Factory contract
/// @dev Defines the functions for creating and managing ATK Vault contracts
interface IATKVaultFactory {
    /// @notice Emitted when a new ATK Vault contract is created
    /// @param creator Address of the account that created the vault
    /// @param vault Address of the newly created vault
    /// @param contractIdentity Address of the contract identity for the vault
    event ATKVaultCreated(address indexed creator, address indexed vault, address indexed contractIdentity);

    /// @notice Creates a new ATK Vault contract
    /// @param signers Array of initial signer addresses
    /// @param required Number of confirmations required to execute a transaction
    /// @param initialOwner Address that will have admin role
    /// @param salt Salt value for deterministic address generation
    /// @param country Country code for compliance purposes
    /// @return contractAddress Address of the newly created vault
    function createVault(address[] memory signers, uint256 required, address initialOwner, bytes32 salt, uint16 country)
        external
        returns (address contractAddress);

    /// @notice Predicts the address where an ATK Vault contract would be deployed
    /// @param signers Array of initial signer addresses
    /// @param required Number of confirmations required to execute a transaction
    /// @param initialOwner Address that will have admin role
    /// @param salt Salt value for deterministic address generation
    /// @return predictedAddress The predicted address of the vault
    function predictVaultAddress(address[] memory signers, uint256 required, address initialOwner, bytes32 salt)
        external
        view
        returns (address predictedAddress);

    /// @notice Initializes the factory contract
    /// @param accessManager The address of the access manager.
    /// @param systemAddress The address of the `IATKSystem` contract.
    function initialize(address accessManager, address systemAddress) external;

    /// @notice Returns the address of the current ATKVault logic contract (implementation)
    /// @dev This function is expected to be available on the factory contract
    /// @return The address of the ATKVault implementation
    function atkVaultImplementation() external view returns (address);
}
