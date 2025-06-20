// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { AbstractATKTokenFactoryImplementation } from
    "../../system/token-factory/AbstractATKTokenFactoryImplementation.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Interface imports
import { IATKStableCoin } from "./IATKStableCoin.sol";
import { IATKStableCoinFactory } from "./IATKStableCoinFactory.sol";
import { ISMARTTokenAccessManager } from "../../smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { IATKTokenFactory } from "../../system/token-factory/IATKTokenFactory.sol";
import { IATKSystem } from "../../system/IATKSystem.sol";
import { ISMARTTopicSchemeRegistry } from "../../smart/interface/ISMARTTopicSchemeRegistry.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";

// Constants
import { ATKTopics } from "../../system/ATKTopics.sol";

// Local imports
import { ATKStableCoinProxy } from "./ATKStableCoinProxy.sol";

/// @title Implementation of the ATK Stable Coin Factory
/// @notice This contract is responsible for creating instances of ATK Stable Coins.
contract ATKStableCoinFactoryImplementation is IATKStableCoinFactory, AbstractATKTokenFactoryImplementation {
    bytes32 public constant override typeId = keccak256("ATKStableCoinFactory");

    /// @notice The collateral claim topic ID.
    uint256 internal _collateralClaimTopicId;

    /// @notice Constructor for the ATKStableCoinFactoryImplementation.
    /// @param forwarder The address of the trusted forwarder for meta-transactions.
    constructor(address forwarder) AbstractATKTokenFactoryImplementation(forwarder) { }

    /// @inheritdoc IATKTokenFactory
    /// @param systemAddress The address of the `IATKSystem` contract.
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
        override(AbstractATKTokenFactoryImplementation, IATKTokenFactory)
        initializer
    {
        super.initialize(systemAddress, tokenImplementation_, initialAdmin, identityVerificationModule_);

        ISMARTTopicSchemeRegistry topicSchemeRegistry =
            ISMARTTopicSchemeRegistry(IATKSystem(_systemAddress).topicSchemeRegistry());

        _collateralClaimTopicId = topicSchemeRegistry.getTopicId(ATKTopics.TOPIC_COLLATERAL);
    }

    /// @notice Creates a new ATK Stable Coin.
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

        // ABI encode constructor arguments for ATKStableCoinProxy
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

        // Get the creation bytecode of ATKStableCoinProxy
        bytes memory proxyBytecode = type(ATKStableCoinProxy).creationCode;

        // Deploy using the helper from the abstract contract
        address deployedTokenIdentityAddress;
        (deployedStableCoinAddress, deployedTokenIdentityAddress) =
            _deployToken(proxyBytecode, constructorArgs, salt, address(accessManager));

        if (deployedTokenIdentityAddress != tokenIdentityAddress) {
            revert TokenIdentityAddressMismatch(deployedTokenIdentityAddress, tokenIdentityAddress);
        }

        return deployedStableCoinAddress;
    }

    /// @notice Checks if a given address implements the IATKStableCoin interface.
    /// @param tokenImplementation_ The address of the contract to check.
    /// @return bool True if the contract supports the IATKStableCoin interface, false otherwise.
    function isValidTokenImplementation(address tokenImplementation_) public view override returns (bool) {
        return IERC165(tokenImplementation_).supportsInterface(type(IATKStableCoin).interfaceId);
    }

    /// @notice Predicts the deployment address of a ATKStableCoinProxy contract.
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

        bytes memory proxyBytecode = type(ATKStableCoinProxy).creationCode;
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
        return interfaceId == type(IATKStableCoinFactory).interfaceId || super.supportsInterface(interfaceId);
    }
}
