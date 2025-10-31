// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { AbstractATKTokenFactoryImplementation } from
    "../../system/tokens/factory/AbstractATKTokenFactoryImplementation.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Interface imports
import { IATKDeposit } from "./IATKDeposit.sol";
import { ISMARTTokenAccessManager } from "../../smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IATKDepositFactory } from "./IATKDepositFactory.sol";
import { IATKTokenFactory } from "../../system/tokens/factory/IATKTokenFactory.sol";

// Local imports
import { ATKDepositProxy } from "./ATKDepositProxy.sol";

/// @title Implementation of the ATK Deposit Factory
/// @author SettleMint
/// @notice This contract is responsible for creating instances of ATK Deposit tokens.
/// @dev This factory deploys ATK Deposit tokens using the SMART protocol
///      for compliance and identity verification. It inherits from AbstractATKTokenFactoryImplementation
///      for common factory functionality.
contract ATKDepositFactoryImplementation is IATKDepositFactory, AbstractATKTokenFactoryImplementation {
    /// @notice The unique identifier for this factory type.
    bytes32 public constant TYPE_ID = keccak256("ATKDepositFactory");

    /// @notice Returns the unique type identifier for this factory.
    /// @return The keccak256 hash of "ATKDepositFactory".
    function typeId() external pure override returns (bytes32) {
        return TYPE_ID;
    }

    /// @notice Constructor for the ATKDepositFactoryImplementation.
    /// @param forwarder The address of the trusted forwarder for meta-transactions.
    constructor(address forwarder) AbstractATKTokenFactoryImplementation(forwarder) { }

    /// @inheritdoc IATKTokenFactory
    /// @param systemAddress The address of the `IATKSystem` contract.
    /// @param tokenImplementation_ The initial address of the token implementation contract.
    /// @param initialAdmin The address to be granted the DEFAULT_ADMIN_ROLE and DEPLOYER_ROLE.
    function initialize(
        address systemAddress,
        address tokenImplementation_,
        address initialAdmin
    )
        public
        override(AbstractATKTokenFactoryImplementation, IATKTokenFactory)
        initializer
    {
        super.initialize(systemAddress, tokenImplementation_, initialAdmin);
    }

    /// @notice Creates a new ATK Deposit token.
    /// @param name_ The name of the deposit token.
    /// @param symbol_ The symbol of the deposit token.
    /// @param decimals_ The number of decimals for the deposit token.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @param countryCode_ The numeric country code (ISO 3166-1 alpha-2 standard) representing the token's
    /// jurisdiction.
    /// @return deployedDepositAddress The address of the newly deployed deposit token contract.
    function createDeposit(
        string calldata name_,
        string calldata symbol_,
        uint8 decimals_,
        SMARTComplianceModuleParamPair[] calldata initialModulePairs_,
        uint16 countryCode_
    )
        external
        override
        returns (address deployedDepositAddress)
    {
        bytes memory salt = _buildSaltInput(name_, symbol_, decimals_);

        // Create the access manager for the token
        ISMARTTokenAccessManager accessManager = _createAccessManager(salt);

        // ABI encode constructor arguments for ATKDepositProxy (no onchainID parameter)
        bytes memory constructorArgs = abi.encode(
            address(this),
            name_,
            symbol_,
            decimals_,
            initialModulePairs_,
            _identityRegistry(),
            _compliance(),
            address(accessManager)
        );

        // Get the creation bytecode of ATKDepositProxy
        bytes memory proxyBytecode = type(ATKDepositProxy).creationCode;

        // Deploy using the helper from the abstract contract
        string memory description = string.concat("Deposit: ", name_, " (", symbol_, ")");
        address deployedTokenIdentityAddress;
        (deployedDepositAddress, deployedTokenIdentityAddress) =
            _deployToken(proxyBytecode, constructorArgs, salt, address(accessManager), description, countryCode_);

        // Identity verification check removed - identity is now set after deployment

        emit DepositCreated(
            _msgSender(), deployedDepositAddress, deployedTokenIdentityAddress, name_, symbol_, decimals_, countryCode_
        );

        return deployedDepositAddress;
    }

    /// @notice Checks if a given address implements the IATKDeposit interface.
    /// @dev Uses ERC165 to check interface support for IATKDeposit
    /// @param tokenImplementation_ The address of the contract to check.
    /// @return bool True if the contract supports the IATKDeposit interface, false otherwise.
    function isValidTokenImplementation(address tokenImplementation_) public view override returns (bool) {
        return IERC165(tokenImplementation_).supportsInterface(type(IATKDeposit).interfaceId);
    }

    /// @notice Predicts the deployment address of a ATKDepositProxy contract.
    /// @dev Uses CREATE2 to deterministically calculate the deployment address based on the provided parameters
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param decimals_ The decimals of the token.
    /// @param initialModulePairs_ The initial compliance module pairs for the token.
    /// @return predictedAddress The predicted address of the token contract.
    function predictDepositAddress(
        string calldata name_,
        string calldata symbol_,
        uint8 decimals_,
        SMARTComplianceModuleParamPair[] calldata initialModulePairs_
    )
        external
        view
        override
        returns (address predictedAddress)
    {
        bytes memory salt = _buildSaltInput(name_, symbol_, decimals_);
        address accessManagerAddress_ = _predictAccessManagerAddress(salt);

        // ABI encode constructor arguments for ATKDepositProxy (no onchainID parameter)
        bytes memory constructorArgs = abi.encode(
            address(this), // The factory address is part of the constructor args
            name_,
            symbol_,
            decimals_,
            initialModulePairs_,
            _identityRegistry(),
            _compliance(),
            accessManagerAddress_ // Use the provided access manager address
        );

        // Get the creation bytecode of ATKDepositProxy
        bytes memory proxyBytecode = type(ATKDepositProxy).creationCode;

        // Predict the address using the helper from the abstract contract
        predictedAddress = _predictProxyAddress(proxyBytecode, constructorArgs, salt);

        return predictedAddress;
    }

    // --- ERC165 Overrides ---

    /// @notice Checks if the contract supports the given interface
    /// @dev Implements ERC165 interface detection
    /// @param interfaceId The interface identifier to check
    /// @return True if the interface is supported, false otherwise
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AbstractATKTokenFactoryImplementation, IERC165)
        returns (bool)
    {
        return interfaceId == type(IATKDepositFactory).interfaceId || super.supportsInterface(interfaceId);
    }
}
