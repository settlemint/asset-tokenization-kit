// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { console2 } from "forge-std/console2.sol";

import { SMARTComplianceImplementation } from "../../../contracts/system/compliance/SMARTComplianceImplementation.sol";
import { SMARTComplianceProxy } from "../../../contracts/system/compliance/SMARTComplianceProxy.sol";
import { ISMARTCompliance } from "../../../contracts/interface/ISMARTCompliance.sol";
import { ISMARTComplianceModule } from "../../../contracts/interface/ISMARTComplianceModule.sol";
import { ISMART } from "../../../contracts/interface/ISMART.sol";
import { SMARTComplianceModuleParamPair } from "../../../contracts/interface/structs/SMARTComplianceModuleParamPair.sol";

import { MockedComplianceModule } from "../../utils/mocks/MockedComplianceModule.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract MockSMARTToken {
    SMARTComplianceModuleParamPair[] private _modules;
    address public complianceContract;

    constructor(address _compliance) {
        complianceContract = _compliance;
    }

    function addModule(address module, bytes memory params) external {
        _modules.push(SMARTComplianceModuleParamPair(module, params));
    }

    function clearModules() external {
        delete _modules;
    }

    function complianceModules() external view returns (SMARTComplianceModuleParamPair[] memory) {
        return _modules;
    }

    function simulateTransfer(address from, address to, uint256 amount) external {
        ISMARTCompliance(complianceContract).transferred(address(this), from, to, amount);
    }

    function simulateCreate(address to, uint256 amount) external {
        ISMARTCompliance(complianceContract).created(address(this), to, amount);
    }

    function simulateDestroy(address from, uint256 amount) external {
        ISMARTCompliance(complianceContract).destroyed(address(this), from, amount);
    }
}

contract MockFailingModule is ISMARTComplianceModule {
    string public failureReason;
    bool public shouldFailTransfer;
    bool public shouldFailValidation;

    constructor(string memory _failureReason, bool _shouldFailTransfer, bool _shouldFailValidation) {
        failureReason = _failureReason;
        shouldFailTransfer = _shouldFailTransfer;
        shouldFailValidation = _shouldFailValidation;
    }

    function canTransfer(address, address, address, uint256, bytes calldata) external view override {
        if (shouldFailTransfer) {
            revert ComplianceCheckFailed(failureReason);
        }
    }

    function transferred(address, address, address, uint256, bytes calldata) external override { }

    function created(address, address, uint256, bytes calldata) external override { }

    function destroyed(address, address, uint256, bytes calldata) external override { }

    function validateParameters(bytes calldata) external view override {
        if (shouldFailValidation) {
            revert InvalidParameters(failureReason);
        }
    }

    function name() external pure override returns (string memory) {
        return "MockFailingModule";
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(ISMARTComplianceModule).interfaceId || interfaceId == type(IERC165).interfaceId;
    }
}

contract MockNonCompliantModule {
    function someFunction() external pure returns (uint256) {
        return 42;
    }
}

