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
import { IWithTypeIdentifier } from "../IWithTypeIdentifier.sol";

/// @title XvPSettlementFactory - A factory contract for creating XvPSettlement contracts
/// @notice This contract allows the creation of new XvPSettlement contracts with deterministic addresses using CREATE2.
/// @dev Inherits from ERC2771ContextUpgradeable for meta-transaction support and AccessControlUpgradeable for role
/// management.
/// Uses CREATE2 for deterministic deployment addresses and maintains a registry of deployed settlement contracts.
/// @custom:security-contact support@settlemint.com
contract ATKXvPSettlementFactoryImplementation is
    Initializable,
    IATKXvPSettlementFactory,
    IWithTypeIdentifier,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    AccessControlUpgradeable
{
    bytes32 public constant override(IATKXvPSettlementFactory, IWithTypeIdentifier) typeId =
        keccak256("ATKXvPSettlementFactory");

    /// @notice Custom errors for the XvPSettlementFactory contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error AddressAlreadyDeployed();
    error ZeroAddressNotAllowed();
    error InvalidCutoffDate();
    error EmptyFlows();
    error AlreadyInitialized();

    /// @notice Mapping to track if an address was deployed by this factory
    /// @dev Maps settlement contract addresses to a boolean indicating if they were created by this factory
    mapping(address => bool) public isFactoryContract;

    /// @notice Flag to track if the contract has been initialized
    bool private _initialized;

    /// @notice The address of the trusted forwarder for meta-transactions
    address private _trustedForwarder;

    /// @notice Emitted when a new XvPSettlement contract is created
    /// @param settlement The address of the newly created settlement contract
    /// @param creator The address that created the settlement contract
    event XvPSettlementCreated(address indexed settlement, address indexed creator);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) {
        _trustedForwarder = forwarder;
        _disableInitializers();
    }

    /// @notice Initializes the factory with an admin address and trusted forwarder
    /// @dev Can only be called once, sets up initial roles
    /// @param initialAdmin The address that will be granted admin role
    function initialize(address forwarder, address initialAdmin) public initializer {
        if (_initialized) revert AlreadyInitialized();
        if (initialAdmin == address(0)) revert ZeroAddressNotAllowed();
        if (forwarder == address(0)) revert ZeroAddressNotAllowed();

        __ERC165_init();
        __AccessControl_init();

        _trustedForwarder = forwarder;
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _initialized = true;
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

        // Calculate salt from the flows parameter
        bytes32 salt = _calculateSalt(flows, cutoffDate, autoExecute);

        // Check if address is already deployed
        address predicted = predictAddress(flows, cutoffDate, autoExecute);
        if (isAddressDeployed(predicted)) revert AddressAlreadyDeployed();

        // Deploy the XvPSettlement contract with all parameters including flows
        XvPSettlement newXvPSettlement =
            new XvPSettlement{ salt: salt }(_trustedForwarder, cutoffDate, autoExecute, flows);

        contractAddress = address(newXvPSettlement);
        isFactoryContract[contractAddress] = true;

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
        bytes32 salt = _calculateSalt(flows, cutoffDate, autoExecute);

        bytes32 creationCodeHash = keccak256(
            abi.encodePacked(
                type(XvPSettlement).creationCode, abi.encode(_trustedForwarder, cutoffDate, autoExecute, flows)
            )
        );

        predicted =
            address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, creationCodeHash)))));
        return predicted;
    }

    /// @notice Calculates the salt for CREATE2 deployment
    /// @dev Creates a unique salt value. Used by both create and
    /// predictAddress functions to ensure consistent address calculation.
    /// @param flows The array of token flows that will be used in deployment
    /// @param cutoffDate Timestamp after which the settlement expires
    /// @param autoExecute If true, settlement executes automatically when all approvals are received
    /// @return The calculated salt for CREATE2 deployment
    function _calculateSalt(
        XvPSettlement.Flow[] memory flows,
        uint256 cutoffDate,
        bool autoExecute
    )
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(flows, cutoffDate, autoExecute));
    }

    /// @notice Checks if an address was deployed by this factory
    /// @dev Returns true if the address was created by this factory, false otherwise
    /// @param settlement The address to check
    /// @return True if the address was created by this factory, false otherwise
    function isAddressDeployed(address settlement) public view returns (bool) {
        return isFactoryContract[settlement];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlUpgradeable, ERC165Upgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == type(IATKXvPSettlementFactory).interfaceId || super.supportsInterface(interfaceId);
    }

    /// @dev Override for _msgSender() to support meta-transactions
    function _msgSender() internal view override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (address) {
        return super._msgSender();
    }

    /// @dev Override for _msgData() to support meta-transactions
    function _msgData()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData();
    }

    /// @dev Override for _contextSuffixLength() to support meta-transactions
    function _contextSuffixLength()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return super._contextSuffixLength();
    }
}
