// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { AbstractSMARTTokenFactoryImplementation } from
    "../../system/token-factory/AbstractSMARTTokenFactoryImplementation.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Interface imports
import { ISMARTBond } from "./ISMARTBond.sol";
import { ISMARTBondFactory } from "./ISMARTBondFactory.sol";
import { ISMARTTokenAccessManager } from "../../extensions/access-managed/ISMARTTokenAccessManager.sol";
import { SMARTComplianceModuleParamPair } from "../../interface/structs/SMARTComplianceModuleParamPair.sol";

// Local imports
import { SMARTBondProxy } from "./SMARTBondProxy.sol";

/// @title Implementation of the SMART Bond Factory
/// @notice This contract is responsible for creating instances of SMART Bonds.
contract SMARTBondFactoryImplementation is ISMARTBondFactory, AbstractSMARTTokenFactoryImplementation {
    /// @notice Constructor for the SMARTBondFactoryImplementation.
    /// @param forwarder The address of the trusted forwarder for meta-transactions.
    constructor(address forwarder) AbstractSMARTTokenFactoryImplementation(forwarder) { }

    /// @notice Creates a new SMART Bond.
    /// @param name_ The name of the bond.
    /// @param symbol_ The symbol of the bond.
    /// @param decimals_ The number of decimals for the bond tokens.
    /// @param cap_ The maximum total supply of the bond tokens.
    /// @param maturityDate_ The Unix timestamp representing the bond's maturity date.
    /// @param faceValue_ The face value of each bond token in the underlying asset's base units.
    /// @param underlyingAsset_ The address of the ERC20 token used as the underlying asset for the bond.
    /// @param requiredClaimTopics_ An array of claim topics required for interacting with the bond.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
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
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        external
        override
        returns (address deployedBondAddress)
    {
        bytes memory salt = _buildSaltInput(name_, symbol_, decimals_);
        // Create the access manager for the token
        ISMARTTokenAccessManager accessManager = _createAccessManager(salt);

        address tokenIdentityAddress = _predictTokenIdentityAddress(name_, symbol_, decimals_, address(accessManager));

        // ABI encode constructor arguments for SMARTBondProxy
        bytes memory constructorArgs = abi.encode(
            address(this),
            name_,
            symbol_,
            decimals_,
            tokenIdentityAddress,
            cap_,
            maturityDate_,
            faceValue_,
            underlyingAsset_,
            requiredClaimTopics_,
            initialModulePairs_,
            _identityRegistry(),
            _compliance(),
            address(accessManager)
        );

        // Get the creation bytecode of SMARTBondProxy
        bytes memory proxyBytecode = type(SMARTBondProxy).creationCode;

        // Deploy using the helper from the abstract contract
        address deployedTokenIdentityAddress;
        (deployedBondAddress, deployedTokenIdentityAddress) =
            _deployToken(proxyBytecode, constructorArgs, salt, address(accessManager));

        if (deployedTokenIdentityAddress != tokenIdentityAddress) {
            revert TokenIdentityAddressMismatch(deployedTokenIdentityAddress, tokenIdentityAddress);
        }

        return deployedBondAddress;
    }

    /// @notice Checks if a given address implements the ISMARTBond interface.
    /// @param tokenImplementation_ The address of the contract to check.
    /// @return bool True if the contract supports the ISMARTBond interface, false otherwise.
    function isValidTokenImplementation(address tokenImplementation_) public view override returns (bool) {
        return IERC165(tokenImplementation_).supportsInterface(type(ISMARTBond).interfaceId);
    }

    /// @notice Predicts the deployment address of a SMARTBondProxy contract.
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
        address tokenIdentityAddress = _predictTokenIdentityAddress(name_, symbol_, decimals_, accessManagerAddress_);
        bytes memory constructorArgs = abi.encode(
            address(this),
            name_,
            symbol_,
            decimals_,
            tokenIdentityAddress,
            cap_,
            maturityDate_,
            faceValue_,
            underlyingAsset_,
            requiredClaimTopics_,
            initialModulePairs_,
            _identityRegistry(),
            _compliance(),
            accessManagerAddress_
        );

        bytes memory proxyBytecode = type(SMARTBondProxy).creationCode;
        predictedAddress = _predictProxyAddress(proxyBytecode, constructorArgs, salt);
        return predictedAddress;
    }
}
