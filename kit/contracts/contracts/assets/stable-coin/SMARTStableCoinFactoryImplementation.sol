// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { AbstractSMARTTokenFactoryImplementation } from
    "../../system/token-factory/AbstractSMARTTokenFactoryImplementation.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Interface imports
import { ISMARTStableCoin } from "./ISMARTStableCoin.sol";
import { ISMARTStableCoinFactory } from "./ISMARTStableCoinFactory.sol";
import { ISMARTTokenAccessManager } from "../../smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { ISMARTTokenFactory } from "../../system/token-factory/ISMARTTokenFactory.sol";
import { ISMARTSystem } from "../../system/ISMARTSystem.sol";
import { ISMARTTopicSchemeRegistry } from "../../system/topic-scheme-registry/ISMARTTopicSchemeRegistry.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";

// Constants
import { SMARTTopics } from "../../system/SMARTTopics.sol";

// Local imports
import { SMARTStableCoinProxy } from "./SMARTStableCoinProxy.sol";

/// @title Implementation of the SMART Stable Coin Factory
/// @notice This contract is responsible for creating instances of SMART Stable Coins.
contract SMARTStableCoinFactoryImplementation is ISMARTStableCoinFactory, AbstractSMARTTokenFactoryImplementation {
    /// @notice The collateral claim topic ID.
    uint256 internal _collateralClaimTopicId;

    /// @notice Constructor for the SMARTStableCoinFactoryImplementation.
    /// @param forwarder The address of the trusted forwarder for meta-transactions.
    constructor(address forwarder) AbstractSMARTTokenFactoryImplementation(forwarder) { }

    /// @inheritdoc ISMARTTokenFactory
    /// @param systemAddress The address of the `ISMARTSystem` contract.
    /// @param tokenImplementation_ The initial address of the token implementation contract.
    /// @param initialAdmin The address to be granted the DEFAULT_ADMIN_ROLE and DEPLOYER_ROLE.
    /// @param identityVerificationModule_ The address of the identity verification module.
    function initialize(
        address systemAddress,
        address tokenImplementation_,
        address initialAdmin,
        address identityVerificationModule_
    )
        public
        override(AbstractSMARTTokenFactoryImplementation, ISMARTTokenFactory)
        initializer
    {
        super.initialize(systemAddress, tokenImplementation_, initialAdmin, identityVerificationModule_);

        ISMARTTopicSchemeRegistry topicSchemeRegistry =
            ISMARTTopicSchemeRegistry(ISMARTSystem(_systemAddress).topicSchemeRegistryProxy());

        _collateralClaimTopicId = topicSchemeRegistry.getTopicId(SMARTTopics.TOPIC_COLLATERAL);
    }

    /// @notice Creates a new SMART Stable Coin.
    /// @param name_ The name of the stable coin.
    /// @param symbol_ The symbol of the stable coin.
    /// @param decimals_ The number of decimals for the stable coin.
    /// @param requiredClaimTopics_ An array of claim topics required for interacting with the stable coin.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @return deployedStableCoinAddress The address of the newly deployed stable coin contract.
    function createStableCoin(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256[] memory requiredClaimTopics_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        external
        returns (address deployedStableCoinAddress)
    {
        bytes memory salt = _buildSaltInput(name_, symbol_, decimals_);
        // Create the access manager for the token
        ISMARTTokenAccessManager accessManager = _createAccessManager(salt);

        address tokenIdentityAddress = _predictTokenIdentityAddress(name_, symbol_, decimals_, address(accessManager));

        // ABI encode constructor arguments for SMARTStableCoinProxy
        bytes memory constructorArgs = abi.encode(
            address(this),
            name_,
            symbol_,
            decimals_,
            tokenIdentityAddress,
            _collateralClaimTopicId,
            _addIdentityVerificationModulePair(initialModulePairs_, requiredClaimTopics_),
            _identityRegistry(),
            _compliance(),
            address(accessManager)
        );

        // Get the creation bytecode of SMARTStableCoinProxy
        bytes memory proxyBytecode = type(SMARTStableCoinProxy).creationCode;

        // Deploy using the helper from the abstract contract
        address deployedTokenIdentityAddress;
        (deployedStableCoinAddress, deployedTokenIdentityAddress) =
            _deployToken(proxyBytecode, constructorArgs, salt, address(accessManager));

        if (deployedTokenIdentityAddress != tokenIdentityAddress) {
            revert TokenIdentityAddressMismatch(deployedTokenIdentityAddress, tokenIdentityAddress);
        }

        return deployedStableCoinAddress;
    }

    /// @notice Checks if a given address implements the ISMARTStableCoin interface.
    /// @param tokenImplementation_ The address of the contract to check.
    /// @return bool True if the contract supports the ISMARTStableCoin interface, false otherwise.
    function isValidTokenImplementation(address tokenImplementation_) public view override returns (bool) {
        return IERC165(tokenImplementation_).supportsInterface(type(ISMARTStableCoin).interfaceId);
    }

    /// @notice Predicts the deployment address of a SMARTStableCoinProxy contract.
    /// @param name_ The name of the stable coin.
    /// @param symbol_ The symbol of the stable coin.
    /// @param decimals_ The decimals of the stable coin.
    /// @param requiredClaimTopics_ The required claim topics for the stable coin.
    /// @param initialModulePairs_ The initial compliance module pairs for the stable coin.
    /// @return predictedAddress The predicted address of the stable coin contract.
    function predictStableCoinAddress(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
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
            _collateralClaimTopicId,
            _addIdentityVerificationModulePair(initialModulePairs_, requiredClaimTopics_),
            _identityRegistry(),
            _compliance(),
            accessManagerAddress_
        );

        bytes memory proxyBytecode = type(SMARTStableCoinProxy).creationCode;
        predictedAddress = _predictProxyAddress(proxyBytecode, constructorArgs, salt);
        return predictedAddress;
    }
}
