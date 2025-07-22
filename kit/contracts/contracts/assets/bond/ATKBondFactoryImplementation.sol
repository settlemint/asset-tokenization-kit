// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { AbstractATKTokenFactoryImplementation } from
    "../../system/token-factory/AbstractATKTokenFactoryImplementation.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Interface imports
import { IATKBond } from "./IATKBond.sol";
import { IATKBondFactory } from "./IATKBondFactory.sol";
import { ISMARTTokenAccessManager } from "../../smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { IATKCompliance } from "../../system/compliance/IATKCompliance.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";

// Local imports
import { ATKBondProxy } from "./ATKBondProxy.sol";

/// @title Implementation of the ATK Bond Factory
/// @notice This contract is responsible for creating instances of ATK Bonds.
contract ATKBondFactoryImplementation is IATKBondFactory, AbstractATKTokenFactoryImplementation {
    bytes32 public constant override typeId = keccak256("ATKBondFactory");

    /// @notice Constructor for the ATKBondFactoryImplementation.
    /// @param forwarder The address of the trusted forwarder for meta-transactions.
    constructor(address forwarder) AbstractATKTokenFactoryImplementation(forwarder) { }

    /// @notice Creates a new ATK Bond.
    /// @param name_ The name of the bond.
    /// @param symbol_ The symbol of the bond.
    /// @param decimals_ The number of decimals for the bond tokens.
    /// @param cap_ The maximum total supply of the bond tokens.
    /// @param maturityDate_ The Unix timestamp representing the bond's maturity date.
    /// @param faceValue_ The face value of each bond token in the underlying asset's base units.
    /// @param underlyingAsset_ The address of the ERC20 token used as the underlying asset for the bond.
    /// @param requiredClaimTopics_ An array of claim topics required for interacting with the bond.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @param countryCode_ The ISO 3166-1 numeric country code for jurisdiction
    /// @return deployedBondAddress The address of the newly deployed bond contract.
    function createBond(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 cap_,
        uint256 maturityDate_,
        uint256 faceValue_,
        address underlyingAsset_,
        uint256[] memory requiredClaimTopics_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        uint16 countryCode_
    )
        external
        override
        returns (address deployedBondAddress)
    {
        bytes memory salt = _buildSaltInput(name_, symbol_, decimals_);
        // Create the access manager for the token
        ISMARTTokenAccessManager accessManager = _createAccessManager(salt);

        // ABI encode constructor arguments for SMARTBondProxy (no onchainID parameter)
        bytes memory constructorArgs = abi.encode(
            address(this),
            name_,
            symbol_,
            decimals_,
            cap_,
            maturityDate_,
            faceValue_,
            underlyingAsset_,
            _addIdentityVerificationModulePair(initialModulePairs_, requiredClaimTopics_),
            _identityRegistry(),
            _compliance(),
            address(accessManager)
        );

        // Get the creation bytecode of ATKBondProxy
        bytes memory proxyBytecode = type(ATKBondProxy).creationCode;

        // Deploy using the helper from the abstract contract
        string memory description = string.concat("Bond: ", name_, " (", symbol_, ")");
        address deployedTokenIdentityAddress;
        (deployedBondAddress, deployedTokenIdentityAddress) =
            _deployToken(proxyBytecode, constructorArgs, salt, address(accessManager), description, countryCode_);

        // Identity verification check removed - identity is now set after deployment

        // Add the bond to the compliance allow list, because it needs to be able to hold other tokens
        IATKCompliance(address(_compliance())).addToBypassList(deployedBondAddress);

        emit BondCreated(
            _msgSender(),
            deployedBondAddress,
            deployedTokenIdentityAddress,
            name_,
            symbol_,
            decimals_,
            requiredClaimTopics_,
            cap_,
            maturityDate_,
            faceValue_,
            underlyingAsset_,
            countryCode_
        );

        return deployedBondAddress;
    }

    /// @notice Checks if a given address implements the IATKBond interface.
    /// @param tokenImplementation_ The address of the contract to check.
    /// @return bool True if the contract supports the IATKBond interface, false otherwise.
    function isValidTokenImplementation(address tokenImplementation_) public view override returns (bool) {
        return IERC165(tokenImplementation_).supportsInterface(type(IATKBond).interfaceId);
    }

    /// @notice Predicts the deployment address of a ATKBondProxy contract.
    /// @param name_ The name of the bond.
    /// @param symbol_ The symbol of the bond.
    /// @param decimals_ The decimals of the bond.
    /// @param cap_ The cap of the bond.
    /// @param maturityDate_ The maturity date of the bond.
    /// @param faceValue_ The face value of the bond.
    /// @param underlyingAsset_ The underlying asset of the bond.
    /// @param requiredClaimTopics_ The required claim topics for the bond.
    /// @param initialModulePairs_ The initial compliance module pairs for the bond.
    /// @return predictedAddress The predicted address of the bond contract.
    function predictBondAddress(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 cap_,
        uint256 maturityDate_,
        uint256 faceValue_,
        address underlyingAsset_,
        uint256[] memory requiredClaimTopics_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
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
            cap_,
            maturityDate_,
            faceValue_,
            underlyingAsset_,
            _addIdentityVerificationModulePair(initialModulePairs_, requiredClaimTopics_),
            _identityRegistry(),
            _compliance(),
            accessManagerAddress_
        );

        bytes memory proxyBytecode = type(ATKBondProxy).creationCode;
        predictedAddress = _predictProxyAddress(proxyBytecode, constructorArgs, salt);
        return predictedAddress;
    }

    // --- ERC165 Overrides ---

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AbstractATKTokenFactoryImplementation, IERC165)
        returns (bool)
    {
        return interfaceId == type(IATKBondFactory).interfaceId || super.supportsInterface(interfaceId);
    }
}
