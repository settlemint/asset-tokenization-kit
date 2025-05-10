// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { Vault } from "./Vault.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/// @title VaultFactory - A factory contract for creating Vault contracts
/// @notice This contract allows the creation of new Vault contracts with deterministic addresses using CREATE2.
/// It provides functionality to create multi-signature wallets with role-based access control and predict their
/// deployment addresses.
/// @dev Inherits from ReentrancyGuard for protection against reentrancy attacks and ERC2771Context for
/// meta-transaction support. Uses CREATE2 for deterministic deployment addresses and maintains a registry
/// of deployed vaults.
/// @custom:security-contact support@settlemint.com
contract VaultFactory is ReentrancyGuard, ERC2771Context {
    /// @notice Custom errors for the VaultFactory contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error AddressAlreadyDeployed();

    /// @notice Mapping to track if an address was deployed by this factory
    /// @dev Maps vault addresses to a boolean indicating if they were created by this factory
    mapping(address => bool) public isFactoryVault;

    /// @notice Emitted when a new vault is created
    /// @param vault The address of the newly created vault
    event VaultCreated(address indexed vault, address indexed creator, address[] signers, uint256 required);

    /// @notice Deploys a new VaultFactory contract
    /// @dev Sets up the factory with meta-transaction support
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    constructor(address forwarder) ERC2771Context(forwarder) { }

    /// @notice Creates a new vault contract with the specified parameters
    /// @dev Uses CREATE2 for deterministic addresses, includes reentrancy protection,
    /// and validates that the predicted address hasn't been used before.
    /// @param signers Array of initial signer addresses
    /// @param required Number of confirmations required to execute a transaction
    /// @return vault The address of the newly created vault
    function create(address[] memory signers, uint256 required) external nonReentrant returns (address vault) {
        // Check if address is already deployed
        address predicted = predictAddress(_msgSender(), signers, required);
        if (isAddressDeployed(predicted)) revert AddressAlreadyDeployed();

        bytes32 salt = _calculateSalt(signers, required, _msgSender());

        Vault newVault = new Vault{ salt: salt }(signers, required, _msgSender(), trustedForwarder());

        vault = address(newVault);
        isFactoryVault[vault] = true;

        emit VaultCreated(vault, _msgSender(), signers, required);
    }

    /// @notice Predicts the address where a vault would be deployed
    /// @dev Calculates the deterministic address using CREATE2 with the same parameters and salt
    /// computation as the create function. This allows users to know the vault's address before deployment.
    /// @param sender The address that would create the vault
    /// @param signers Array of initial signer addresses
    /// @param required Number of confirmations required to execute a transaction
    /// @return predicted The address where the vault would be deployed
    function predictAddress(
        address sender,
        address[] memory signers,
        uint256 required
    )
        public
        view
        returns (address predicted)
    {
        bytes32 salt = _calculateSalt(signers, required, sender);

        predicted = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            address(this),
                            salt,
                            keccak256(
                                abi.encodePacked(
                                    type(Vault).creationCode, abi.encode(signers, required, sender, trustedForwarder())
                                )
                            )
                        )
                    )
                )
            )
        );
    }

    /// @notice Calculates the salt for CREATE2 deployment
    /// @dev Combines the vault parameters into a unique salt value. Used by both create and
    /// predictAddress functions to ensure consistent address calculation.
    /// @param signers Array of initial signer addresses
    /// @param required Number of confirmations required to execute a transaction
    /// @param initialOwner Address that will have admin role
    /// @return The calculated salt for CREATE2 deployment
    function _calculateSalt(
        address[] memory signers,
        uint256 required,
        address initialOwner
    )
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(signers, required, initialOwner));
    }

    /// @notice Checks if an address was deployed by this factory
    /// @dev Returns true if the address was created by this factory, false otherwise
    /// @param vault The address to check
    /// @return True if the address was created by this factory, false otherwise
    function isAddressDeployed(address vault) public view returns (bool) {
        return isFactoryVault[vault];
    }
}
