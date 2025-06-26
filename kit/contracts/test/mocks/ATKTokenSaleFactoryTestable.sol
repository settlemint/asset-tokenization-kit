// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";

import { ATKTokenSaleProxy } from "../../contracts/assets/token-sale/ATKTokenSaleProxy.sol";

/// @title ATKTokenSaleFactoryTestable
/// @notice Testable version of ATKTokenSaleFactory for unit tests
/// @dev This contract provides a simplified factory for testing purposes
contract ATKTokenSaleFactoryTestable is Initializable, AccessControlUpgradeable {
    // --- Constants ---
    bytes32 public constant DEPLOYER_ROLE = keccak256("DEPLOYER_ROLE");

    // --- Events ---
    event TokenSaleDeployed(address indexed tokenSaleAddress, address indexed tokenAddress, address indexed saleAdmin);
    event ImplementationUpdated(address indexed oldImplementation, address indexed newImplementation);

    // --- State Variables ---
    address public implementation;
    mapping(address => bool) public isTokenSale;

    /// @notice Initializes the factory contract
    /// @param implementation_ The address of the token sale implementation contract
    function initialize(address implementation_) external initializer {
        __AccessControl_init();

        if (implementation_ == address(0)) revert("Invalid implementation");

        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(DEPLOYER_ROLE, _msgSender());

        implementation = implementation_;
    }

    /// @notice Updates the implementation address
    /// @param newImplementation The address of the new implementation
    function updateImplementation(address newImplementation) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newImplementation == address(0)) revert("Invalid implementation");

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
        if (tokenAddress == address(0)) revert("Invalid token address");
        if (saleAdmin == address(0)) revert("Invalid admin address");
        if (saleStart < block.timestamp) revert("Sale start must be in the future");
        if (saleDuration == 0) revert("Sale duration must be positive");
        if (hardCap == 0) revert("Hard cap must be positive");
        if (basePrice == 0) revert("Base price must be positive");

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

        // Update tracking
        isTokenSale[saleAddress] = true;

        // Set the sale admin role
        bytes4 grantRoleSig = bytes4(keccak256("grantRole(bytes32,address)"));

        // Grant DEFAULT_ADMIN_ROLE
        bytes32 defaultAdminRole = 0x0000000000000000000000000000000000000000000000000000000000000000;
        (bool success0,) = saleAddress.call(abi.encodeWithSelector(grantRoleSig, defaultAdminRole, saleAdmin));
        require(success0, "Failed to grant DEFAULT_ADMIN_ROLE");

        // Grant SALE_ADMIN_ROLE
        bytes32 saleAdminRole = keccak256("SALE_ADMIN_ROLE");
        (bool success1,) = saleAddress.call(abi.encodeWithSelector(grantRoleSig, saleAdminRole, saleAdmin));
        require(success1, "Failed to grant SALE_ADMIN_ROLE");

        // Grant FUNDS_MANAGER_ROLE
        bytes32 fundsManagerRole = keccak256("FUNDS_MANAGER_ROLE");
        (bool success2,) = saleAddress.call(abi.encodeWithSelector(grantRoleSig, fundsManagerRole, saleAdmin));
        require(success2, "Failed to grant FUNDS_MANAGER_ROLE");

        emit TokenSaleDeployed(saleAddress, tokenAddress, saleAdmin);

        return saleAddress;
    }
}
