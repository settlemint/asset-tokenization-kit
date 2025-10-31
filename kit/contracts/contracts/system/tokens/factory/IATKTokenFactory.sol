// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IATKSystemAccessManaged } from "../../access-manager/IATKSystemAccessManaged.sol";

/// @title IATKTokenFactory Interface
/// @author SettleMint
/// @notice This interface defines the functions for a factory contract responsible for creating ATK tokens.
/// @dev This interface extends IERC165 for interface detection support.
interface IATKTokenFactory is IERC165, IATKSystemAccessManaged {
    // -- Errors --
    /// @notice Custom errors for the factory contract
    /// @dev Defines custom error types used by the contract for various failure conditions.

    error InvalidTokenAddress();
    /// @notice Error for attempting to unregister a token that is not registered.
    error InvalidImplementationAddress();
    /// @notice Error for when the provided token implementation address is the zero address.
    error ProxyCreationFailed(); // Added for CREATE2
    /// @notice Error when a CREATE2 proxy deployment fails.
    error AddressAlreadyDeployed(address predictedAddress); // Added for CREATE2
    /// @notice Error when a predicted CREATE2 address for an access manager is already marked as deployed by this
    /// factory.
    error AccessManagerAlreadyDeployed(address predictedAddress);
    /// @notice Error when a token identity address mismatch is detected.
    error TokenIdentityAddressMismatch(address deployedTokenIdentityAddress, address tokenIdentityAddress);

    // -- Events --
    /// @notice Emitted when the token implementation address is updated.
    /// @param sender The address that updated the implementation.
    /// @param oldImplementation The address of the old token implementation.
    /// @param newImplementation The address of the new token implementation.
    event TokenImplementationUpdated(
        address indexed sender, address indexed oldImplementation, address indexed newImplementation
    );

    /// @notice Emitted when a new proxy contract is created using CREATE2.
    /// @param sender The address of the sender.
    /// @param tokenAddress The address of the newly created token.
    /// @param tokenIdentity The address of the token identity.
    /// @param interfaces The array of interfaces that the token supports.
    /// @param accessManager The address of the access manager.
    event TokenAssetCreated(
        address indexed sender,
        address indexed tokenAddress,
        address indexed tokenIdentity,
        bytes4[] interfaces,
        address accessManager
    );

    /// @notice Emitted when a contract is registered with an identity and description
    /// @param sender The address that initiated the registration
    /// @param contractAddress The address of the contract being registered
    /// @param description Human-readable description of the contract (for indexing/UX)
    event ContractIdentityRegistered(address indexed sender, address indexed contractAddress, string description);

    /// @notice Emitted when a token-specific `TokenTrustedIssuersRegistry` is created and registered
    /// @param sender The caller initiating the registry creation
    /// @param registry The deployed registry address
    /// @param token The token contract address
    /// @param tokenIdentity The onchain identity address of the token
    event TokenTrustedIssuersRegistryCreated(
        address indexed sender, address indexed registry, address indexed token, address tokenIdentity
    );

    /// @notice Initializes the token registry.
    /// @param accessManager The address of the access manager
    /// @param systemAddress The address of the `IATKSystem` contract.
    /// @param tokenImplementation_ The address of the token implementation contract.
    function initialize(address accessManager, address systemAddress, address tokenImplementation_) external;

    /// @notice Returns the address of the token implementation contract.
    /// @return tokenImplementation The address of the token implementation contract.
    function tokenImplementation() external view returns (address);

    /// @notice Checks if the provided address is a valid token implementation.
    /// @param tokenImplementation_ The address to check for validity.
    /// @return True if the address is a valid token implementation, false otherwise.
    function isValidTokenImplementation(address tokenImplementation_) external view returns (bool);

    /// @notice Predicts the access manager address for a token using its metadata with the specified initial admin.
    /// @param name_ The token name.
    /// @param symbol_ The token symbol.
    /// @param decimals_ The token decimals.
    /// @param initialAdmin_ The address that will be set as the initial admin of the access manager.
    /// @return predictedAddress The deterministic address where the access manager would be deployed.
    function predictAccessManagerAddress(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address initialAdmin_
    )
        external
        view
        returns (address predictedAddress);
}
