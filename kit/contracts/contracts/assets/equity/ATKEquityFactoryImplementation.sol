// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import {
    AbstractATKTokenFactoryImplementation
} from "../../system/tokens/factory/AbstractATKTokenFactoryImplementation.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Interface imports
import { IATKEquity } from "./IATKEquity.sol";
import { ISMARTTokenAccessManager } from "../../smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IATKEquityFactory } from "./IATKEquityFactory.sol";
// Local imports
import { ATKEquityProxy } from "./ATKEquityProxy.sol";

/// @title Implementation of the ATK Equity Factory
/// @author SettleMint
/// @notice This contract is responsible for creating instances of ATK Equity tokens.
contract ATKEquityFactoryImplementation is IATKEquityFactory, AbstractATKTokenFactoryImplementation {
    /// @notice Unique identifier for the ATK Equity Factory type
    bytes32 public constant TYPE_ID = keccak256("ATKEquityFactory");

    /// @notice Returns the type identifier for this factory
    /// @return The bytes32 identifier for the ATK Equity Factory
    function typeId() external pure override returns (bytes32) {
        return TYPE_ID;
    }

    /// @notice Constructor for the ATKEquityFactoryImplementation.
    /// @param forwarder The address of the trusted forwarder for meta-transactions.
    constructor(address forwarder) AbstractATKTokenFactoryImplementation(forwarder) { }

    /// @notice Creates a new ATK Equity token.
    /// @param name_ The name of the equity token.
    /// @param symbol_ The symbol of the equity token.
    /// @param decimals_ The number of decimals for the equity token.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @param countryCode_ The ISO 3166-1 numeric country code for jurisdiction
    /// @return deployedEquityAddress The address of the newly deployed equity token contract.
    function createEquity(
        string calldata name_,
        string calldata symbol_,
        uint8 decimals_,
        SMARTComplianceModuleParamPair[] calldata initialModulePairs_,
        uint16 countryCode_
    )
        external
        override(IATKEquityFactory)
        returns (address deployedEquityAddress)
    {
        bytes memory salt = _buildSaltInput(name_, symbol_, decimals_);
        // Create the access manager for the token
        ISMARTTokenAccessManager accessManager = _createAccessManager(salt);

        // ABI encode constructor arguments for SMARTEquityProxy (no onchainID parameter)
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

        // Get the creation bytecode of ATKEquityProxy
        bytes memory proxyBytecode = type(ATKEquityProxy).creationCode;

        // Deploy using the helper from the abstract contract
        string memory description = string.concat("Equity: ", name_, " (", symbol_, ")");
        address deployedTokenIdentityAddress;
        (deployedEquityAddress, deployedTokenIdentityAddress) =
            _deployToken(proxyBytecode, constructorArgs, salt, address(accessManager), description, countryCode_);

        // Identity verification check removed - identity is now set after deployment

        // Identity registration is now handled automatically in _deployContractIdentity

        emit EquityCreated(
            _msgSender(), deployedEquityAddress, deployedTokenIdentityAddress, name_, symbol_, decimals_, countryCode_
        );

        return deployedEquityAddress;
    }

    /// @notice Checks if a given address implements the ISMARTEquity interface.
    /// @param tokenImplementation_ The address of the contract to check.
    /// @return bool True if the contract supports the ISMARTEquity interface, false otherwise.
    function isValidTokenImplementation(address tokenImplementation_) public view override returns (bool) {
        return IERC165(tokenImplementation_).supportsInterface(type(IATKEquity).interfaceId);
    }

    /// @notice Predicts the deployment address of a ATKEquityProxy contract.
    /// @param name_ The name of the equity.
    /// @param symbol_ The symbol of the equity.
    /// @param decimals_ The decimals of the equity.
    /// @param initialModulePairs_ The initial compliance module pairs for the equity.
    /// @return predictedAddress The predicted address of the equity contract.
    function predictEquityAddress(
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

        bytes memory constructorArgs = abi.encode(
            address(this),
            name_,
            symbol_,
            decimals_,
            initialModulePairs_,
            _identityRegistry(),
            _compliance(),
            accessManagerAddress_
        );

        bytes memory proxyBytecode = type(ATKEquityProxy).creationCode;
        predictedAddress = _predictProxyAddress(proxyBytecode, constructorArgs, salt);
        return predictedAddress;
    }

    // --- ERC165 Overrides ---

    /// @notice Checks if this contract implements a specific interface
    /// @param interfaceId The interface identifier to check
    /// @return True if the contract implements the interface, false otherwise
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AbstractATKTokenFactoryImplementation, IERC165)
        returns (bool)
    {
        return interfaceId == type(IATKEquityFactory).interfaceId || super.supportsInterface(interfaceId);
    }
}
