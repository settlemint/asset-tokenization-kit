// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import {
    AbstractATKTokenFactoryImplementation
} from "../../../contracts/system/tokens/factory/AbstractATKTokenFactoryImplementation.sol";
import { IATKTokenFactory } from "../../../contracts/system/tokens/factory/IATKTokenFactory.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { IATKSystemAccessManaged } from "../../../contracts/system/access-manager/IATKSystemAccessManaged.sol";

// Import additional contracts for issuer identity tests
import { IATKSystem } from "../../../contracts/system/IATKSystem.sol";
import { ATKSystemImplementation } from "../../../contracts/system/ATKSystemImplementation.sol";
import { SystemUtils } from "../../utils/SystemUtils.sol";
import { ATKSystemRoles } from "../../../contracts/system/ATKSystemRoles.sol";
import { ATKTopics } from "../../../contracts/system/ATKTopics.sol";
import { ISMARTTopicSchemeRegistry } from "../../../contracts/smart/interface/ISMARTTopicSchemeRegistry.sol";
import { IERC735 } from "@onchainid/contracts/interface/IERC735.sol";
import { MockedSMARTToken } from "../../mocks/MockedSMARTToken.sol";
import { IContractWithIdentity } from "../../../contracts/system/identity-factory/IContractWithIdentity.sol";

contract MockProxy {
    uint256 public value;

    constructor(uint256 _value) {
        value = _value;
    }
}

contract MockContractWithIdentity is IContractWithIdentity {
    function onchainID() external pure returns (address) {
        return address(0);
    }

    function canAddClaim(address) external pure returns (bool) {
        return true;
    }

    function canRemoveClaim(address) external pure returns (bool) {
        return true;
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(IContractWithIdentity).interfaceId || interfaceId == type(IERC165).interfaceId;
    }
}

