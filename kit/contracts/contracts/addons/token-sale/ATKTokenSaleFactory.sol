// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";

import { ATKTokenSaleProxy } from "./ATKTokenSaleProxy.sol";

/// @title ATKTokenSaleFactory
/// @author SettleMint
/// @notice Factory contract for deploying new token sale contracts in the ATK ecosystem
/// @dev This contract simplifies the process of creating compliant token sales
contract ATKTokenSaleFactory is Initializable, AccessControlUpgradeable, ERC2771ContextUpgradeable {
    // --- Custom Errors ---
    error InvalidImplementation();
    error InvalidTokenAddress();
    error InvalidAdminAddress();
    error SaleStartMustBeInFuture();
    error SaleDurationMustBePositive();
    error HardCapMustBePositive();
    error BasePriceMustBePositive();
    error FailedToGrantDefaultAdminRole();
    error FailedToGrantSaleAdminRole();
    error FailedToGrantFundsManagerRole();
    // --- Constants ---

    /// @notice Role for deploying new token sales
    bytes32 public constant DEPLOYER_ROLE = keccak256("DEPLOYER_ROLE");

    // --- Events ---

    /// @notice Emitted when a new token sale is deployed
    /// @param tokenSaleAddress The address of the newly deployed token sale
    /// @param tokenAddress The address of the token being sold
    /// @param saleAdmin The address of the token sale admin
    event TokenSaleDeployed(address indexed tokenSaleAddress, address indexed tokenAddress, address indexed saleAdmin);

    /// @notice Emitted when the implementation address is updated
    /// @param oldImplementation The previous implementation address
    /// @param newImplementation The new implementation address
    event ImplementationUpdated(address indexed oldImplementation, address indexed newImplementation);

    // --- State Variables ---

    /// @notice The address of the token sale implementation contract
    address public implementation;

    /// @notice Mapping to track if an address is a token sale deployed by this factory
    mapping(address => bool) public isTokenSale;

    /// @notice The address of the trusted forwarder for ERC2771
    address private immutable _forwarder;

    /// @notice Constructor that disables initializers to prevent implementation contract initialization
    /// @dev Sets the trusted forwarder for meta-transactions
    /// @custom:oz-upgrades-unsafe-allow constructor
    /// @param forwarder The address of the forwarder contract for ERC2771
    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) {
        _disableInitializers();
        _forwarder = forwarder;
    }

    /// @notice Initializes the factory contract
    /// @param implementation_ The address of the token sale implementation contract
    function initialize(address implementation_) external initializer {
        __AccessControl_init();

        if (implementation_ == address(0)) revert InvalidImplementation();

        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(DEPLOYER_ROLE, _msgSender());

        implementation = implementation_;
    }

    /// @notice Updates the implementation address
    /// @param newImplementation The address of the new implementation
    function updateImplementation(address newImplementation) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newImplementation == address(0)) revert InvalidImplementation();

        address oldImplementation = implementation;
        implementation = newImplementation;

        emit ImplementationUpdated(oldImplementation, newImplementation);
    }

    /// @notice Deploys a new token sale contract
    /// @param tokenAddress The address of the token to be sold
    /// @param saleAdmin The address that will be granted admin roles for the sale
    /// @param saleStart Timestamp when the sale starts
    /// @param saleDuration Duration of the sale in seconds
    /// @param hardCap Maximum amount of tokens to be sold
    /// @param basePrice Base price of tokens in smallest units
    /// @param saltNonce A nonce to use in the salt for CREATE2 deployment
    /// @return saleAddress The address of the deployed token sale
    function deployTokenSale(
        address tokenAddress,
        address saleAdmin,
        uint256 saleStart,
        uint256 saleDuration,
        uint256 hardCap,
        uint256 basePrice,
        uint256 saltNonce
    )
        external
        onlyRole(DEPLOYER_ROLE)
        returns (address saleAddress)
    {
        // Validate input parameters
        if (tokenAddress == address(0)) revert InvalidTokenAddress();
        if (saleAdmin == address(0)) revert InvalidAdminAddress();
        if (saleStart < block.timestamp) revert SaleStartMustBeInFuture();
        if (saleDuration == 0) revert SaleDurationMustBePositive();
        if (hardCap == 0) revert HardCapMustBePositive();
        if (basePrice == 0) revert BasePriceMustBePositive();

        // Create initialization data for the proxy
        bytes memory initData = abi.encodeWithSignature(
            "initialize(address,uint256,uint256,uint256,uint256)",
            tokenAddress,
            saleStart,
            saleDuration,
            hardCap,
            basePrice
        );

        // Calculate salt for CREATE2 deployment
        bytes32 salt = keccak256(abi.encodePacked(tokenAddress, saleAdmin, saleStart, saltNonce));

        // Deploy proxy with CREATE2
        bytes memory proxyBytecode = type(ATKTokenSaleProxy).creationCode;
        bytes memory constructorArgs = abi.encode(
            implementation,
            address(this), // Admin of the proxy is the factory
            initData
        );
        bytes memory bytecode = abi.encodePacked(proxyBytecode, constructorArgs);

        saleAddress = Create2.deploy(0, salt, bytecode);

        // Set the sale admin roles before marking as managed
        // If any of these fail, the transaction reverts and the proxy isn't tracked
        bytes4 grantRoleSig = bytes4(keccak256("grantRole(bytes32,address)"));

        // Grant DEFAULT_ADMIN_ROLE
        bytes32 defaultAdminRole = 0x0000000000000000000000000000000000000000000000000000000000000000;
        (bool success0,) = saleAddress.call(abi.encodeWithSelector(grantRoleSig, defaultAdminRole, saleAdmin));
        if (!success0) revert FailedToGrantDefaultAdminRole();

        // Grant SALE_ADMIN_ROLE
        bytes32 saleAdminRole = keccak256("SALE_ADMIN_ROLE");
        (bool success1,) = saleAddress.call(abi.encodeWithSelector(grantRoleSig, saleAdminRole, saleAdmin));
        if (!success1) revert FailedToGrantSaleAdminRole();

        // Grant FUNDS_MANAGER_ROLE
        bytes32 fundsManagerRole = keccak256("FUNDS_MANAGER_ROLE");
        (bool success2,) = saleAddress.call(abi.encodeWithSelector(grantRoleSig, fundsManagerRole, saleAdmin));
        if (!success2) revert FailedToGrantFundsManagerRole();

        // Only after all role grants succeed, mark as managed
        isTokenSale[saleAddress] = true;

        emit TokenSaleDeployed(saleAddress, tokenAddress, saleAdmin);

        return saleAddress;
    }

    /// @notice Returns the address of the trusted forwarder
    /// @return The address of the trusted forwarder
    function _trustedForwarder() internal view virtual returns (address) {
        return _forwarder;
    }

    /// @notice Returns the context suffix length for ERC2771 compatibility
    /// @dev Required override for ERC2771ContextUpgradeable
    /// @return The length of the context suffix for meta-transactions
    function _contextSuffixLength()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return ERC2771ContextUpgradeable._contextSuffixLength();
    }

    /// @notice Returns the sender of the transaction, supporting ERC2771 meta-transactions
    /// @dev Required override for ERC2771ContextUpgradeable
    /// @return The address of the transaction sender
    function _msgSender() internal view override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (address) {
        return ERC2771ContextUpgradeable._msgSender();
    }

    /// @notice Returns the calldata of the transaction, supporting ERC2771 meta-transactions
    /// @dev Required override for ERC2771ContextUpgradeable
    /// @return The calldata of the transaction
    function _msgData() internal view override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (bytes calldata) {
        return ERC2771ContextUpgradeable._msgData();
    }
}