contract SMARTComplianceImplementationTest is Test {
    SMARTComplianceImplementation public implementation;
    SMARTComplianceImplementation public compliance;
    MockSMARTToken public token;
    MockedComplianceModule public validModule;
    MockFailingModule public failingModule;
    MockNonCompliantModule public nonCompliantModule;

    address public admin = makeAddr("admin");
    address public trustedForwarder = address(0x1234);
    address public alice = address(0xa11ce);
    address public bob = address(0xb0b);

    function setUp() public {
        // Deploy implementation and use it directly for unit testing
        implementation = new SMARTComplianceImplementation(trustedForwarder);

        // Deploy as proxy
        address[] memory initialAdmins = new address[](1);
        initialAdmins[0] = admin;
        bytes memory initData = abi.encodeWithSelector(SMARTComplianceImplementation.initialize.selector, initialAdmins);
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);

        // Access proxy as SMARTComplianceImplementation
        compliance = SMARTComplianceImplementation(address(proxy));

        // Deploy mock token
        token = new MockSMARTToken(address(compliance));

        // Deploy mock modules
        validModule = new MockedComplianceModule();
        failingModule = new MockFailingModule("Transfer not allowed", true, false);
        nonCompliantModule = new MockNonCompliantModule();
    }

    function testInitializeCanOnlyBeCalledOnce() public {
        vm.expectRevert();
        address[] memory initialAdmins = new address[](1);
        initialAdmins[0] = admin;
        compliance.initialize(initialAdmins);
    }

    function testSupportsInterface() public view {
        assertTrue(compliance.supportsInterface(type(ISMARTCompliance).interfaceId));
        assertTrue(compliance.supportsInterface(type(IERC165).interfaceId));
        assertFalse(compliance.supportsInterface(0xdeadbeef));
    }

    function testIsValidComplianceModuleWithValidModule() public view {
        bytes memory params = abi.encode(uint256(100));
        ISMARTCompliance(address(compliance)).isValidComplianceModule(address(validModule), params);
        // Should not revert
    }

    function testIsValidComplianceModuleWithZeroAddress() public {
        bytes memory params = abi.encode(uint256(100));
        vm.expectRevert(ISMARTCompliance.ZeroAddressNotAllowed.selector);
        ISMARTCompliance(address(compliance)).isValidComplianceModule(address(0), params);
    }

    function testIsValidComplianceModuleWithNonCompliantModule() public {
        bytes memory params = abi.encode(uint256(100));
        vm.expectRevert(ISMARTCompliance.InvalidModule.selector);
        ISMARTCompliance(address(compliance)).isValidComplianceModule(address(nonCompliantModule), params);
    }

    function testIsValidComplianceModuleWithInvalidParams() public {
        MockFailingModule invalidParamsModule = new MockFailingModule("Invalid params", false, true);
        bytes memory params = abi.encode(uint256(100));
        vm.expectRevert(abi.encodeWithSelector(ISMARTComplianceModule.InvalidParameters.selector, "Invalid params"));
        ISMARTCompliance(address(compliance)).isValidComplianceModule(address(invalidParamsModule), params);
    }

    function testAreValidComplianceModulesWithMultipleValidModules() public {
        MockedComplianceModule module2 = new MockedComplianceModule();

        SMARTComplianceModuleParamPair[] memory pairs = new SMARTComplianceModuleParamPair[](2);
        pairs[0] = SMARTComplianceModuleParamPair(address(validModule), abi.encode(uint256(100)));
        pairs[1] = SMARTComplianceModuleParamPair(address(module2), abi.encode(uint256(200)));

        ISMARTCompliance(address(compliance)).areValidComplianceModules(pairs);
        // Should not revert
    }

    function testAreValidComplianceModulesWithOneInvalidModule() public {
        SMARTComplianceModuleParamPair[] memory pairs = new SMARTComplianceModuleParamPair[](2);
        pairs[0] = SMARTComplianceModuleParamPair(address(validModule), abi.encode(uint256(100)));
        pairs[1] = SMARTComplianceModuleParamPair(address(0), abi.encode(uint256(200)));

        vm.expectRevert(ISMARTCompliance.ZeroAddressNotAllowed.selector);
        ISMARTCompliance(address(compliance)).areValidComplianceModules(pairs);
    }

    function testCanTransferWithNoModules() public view {
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
    }

    function testCanTransferWithValidModule() public {
        token.addModule(address(validModule), abi.encode(uint256(100)));
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 50));
    }

    function testCanTransferWithFailingModule() public {
        token.addModule(address(failingModule), abi.encode(uint256(100)));
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Transfer not allowed")
        );
        ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100);
    }

    function testCanTransferWithMultipleModulesAllPass() public {
        MockedComplianceModule module2 = new MockedComplianceModule();
        token.addModule(address(validModule), abi.encode(uint256(100)));
        token.addModule(address(module2), abi.encode(uint256(200)));

        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 50));
    }

    function testCanTransferWithMultipleModulesOneFails() public {
        token.addModule(address(validModule), abi.encode(uint256(100)));
        token.addModule(address(failingModule), abi.encode(uint256(200)));

        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Transfer not allowed")
        );
        ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100);
    }

    function testCanTransferMintOperation() public {
        token.addModule(address(validModule), abi.encode(uint256(100)));
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), address(0), alice, 1000));
    }

    function testCanTransferBurnOperation() public {
        token.addModule(address(validModule), abi.encode(uint256(100)));
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, address(0), 500));
    }

    function testTransferredCallsAllModules() public {
        MockedComplianceModule module2 = new MockedComplianceModule();
        token.addModule(address(validModule), abi.encode(uint256(100)));
        token.addModule(address(module2), abi.encode(uint256(200)));

        vm.prank(address(token));
        ISMARTCompliance(address(compliance)).transferred(address(token), alice, bob, 100);

        // Verify modules were called
        assertEq(validModule.transferredCallCount(), 1);
        assertEq(module2.transferredCallCount(), 1);
    }

    function testTransferredWithNoModules() public {
        vm.prank(address(token));
        ISMARTCompliance(address(compliance)).transferred(address(token), alice, bob, 100);
        // Should not revert
    }

    function testCreatedCallsAllModules() public {
        MockedComplianceModule module2 = new MockedComplianceModule();
        token.addModule(address(validModule), abi.encode(uint256(100)));
        token.addModule(address(module2), abi.encode(uint256(200)));

        vm.prank(address(token));
        ISMARTCompliance(address(compliance)).created(address(token), alice, 1000);

        // Verify modules were called
        assertEq(validModule.createdCallCount(), 1);
        assertEq(module2.createdCallCount(), 1);
    }

    function testCreatedWithNoModules() public {
        vm.prank(address(token));
        ISMARTCompliance(address(compliance)).created(address(token), alice, 1000);
        // Should not revert
    }

    function testDestroyedCallsAllModules() public {
        MockedComplianceModule module2 = new MockedComplianceModule();
        token.addModule(address(validModule), abi.encode(uint256(100)));
        token.addModule(address(module2), abi.encode(uint256(200)));

        vm.prank(address(token));
        ISMARTCompliance(address(compliance)).destroyed(address(token), alice, 500);

        // Verify modules were called
        assertEq(validModule.destroyedCallCount(), 1);
        assertEq(module2.destroyedCallCount(), 1);
    }

    function testDestroyedWithNoModules() public {
        vm.prank(address(token));
        ISMARTCompliance(address(compliance)).destroyed(address(token), alice, 500);
        // Should not revert
    }

    function testGasOptimizationManyModules() public {
        // Add 10 modules to test gas efficiency
        for (uint256 i = 0; i < 10; i++) {
            MockedComplianceModule module = new MockedComplianceModule();
            token.addModule(address(module), abi.encode(i * 100));
        }

        uint256 gasBefore = gasleft();
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
        uint256 gasUsed = gasBefore - gasleft();

        console2.log("Gas used for canTransfer with 10 modules:", gasUsed);
        assertLt(gasUsed, 500_000); // Ensure reasonable gas usage
    }

    function testModuleParameterPropagation() public {
        // Create a module that validates specific parameters
        MockedComplianceModule paramModule = new MockedComplianceModule();
        bytes memory specificParams = abi.encode(uint256(12_345), "test");

        token.addModule(address(paramModule), specificParams);

        // The module should receive the exact parameters
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
    }

    function testERC2771ContextSupport() public view {
        // Test that the contract correctly identifies the trusted forwarder
        assertEq(compliance.isTrustedForwarder(trustedForwarder), true);
        assertEq(compliance.isTrustedForwarder(alice), false);
    }

    function testFuzzCanTransfer(address from, address to, uint256 amount) public {
        token.addModule(address(validModule), abi.encode(uint256(100)));
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), from, to, amount));
    }

    function testFuzzModuleValidation(address moduleAddr, bytes memory params) public {
        vm.assume(moduleAddr != address(0));
        vm.assume(moduleAddr.code.length == 0); // Ensure it's not a contract

        // Should revert for non-compliant modules (EOA addresses)
        vm.expectRevert();
        ISMARTCompliance(address(compliance)).isValidComplianceModule(moduleAddr, params);
    }
}