// Comprehensive test with system integration for testing issuer claim functionality
contract AbstractATKTokenFactoryImplementationTest is Test {
    // Test infrastructure
    SystemUtils public systemUtils;
    IATKSystem public atkSystem;
    TestableTokenFactoryWithSystem public factoryImpl;
    TestableTokenFactoryWithSystem public factory;

    address public admin = address(0x1);
    address public tokenFactory = address(0x2);
    address public forwarder = address(0x5);

    function setUp() public {
        // Setup complete system
        systemUtils = new SystemUtils(admin);
        atkSystem = IATKSystem(address(systemUtils.system()));

        // Create factory implementation
        factoryImpl = new TestableTokenFactoryWithSystem(forwarder);

        // Deploy factory proxy and initialize
        vm.startPrank(admin);

        // Create proxy data for initialization
        MockedSMARTToken token = new MockedSMARTToken();
        bytes memory initData = abi.encodeWithSelector(
            IATKTokenFactory.initialize.selector,
            address(systemUtils.systemAccessManager()),
            address(atkSystem),
            address(token)
        );

        // Deploy proxy using CREATE2-like mechanism (simplified for testing)
        bytes memory proxyCreationCode =
            abi.encodePacked(type(ERC1967Proxy).creationCode, abi.encode(address(factoryImpl), initData));

        bytes32 salt = keccak256("test-factory");
        address factoryProxy;
        assembly {
            factoryProxy := create2(0, add(proxyCreationCode, 0x20), mload(proxyCreationCode), salt)
        }
        factory = TestableTokenFactoryWithSystem(factoryProxy);

        // Grant TOKEN_FACTORY_MODULE_ROLE to factory for testing
        // First admin needs TOKEN_FACTORY_REGISTRY_MODULE_ROLE to grant TOKEN_FACTORY_MODULE_ROLE
        systemUtils.systemAccessManager().grantRole(ATKSystemRoles.TOKEN_FACTORY_REGISTRY_MODULE_ROLE, admin);
        systemUtils.systemAccessManager().grantRole(ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE, address(factory));
        vm.stopPrank();
    }

    function test_DeployContractIdentity_IssuesIssuerClaim() public {
        // Test that _deployContractIdentity issues an issuer claim

        address mockContract = address(new MockContractWithIdentity());

        // Deploy contract identity and check that issuer claim is issued
        vm.prank(address(factory));
        address contractIdentity = factory.exposedDeployContractIdentity(
            mockContract,
            "Test Contract",
            840 // US country code
        );

        // Verify that the contract identity received an issuer claim
        address organisationIdentity = ATKSystemImplementation(address(atkSystem)).organisationIdentity();
        uint256 topicId =
            ISMARTTopicSchemeRegistry(atkSystem.topicSchemeRegistry()).getTopicId(ATKTopics.TOPIC_ASSET_ISSUER);

        // Check if the claim exists on the contract identity
        bytes32 claimId = keccak256(abi.encode(organisationIdentity, topicId));

        // Get claim from the identity (this tests the end-to-end flow)
        (uint256 topic,, address issuer,, bytes memory data,) = IERC735(contractIdentity).getClaim(claimId);

        // Verify the claim details
        assertEq(topic, topicId, "Claim should have correct topic ID");
        assertEq(issuer, organisationIdentity, "Claim should be issued by organisation identity");

        // Decode and verify claim data (should be abi.encode(issuerIdentity))
        address decodedIssuer = abi.decode(data, (address));
        assertEq(decodedIssuer, organisationIdentity, "Claim data should contain organisation identity address");
    }

    function test_DeployContractIdentity_NoIssuerIdentity_SkipsIssuerClaim() public {
        // Test behavior when issuer identity is not set (edge case)
        // This is more of a defensive test since issuer identity should always be set after bootstrap

        // Create a factory with a mock system that has no issuer identity
        TestableTokenFactoryWithMockSystem factoryWithMockImpl = new TestableTokenFactoryWithMockSystem(
            forwarder, atkSystem.identityFactory(), atkSystem.identityRegistry()
        );

        // Initialize via proxy
        MockedSMARTToken token = new MockedSMARTToken();
        bytes memory initData = abi.encodeWithSelector(
            IATKTokenFactory.initialize.selector,
            address(systemUtils.systemAccessManager()),
            address(factoryWithMockImpl.mockSystem()),
            address(token)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(factoryWithMockImpl), initData);
        TestableTokenFactoryWithMockSystem factoryWithMock = TestableTokenFactoryWithMockSystem(address(proxy));

        vm.startPrank(admin);
        systemUtils.systemAccessManager().grantRole(ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE, address(factoryWithMock));
        vm.stopPrank();

        address mockContract = address(new MockContractWithIdentity());

        // Should not revert even when issuer identity is not set
        vm.prank(address(factoryWithMock));
        address contractIdentity = factoryWithMock.exposedDeployContractIdentity(mockContract, "Test Contract", 840);

        // Verify contract identity was created (basic functionality still works)
        assertTrue(contractIdentity != address(0), "Contract identity should be created");
    }

    function test_IssuerClaim_ProperlyEncoded() public {
        // Test that issuer claims are properly encoded according to topic signature

        address mockContract = address(new MockContractWithIdentity());

        vm.prank(address(factory));
        address contractIdentity = factory.exposedDeployContractIdentity(mockContract, "Test Contract", 840);

        // Get the organisation claim and verify its encoding
        address organisationIdentity = ATKSystemImplementation(address(atkSystem)).organisationIdentity();
        uint256 topicId =
            ISMARTTopicSchemeRegistry(atkSystem.topicSchemeRegistry()).getTopicId(ATKTopics.TOPIC_ASSET_ISSUER);

        bytes32 claimId = keccak256(abi.encode(organisationIdentity, topicId));
        (,,,, bytes memory data,) = IERC735(contractIdentity).getClaim(claimId);

        // According to TOPIC_ASSET_ISSUER signature: "address organisationAddress"
        address decodedIssuer = abi.decode(data, (address));
        assertEq(decodedIssuer, organisationIdentity, "Claim should be encoded as per topic signature");
    }

    function testConstructorDisablesInitializers_Unit() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidInitialization()"));
        factoryImpl.initialize(address(0xA1), address(0xA2), address(0xA3));
    }

    function testTokenImplementationInitiallyZero_Unit() public view {
        assertEq(factoryImpl.tokenImplementation(), address(0));
    }

    function testIsFactoryTokenInitiallyFalse_Unit() public {
        address randomAddress = makeAddr("random");
        assertFalse(factory.isFactoryToken(randomAddress));
    }

    function testSupportsInterface_Unit() public view {
        assertTrue(factory.supportsInterface(type(IATKTokenFactory).interfaceId));
        assertTrue(factory.supportsInterface(type(IERC165).interfaceId));
        assertTrue(factory.supportsInterface(type(IATKSystemAccessManaged).interfaceId));
        assertFalse(factory.supportsInterface(bytes4(0x12345678)));
    }

    function testIsValidTokenImplementation_Unit() public {
        address testAddress = makeAddr("anyAddress");
        assertTrue(factory.isValidTokenImplementation(testAddress));
    }

    function testCalculateSaltDeterministic_Unit() public view {
        bytes32 salt1 = factory.exposedCalculateSalt("TestToken", "TEST", 18);
        bytes32 salt2 = factory.exposedCalculateSalt("TestToken", "TEST", 18);
        assertEq(salt1, salt2);
        assertTrue(salt1 != bytes32(0));
    }

    function testCalculateSaltDifferentInputs_Unit() public view {
        bytes32 salt1 = factory.exposedCalculateSalt("TestToken1", "TEST1", 18);
        bytes32 salt2 = factory.exposedCalculateSalt("TestToken2", "TEST2", 18);
        assertTrue(salt1 != salt2);
    }

    function testPredictProxyAddressDeterministic_Unit() public view {
        bytes memory proxyCode = type(MockProxy).creationCode;
        bytes memory constructorArgs = abi.encode(123);
        address predicted1 = factory.exposedPredictProxyAddress(proxyCode, constructorArgs, "TestToken", "TEST", 18);
        address predicted2 = factory.exposedPredictProxyAddress(proxyCode, constructorArgs, "TestToken", "TEST", 18);
        assertEq(predicted1, predicted2);
        assertTrue(predicted1 != address(0));
    }

    function testPredictProxyAddressDifferentSalts_Unit() public view {
        bytes memory proxyCode = type(MockProxy).creationCode;
        bytes memory constructorArgs = abi.encode(123);
        address predicted1 = factory.exposedPredictProxyAddress(proxyCode, constructorArgs, "TestToken1", "TEST1", 18);
        address predicted2 = factory.exposedPredictProxyAddress(proxyCode, constructorArgs, "TestToken2", "TEST2", 18);
        assertTrue(predicted1 != predicted2);
    }

    function testErrorSelectors_Unit() public pure {
        bytes4 invalidTokenSelector = IATKTokenFactory.InvalidTokenAddress.selector;
        bytes4 invalidImplSelector = IATKTokenFactory.InvalidImplementationAddress.selector;
        bytes4 proxyFailedSelector = IATKTokenFactory.ProxyCreationFailed.selector;
        bytes4 addressDeployedSelector = IATKTokenFactory.AddressAlreadyDeployed.selector;

        assertTrue(invalidTokenSelector != bytes4(0));
        assertTrue(invalidImplSelector != bytes4(0));
        assertTrue(proxyFailedSelector != bytes4(0));
        assertTrue(addressDeployedSelector != bytes4(0));

        assertTrue(invalidTokenSelector != invalidImplSelector);
        assertTrue(invalidTokenSelector != proxyFailedSelector);
        assertTrue(invalidTokenSelector != addressDeployedSelector);
        assertTrue(invalidImplSelector != proxyFailedSelector);
        assertTrue(invalidImplSelector != addressDeployedSelector);
        assertTrue(proxyFailedSelector != addressDeployedSelector);
    }
}

