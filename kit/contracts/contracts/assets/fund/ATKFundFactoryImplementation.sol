// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { AbstractATKTokenFactoryImplementation } from
    "../../system/token-factory/AbstractATKTokenFactoryImplementation.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Interface imports
import { IATKFund } from "./IATKFund.sol";
import { IATKFundFactory } from "./IATKFundFactory.sol";
import { ISMARTTokenAccessManager } from "../../smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";

// Local imports
import { ATKFundProxy } from "./ATKFundProxy.sol";

/// @title Implementation of the ATK Fund Factory
/// @notice This contract is responsible for creating instances of ATK Funds.
contract ATKFundFactoryImplementation is IATKFundFactory, AbstractATKTokenFactoryImplementation {
    /// @notice Constructor for the ATKFundFactoryImplementation.
    /// @param forwarder The address of the trusted forwarder for meta-transactions.
    constructor(address forwarder) AbstractATKTokenFactoryImplementation(forwarder) { }

    /// @notice Creates a new ATK Fund.
    /// @param name_ The name of the fund.
    /// @param symbol_ The symbol of the fund.
    /// @param decimals_ The number of decimals for the fund tokens.
    /// @param managementFeeBps_ The management fee in basis points.
    /// @param requiredClaimTopics_ An array of claim topics required for interacting with the fund.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @return deployedFundAddress The address of the newly deployed fund contract.
    function createFund(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint16 managementFeeBps_,
        uint256[] memory requiredClaimTopics_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        external
        override
        returns (address deployedFundAddress)
    {
        bytes memory salt = _buildSaltInput(name_, symbol_, decimals_);
        // Create the access manager for the token
        ISMARTTokenAccessManager accessManager = _createAccessManager(salt);

        address tokenIdentityAddress = _predictTokenIdentityAddress(name_, symbol_, decimals_, address(accessManager));

        // ABI encode constructor arguments for SMARTFundProxy
        bytes memory constructorArgs = abi.encode(
            address(this),
            name_,
            symbol_,
            decimals_,
            tokenIdentityAddress,
            managementFeeBps_,
            _addIdentityVerificationModulePair(initialModulePairs_, requiredClaimTopics_),
            _identityRegistry(),
            _compliance(),
            address(accessManager)
        );

        // Get the creation bytecode of ATKFundProxy
        bytes memory proxyBytecode = type(ATKFundProxy).creationCode;

        // Deploy using the helper from the abstract contract
        address deployedTokenIdentityAddress;
        (deployedFundAddress, deployedTokenIdentityAddress) =
            _deployToken(proxyBytecode, constructorArgs, salt, address(accessManager));

        if (deployedTokenIdentityAddress != tokenIdentityAddress) {
            revert TokenIdentityAddressMismatch(deployedTokenIdentityAddress, tokenIdentityAddress);
        }

        return deployedFundAddress;
    }

    /// @notice Checks if a given address implements the ISMARTFund interface.
    /// @param tokenImplementation_ The address of the contract to check.
    /// @return bool True if the contract supports the ISMARTFund interface, false otherwise.
    function isValidTokenImplementation(address tokenImplementation_) public view override returns (bool) {
        return IERC165(tokenImplementation_).supportsInterface(type(IATKFund).interfaceId);
    }

    /// @notice Predicts the deployment address of a ATKFundProxy contract.
    /// @param name_ The name of the fund.
    /// @param symbol_ The symbol of the fund.
    /// @param decimals_ The decimals of the fund.
    /// @param managementFeeBps_ The management fee in basis points for the fund.
    /// @param requiredClaimTopics_ The required claim topics for the fund.
    /// @param initialModulePairs_ The initial compliance module pairs for the fund.
    /// @return predictedAddress The predicted address of the fund contract.
    function predictFundAddress(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint16 managementFeeBps_,
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
            managementFeeBps_,
            _addIdentityVerificationModulePair(initialModulePairs_, requiredClaimTopics_),
            _identityRegistry(),
            _compliance(),
            accessManagerAddress_
        );

        bytes memory proxyBytecode = type(ATKFundProxy).creationCode;
        predictedAddress = _predictProxyAddress(proxyBytecode, constructorArgs, salt);
        return predictedAddress;
    }
}
