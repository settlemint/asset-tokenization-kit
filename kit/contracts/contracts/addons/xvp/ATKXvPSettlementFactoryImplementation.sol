// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { XvPSettlement } from "./ATKXvPSettlement.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IATKXvPSettlementFactory } from "./IATKXvPSettlementFactory.sol";
import { IWithTypeIdentifier } from "../../system/IWithTypeIdentifier.sol";
import { AbstractATKSystemAddonFactoryImplementation } from
    "../../system/AbstractATKSystemAddonFactoryImplementation.sol";

/// @title XvPSettlementFactory - A factory contract for creating XvPSettlement contracts
/// @notice This contract allows the creation of new XvPSettlement contracts with deterministic addresses using CREATE2.
/// @dev Inherits from ERC2771ContextUpgradeable for meta-transaction support and AccessControlUpgradeable for role
/// management.
/// Uses CREATE2 for deterministic deployment addresses and maintains a registry of deployed settlement contracts.
/// @custom:security-contact support@settlemint.com
contract ATKXvPSettlementFactoryImplementation is
    AbstractATKSystemAddonFactoryImplementation,
    IATKXvPSettlementFactory
{
    bytes32 public constant override(IATKXvPSettlementFactory, IWithTypeIdentifier) typeId =
        keccak256("ATKXvPSettlementFactory");

    /// @notice Custom errors for the XvPSettlementFactory contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error ZeroAddressNotAllowed();
    error InvalidCutoffDate();
    error EmptyFlows();

    /// @notice The address of the trusted forwarder for meta-transactions
    address private _trustedForwarder;

    /// @notice Emitted when a new XvPSettlement contract is created
    /// @param settlement The address of the newly created settlement contract
    /// @param creator The address that created the settlement contract
    event XvPSettlementCreated(address indexed settlement, address indexed creator);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address forwarder) AbstractATKSystemAddonFactoryImplementation(forwarder) {
        _trustedForwarder = forwarder;
        _disableInitializers();
    }

    /// @notice Initializes the factory with system address and admin
    /// @dev Can only be called once, sets up initial roles and system integration
    /// @param systemAddress The address of the ATK system contract
    /// @param initialAdmin The address that will be granted admin role
    function initialize(address systemAddress, address initialAdmin) public initializer {
        if (systemAddress == address(0)) revert ZeroAddressNotAllowed();
        if (initialAdmin == address(0)) revert ZeroAddressNotAllowed();

        __ERC165_init();
        _initializeAbstractSystemAddonFactory(systemAddress, initialAdmin);
    }

    /// @notice Creates a new XvPSettlement contract
    /// @dev Uses CREATE2 for deterministic addresses, includes reentrancy protection,
    /// and validates that the predicted address hasn't been used before.
    /// @param flows The array of token flows to include in the settlement
    /// @param cutoffDate Timestamp after which the settlement expires
    /// @param autoExecute If true, settlement executes automatically when all approvals are received
    /// @return contractAddress The address of the newly created settlement contract
    function create(
        XvPSettlement.Flow[] memory flows,
        uint256 cutoffDate,
        bool autoExecute
    )
        external
        returns (address contractAddress)
    {
        if (cutoffDate <= block.timestamp) revert InvalidCutoffDate();
        if (flows.length == 0) revert EmptyFlows();

        bytes memory saltInputData = abi.encode(flows, cutoffDate, autoExecute);
        bytes memory proxyCreationCode = type(XvPSettlement).creationCode;
        bytes memory encodedConstructorArgs = abi.encode(_trustedForwarder, cutoffDate, autoExecute, flows);

        // Predict the address first for validation
        address expectedAddress = _predictProxyAddress(proxyCreationCode, encodedConstructorArgs, saltInputData);

        // Deploy using the abstract factory method
        contractAddress = _deploySystemAddon(proxyCreationCode, encodedConstructorArgs, saltInputData, expectedAddress);

        emit XvPSettlementCreated(contractAddress, _msgSender());
    }

    /// @notice Predicts the address where a XvPSettlement contract would be deployed
    /// @dev Calculates the deterministic address using CREATE2 with the same parameters and salt
    /// computation as the create function. This allows users to know the contract's address before deployment.
    /// @param flows The array of token flows that will be used in deployment
    /// @param cutoffDate Timestamp after which the settlement expires
    /// @param autoExecute If true, settlement executes automatically when all approvals are received
    /// @return predicted The address where the settlement contract would be deployed
    function predictAddress(
        XvPSettlement.Flow[] memory flows,
        uint256 cutoffDate,
        bool autoExecute
    )
        public
        view
        returns (address predicted)
    {
        bytes memory saltInputData = abi.encode(flows, cutoffDate, autoExecute);
        bytes memory proxyCreationCode = type(XvPSettlement).creationCode;
        bytes memory encodedConstructorArgs = abi.encode(_trustedForwarder, cutoffDate, autoExecute, flows);

        predicted = _predictProxyAddress(proxyCreationCode, encodedConstructorArgs, saltInputData);
        return predicted;
    }

    /// @notice Checks if an address was deployed by this factory
    /// @dev Returns true if the address was created by this factory, false otherwise
    /// @param settlement The address to check
    /// @return True if the address was created by this factory, false otherwise
    function isAddressDeployed(address settlement) public view returns (bool) {
        return isFactorySystemAddon[settlement];
    }
}
