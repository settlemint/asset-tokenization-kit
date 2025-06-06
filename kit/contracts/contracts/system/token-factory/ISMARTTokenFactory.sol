// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title ISMARTTokenFactory Interface
/// @author SettleMint Tokenization Services
/// @notice This interface defines the functions for a factory contract responsible for creating SMART tokens.
/// @dev This interface extends IERC165 for interface detection support.
interface ISMARTTokenFactory is IERC165 {
    /// @notice Emitted when the token implementation address is updated.
    /// @param oldImplementation The address of the old token implementation.
    /// @param newImplementation The address of the new token implementation.
    event TokenImplementationUpdated(
        address indexed sender, address indexed oldImplementation, address indexed newImplementation
    );

    /// @notice Emitted when a new proxy contract is created using CREATE2.
    /// @param sender The address of the sender.
    /// @param tokenAddress The address of the newly created token.
    /// @param tokenIdentity The address of the token identity.
    /// @param accessManager The address of the access manager.
    event TokenAssetCreated(
        address indexed sender, address indexed tokenAddress, address indexed tokenIdentity, address accessManager
    );

    /// @notice Initializes the token registry.
    /// @param systemAddress The address of the `ISMARTSystem` contract.
    /// @param tokenImplementation_ The address of the token implementation contract.
    /// @param initialAdmin The address of the initial admin for the token registry.
    /// @param identityVerificationModule The address of the identity verification module.
    function initialize(
        address systemAddress,
        address tokenImplementation_,
        address initialAdmin,
        address identityVerificationModule
    )
        external;

    /// @notice Returns the address of the token implementation contract.
    /// @return tokenImplementation The address of the token implementation contract.
    function tokenImplementation() external view returns (address);

    /// @notice Returns the address of the token implementation contract.
    /// @return tokenImplementation The address of the token implementation contract.
    function isValidTokenImplementation(address tokenImplementation_) external view returns (bool);
}
