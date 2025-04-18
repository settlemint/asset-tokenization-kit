// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { DvPSwap } from "./DvPSwap.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/// @title DvPSwapFactory - A factory contract for creating DvPSwap contracts
/// @notice This contract allows the creation of new DvPSwap contracts with deterministic addresses using CREATE2.
/// @dev Inherits from ReentrancyGuard for protection against reentrancy attacks and ERC2771Context for
/// meta-transaction support. Uses CREATE2 for deterministic deployment addresses and maintains a registry
/// of deployed swap contracts.
/// @custom:security-contact support@settlemint.com
contract DvPSwapFactory is ReentrancyGuard, ERC2771Context {
    /// @notice Custom errors for the DvPSwapFactory contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error AddressAlreadyDeployed();

    /// @notice Mapping to track if an address was deployed by this factory
    /// @dev Maps swap contract addresses to a boolean indicating if they were created by this factory
    mapping(address => bool) public isDvPSwapFromFactory;

    /// @notice Emitted when a new DvPSwap contract is created
    /// @param dvpSwapContract The address of the newly created swap contract
    /// @param creator The address that created the swap contract
    event DvPSwapContractCreated(address indexed dvpSwapContract, address indexed creator);

    /// @notice Deploys a new DvPSwapFactory contract
    /// @dev Sets up the factory with meta-transaction support
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    constructor(address forwarder) ERC2771Context(forwarder) { }

    /// @notice Creates a new DvPSwap contract
    /// @dev Uses CREATE2 for deterministic addresses, includes reentrancy protection,
    /// and validates that the predicted address hasn't been used before.
    /// @param salt A unique value used to determine the contract address
    /// @return dvpSwapContract The address of the newly created swap contract
    function create(bytes32 salt)
        external
        nonReentrant
        returns (address dvpSwapContract)
    {
        // Check if address is already deployed
        address predicted = predictAddress(_msgSender(), salt);
        if (isAddressDeployed(predicted)) revert AddressAlreadyDeployed();

        // Calculate the final salt by combining the sender with the provided salt
        bytes32 finalSalt = keccak256(abi.encodePacked(_msgSender(), salt));

        // Deploy the DvPSwap contract
        DvPSwap newDvPSwapContract = new DvPSwap{ salt: finalSalt }(
            trustedForwarder()
        );
        
        // Grant roles to the message sender
        newDvPSwapContract.grantRole(newDvPSwapContract.DEFAULT_ADMIN_ROLE(), _msgSender());
        newDvPSwapContract.grantRole(newDvPSwapContract.PAUSER_ROLE(), _msgSender());

        dvpSwapContract = address(newDvPSwapContract);
        isDvPSwapFromFactory[dvpSwapContract] = true;

        emit DvPSwapContractCreated(dvpSwapContract, _msgSender());
    }

    /// @notice Predicts the address where a DvPSwap contract would be deployed
    /// @dev Calculates the deterministic address using CREATE2 with the same parameters and salt
    /// computation as the create function. This allows users to know the contract's address before deployment.
    /// @param sender The address that would create the swap contract
    /// @param salt A unique value used to determine the contract address
    /// @return predicted The address where the swap contract would be deployed
    function predictAddress(
        address sender,
        bytes32 salt
    )
        public
        view
        returns (address predicted)
    {
        // Calculate the final salt by combining the sender with the provided salt
        bytes32 finalSalt = keccak256(abi.encodePacked(sender, salt));

        predicted = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            address(this),
                            finalSalt,
                            keccak256(
                                abi.encodePacked(
                                    type(DvPSwap).creationCode,
                                    abi.encode(trustedForwarder())
                                )
                            )
                        )
                    )
                )
            )
        );
    }

    /// @notice Checks if an address was deployed by this factory
    /// @dev Returns true if the address was created by this factory, false otherwise
    /// @param dvpSwapContract The address to check
    /// @return True if the address was created by this factory, false otherwise
    function isAddressDeployed(address dvpSwapContract) public view returns (bool) {
        return isDvPSwapFromFactory[dvpSwapContract];
    }
} 