// Enhanced testable token factory that integrates with system for issuer claim testing
contract TestableTokenFactoryWithSystem is AbstractATKTokenFactoryImplementation {
    bytes32 public constant override typeId = keccak256("TestableTokenFactoryWithSystem");

    constructor(address forwarder) AbstractATKTokenFactoryImplementation(forwarder) { }

    function isValidTokenImplementation(address) external pure override returns (bool) {
        return true;
    }

    // Expose _deployContractIdentity for testing
    function exposedDeployContractIdentity(
        address contractAddress,
        string memory description,
        uint16 country
    )
        external
        returns (address)
    {
        return _deployContractIdentity(contractAddress, description, country);
    }

    function exposedCalculateSalt(
        string memory name,
        string memory symbol,
        uint8 decimals
    )
        external
        view
        returns (bytes32)
    {
        bytes memory saltInput = _buildSaltInput(name, symbol, decimals);
        return _calculateSalt(_systemAddress, saltInput);
    }

    function exposedPredictProxyAddress(
        bytes memory proxyCreationCode,
        bytes memory encodedConstructorArgs,
        string memory nameForSalt,
        string memory symbolForSalt,
        uint8 decimals
    )
        external
        view
        returns (address)
    {
        bytes memory saltInput = _buildSaltInput(nameForSalt, symbolForSalt, decimals);
        return _predictProxyAddress(proxyCreationCode, encodedConstructorArgs, saltInput);
    }
}

// Mock system that returns zero address for issuer identity (for testing edge cases)
contract MockSystemWithoutIssuer {
    address public identityFactoryAddress;
    address public identityRegistryAddress;

    constructor(address identityFactory_, address identityRegistry_) {
        identityFactoryAddress = identityFactory_;
        identityRegistryAddress = identityRegistry_;
    }

    function organisationIdentity() external pure returns (address) {
        return address(0);
    }

    function issueClaimByOrganisation(address, uint256, bytes memory) external pure {
        // Do nothing - simulates system without issuer identity
    }

    function identityFactory() external view returns (address) {
        return identityFactoryAddress;
    }

    function identityRegistry() external view returns (address) {
        return identityRegistryAddress;
    }
}

// Factory with mock system for testing edge cases
contract TestableTokenFactoryWithMockSystem is AbstractATKTokenFactoryImplementation {
    bytes32 public constant override typeId = keccak256("TestableTokenFactoryWithMockSystem");
    MockSystemWithoutIssuer public mockSystem;

    constructor(
        address forwarder,
        address identityFactory_,
        address identityRegistry_
    )
        AbstractATKTokenFactoryImplementation(forwarder)
    {
        mockSystem = new MockSystemWithoutIssuer(identityFactory_, identityRegistry_);
    }

    function isValidTokenImplementation(address) external pure override returns (bool) {
        return true;
    }

    function exposedDeployContractIdentity(
        address contractAddress,
        string memory description,
        uint16 country
    )
        external
        returns (address)
    {
        return _deployContractIdentity(contractAddress, description, country);
    }
}
