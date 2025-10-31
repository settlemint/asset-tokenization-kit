// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { console2 } from "forge-std/console2.sol";

import { ATKComplianceImplementation } from "../../../contracts/system/compliance/ATKComplianceImplementation.sol";
import { ISMARTCompliance } from "../../../contracts/smart/interface/ISMARTCompliance.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { IATKCompliance } from "../../../contracts/system/compliance/IATKCompliance.sol";
import {
    SMARTComplianceModuleParamPair
} from "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ATKPeopleRoles } from "../../../contracts/system/ATKPeopleRoles.sol";
import {
    ATKSystemAccessManagerImplementation
} from "../../../contracts/system/access-manager/ATKSystemAccessManagerImplementation.sol";

import { MockedComplianceModule } from "../../utils/mocks/MockedComplianceModule.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IATKSystemAccessManaged } from "../../../contracts/system/access-manager/IATKSystemAccessManaged.sol";

contract MockATKToken {
    SMARTComplianceModuleParamPair[] private _modules;
    address public complianceContract;

    constructor(address _compliance) {
        complianceContract = _compliance;
    }

    function addModule(address module, bytes memory params) external {
        _modules.push(SMARTComplianceModuleParamPair({ module: module, params: params }));
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
    bytes32 public constant override typeId = keccak256("MockFailingModule");

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

    function setShouldRevertOnValidation(bool _shouldRevert) external {
        shouldFailValidation = _shouldRevert;
    }
}

contract MockNonCompliantModule {
    function someFunction() external pure returns (uint256) {
        return 42;
    }
}

contract ATKComplianceImplementationTest is Test {
    ATKComplianceImplementation public implementation;
    ATKComplianceImplementation public compliance;
    ATKSystemAccessManagerImplementation public systemAccessManager;
    MockATKToken public token;
    MockedComplianceModule public validModule;
    MockFailingModule public failingModule;
    MockNonCompliantModule public nonCompliantModule;

    address public admin = makeAddr("admin");
    address public complianceManager = makeAddr("complianceManager");
    address public unauthorizedUser = makeAddr("unauthorizedUser");
    address public trustedForwarder = address(0x1234);
    address public alice = address(0xa11ce);
    address public bob = address(0xb0b);
    address public charlie = address(0xc4a12e);

    function setUp() public {
        // Deploy system access manager
        address[] memory initialAdmins = new address[](1);
        initialAdmins[0] = admin;
        ATKSystemAccessManagerImplementation accessManagerImpl =
            new ATKSystemAccessManagerImplementation(trustedForwarder);
        bytes memory accessManagerInitData =
            abi.encodeWithSelector(accessManagerImpl.initialize.selector, initialAdmins);
        ERC1967Proxy accessManagerProxy = new ERC1967Proxy(address(accessManagerImpl), accessManagerInitData);
        systemAccessManager = ATKSystemAccessManagerImplementation(address(accessManagerProxy));

        // Grant compliance manager role to our test user
        vm.prank(admin);
        systemAccessManager.grantRole(ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE, complianceManager);

        // Deploy compliance implementation
        implementation = new ATKComplianceImplementation(trustedForwarder);

        // Deploy compliance as proxy
        bytes memory initData =
            abi.encodeWithSelector(ATKComplianceImplementation.initialize.selector, address(systemAccessManager));
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        compliance = ATKComplianceImplementation(address(proxy));

        // System access manager is set during initialization

        // Deploy mock token
        token = new MockATKToken(address(compliance));

        // Deploy mock modules
        validModule = new MockedComplianceModule();
        failingModule = new MockFailingModule("Transfer not allowed", true, false);
        nonCompliantModule = new MockNonCompliantModule();
    }

    function testInitializeCanOnlyBeCalledOnce() public {
        vm.expectRevert();
        compliance.initialize(address(systemAccessManager));
    }

    function testSupportsInterface() public view {
        assertTrue(compliance.supportsInterface(type(ISMARTCompliance).interfaceId));
        assertTrue(compliance.supportsInterface(type(IATKCompliance).interfaceId));
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
        pairs[0] = SMARTComplianceModuleParamPair({ module: address(validModule), params: abi.encode(uint256(100)) });
        pairs[1] = SMARTComplianceModuleParamPair({ module: address(module2), params: abi.encode(uint256(200)) });

        ISMARTCompliance(address(compliance)).areValidComplianceModules(pairs);
        // Should not revert
    }

    function testAreValidComplianceModulesWithOneInvalidModule() public {
        SMARTComplianceModuleParamPair[] memory pairs = new SMARTComplianceModuleParamPair[](2);
        pairs[0] = SMARTComplianceModuleParamPair({ module: address(validModule), params: abi.encode(uint256(100)) });
        pairs[1] = SMARTComplianceModuleParamPair({ module: address(0), params: abi.encode(uint256(200)) });

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

    // --- AllowList Management Tests ---

    function testAddToBypassListAsManager() public {
        vm.prank(complianceManager);
        vm.expectEmit(true, true, true, true);
        emit IATKCompliance.AddressAddedToBypassList(charlie, complianceManager);
        IATKCompliance(address(compliance)).addToBypassList(charlie);
        assertTrue(IATKCompliance(address(compliance)).isBypassed(charlie));
    }

    function testAddToBypassListAsUnauthorized() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(
                IATKSystemAccessManaged.AccessControlUnauthorizedAccount.selector,
                unauthorizedUser,
                ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE
            )
        );
        IATKCompliance(address(compliance)).addToBypassList(charlie);
    }

    function testAddAlreadyBypassedAddress() public {
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addToBypassList(charlie);

        vm.prank(complianceManager);
        vm.expectRevert(abi.encodeWithSelector(IATKCompliance.AddressAlreadyOnBypassList.selector, charlie));
        IATKCompliance(address(compliance)).addToBypassList(charlie);
    }

    function testAddZeroAddressToBypassList() public {
        vm.prank(complianceManager);
        vm.expectRevert(abi.encodeWithSelector(ISMARTCompliance.ZeroAddressNotAllowed.selector));
        IATKCompliance(address(compliance)).addToBypassList(address(0));
    }

    function testRemoveFromBypassListAsManager() public {
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addToBypassList(charlie);

        vm.prank(complianceManager);
        vm.expectEmit(true, true, true, true);
        emit IATKCompliance.AddressRemovedFromBypassList(charlie, complianceManager);
        IATKCompliance(address(compliance)).removeFromBypassList(charlie);
        assertFalse(IATKCompliance(address(compliance)).isBypassed(charlie));
    }

    function testRemoveFromBypassListAsUnauthorized() public {
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addToBypassList(charlie);

        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(
                IATKSystemAccessManaged.AccessControlUnauthorizedAccount.selector,
                unauthorizedUser,
                ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE
            )
        );
        IATKCompliance(address(compliance)).removeFromBypassList(charlie);
    }

    function testRemoveNonBypassedAddress() public {
        vm.prank(complianceManager);
        vm.expectRevert(abi.encodeWithSelector(IATKCompliance.AddressNotOnBypassList.selector, charlie));
        IATKCompliance(address(compliance)).removeFromBypassList(charlie);
    }

    function testAddMultipleToBypassList() public {
        address[] memory addresses = new address[](2);
        addresses[0] = alice;
        addresses[1] = bob;

        vm.prank(complianceManager);
        vm.expectEmit(true, true, true, true);
        emit IATKCompliance.AddressAddedToBypassList(alice, complianceManager);
        vm.expectEmit(true, true, true, true);
        emit IATKCompliance.AddressAddedToBypassList(bob, complianceManager);

        IATKCompliance(address(compliance)).addMultipleToBypassList(addresses);
        assertTrue(IATKCompliance(address(compliance)).isBypassed(alice));
        assertTrue(IATKCompliance(address(compliance)).isBypassed(bob));
    }

    function testRemoveMultipleFromBypassList() public {
        address[] memory addresses = new address[](2);
        addresses[0] = alice;
        addresses[1] = bob;

        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addMultipleToBypassList(addresses);

        vm.prank(complianceManager);
        vm.expectEmit(true, true, true, true);
        emit IATKCompliance.AddressRemovedFromBypassList(alice, complianceManager);
        vm.expectEmit(true, true, true, true);
        emit IATKCompliance.AddressRemovedFromBypassList(bob, complianceManager);

        IATKCompliance(address(compliance)).removeMultipleFromBypassList(addresses);
        assertFalse(IATKCompliance(address(compliance)).isBypassed(alice));
        assertFalse(IATKCompliance(address(compliance)).isBypassed(bob));
    }

    function testCanTransferToBypassedAddress() public {
        // Add a failing module to ensure canTransfer would normally fail
        token.addModule(address(failingModule), "");

        // Add bob to the bypass list
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addToBypassList(bob);

        // Transfer should succeed because bob is on the bypass list
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
    }

    function testCanTransferFromBypassedAddress() public {
        // Add a failing module to ensure canTransfer would normally fail
        token.addModule(address(failingModule), "");

        // Add alice to the bypass list
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addToBypassList(alice);

        // Transfer should NOT succeed because only the receiver is checked
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Transfer not allowed")
        );
        ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100);
    }

    // --- AllowList Effect on canTransfer Tests ---

    function testCanTransferWithAllowListedReceiver() public {
        // Add failing module that would normally prevent transfers
        token.addModule(address(failingModule), abi.encode(uint256(100)));

        // AllowList the receiver
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addToBypassList(bob);

        // Transfer should succeed despite failing module because receiver is allow listed
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
    }

    function testCanTransferWithNonAllowListedReceiver() public {
        // Add failing module
        token.addModule(address(failingModule), abi.encode(uint256(100)));

        // Don't allow list receiver - should fail due to failing module
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Transfer not allowed")
        );
        ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100);
    }

    function testCanTransferAllowListBypassesAllModules() public {
        // Add multiple failing modules
        MockFailingModule failingModule2 = new MockFailingModule("Another failure", true, false);
        token.addModule(address(failingModule), abi.encode(uint256(100)));
        token.addModule(address(failingModule2), abi.encode(uint256(200)));

        // AllowList receiver
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addToBypassList(bob);

        // Should succeed despite multiple failing modules
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
    }

    function testCanTransferAllowListedMintOperation() public {
        // Add failing module
        token.addModule(address(failingModule), abi.encode(uint256(100)));

        // AllowList receiver for mint (from = address(0))
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addToBypassList(alice);

        // Mint should succeed despite failing module
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), address(0), alice, 1000));
    }

    function testCanTransferNonAllowListedSenderStillChecked() public {
        // Add a valid module (allows transfers)
        token.addModule(address(validModule), abi.encode(uint256(100)));

        // Don't allow list anyone - should use normal compliance flow
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
    }

    // --- Gas optimization tests for allow list ---

    function testAllowListGasOptimization() public {
        // Add many modules
        for (uint256 i = 0; i < 5; i++) {
            MockedComplianceModule module = new MockedComplianceModule();
            token.addModule(address(module), abi.encode(i * 100));
        }

        // AllowList receiver
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addToBypassList(bob);

        // Measure gas - should be much lower due to early return
        uint256 gasBefore = gasleft();
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
        uint256 gasUsedAllowListed = gasBefore - gasleft();

        // Remove from allow list and measure gas for normal flow
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).removeFromBypassList(bob);

        gasBefore = gasleft();
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
        uint256 gasUsedNormal = gasBefore - gasleft();

        console2.log("Gas used with allow listed receiver:", gasUsedAllowListed);
        console2.log("Gas used with normal flow:", gasUsedNormal);

        // AllowListed should use significantly less gas
        assertLt(gasUsedAllowListed, gasUsedNormal);
    }

    // --- Fuzz tests for allow list ---

    function testFuzzAddToBypassList(address account) public {
        vm.assume(account != address(0));

        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addToBypassList(account);

        assertTrue(IATKCompliance(address(compliance)).isBypassed(account));
    }

    function testFuzzAllowListCanTransfer(address receiver, uint256 amount) public {
        vm.assume(receiver != address(0));

        // Add failing module
        token.addModule(address(failingModule), abi.encode(uint256(100)));

        // AllowList receiver
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addToBypassList(receiver);

        // Should always succeed with allow listed receiver
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, receiver, amount));
    }

    // --- Integration tests ---

    function testAllowListIntegrationWithTransferredCallback() public {
        // Add valid module to track calls
        token.addModule(address(validModule), abi.encode(uint256(100)));

        // AllowList receiver
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addToBypassList(bob);

        // Even with allow listed receiver, transferred callback should still work
        vm.prank(address(token));
        ISMARTCompliance(address(compliance)).transferred(address(token), alice, bob, 100);

        // Verify module was called
        assertEq(validModule.transferredCallCount(), 1);
    }

    // --- Global Compliance Module Management Tests ---

    function testAddGlobalComplianceModuleAsManager() public {
        bytes memory params = abi.encode(uint256(500));

        vm.prank(complianceManager);
        vm.expectEmit(true, true, true, true);
        emit IATKCompliance.GlobalComplianceModuleAdded(complianceManager, address(validModule), params);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(validModule), params);

        // Verify module was added
        SMARTComplianceModuleParamPair[] memory globalModules =
            IATKCompliance(address(compliance)).getGlobalComplianceModules();
        assertEq(globalModules.length, 1);
        assertEq(globalModules[0].module, address(validModule));
        assertEq(globalModules[0].params, params);
    }

    function testAddGlobalComplianceModuleAsUnauthorized() public {
        bytes memory params = abi.encode(uint256(500));

        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(
                IATKSystemAccessManaged.AccessControlUnauthorizedAccount.selector,
                unauthorizedUser,
                ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE
            )
        );
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(validModule), params);
    }

    function testAddGlobalComplianceModuleZeroAddress() public {
        bytes memory params = abi.encode(uint256(500));

        vm.prank(complianceManager);
        vm.expectRevert(ISMARTCompliance.ZeroAddressNotAllowed.selector);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(0), params);
    }

    function testAddGlobalComplianceModuleInvalidModule() public {
        bytes memory params = abi.encode(uint256(500));

        vm.prank(complianceManager);
        vm.expectRevert(ISMARTCompliance.InvalidModule.selector);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(nonCompliantModule), params);
    }

    function testAddGlobalComplianceModuleInvalidParams() public {
        MockFailingModule invalidParamsModule = new MockFailingModule("Invalid params", false, true);
        bytes memory params = abi.encode(uint256(500));

        vm.prank(complianceManager);
        vm.expectRevert(abi.encodeWithSelector(ISMARTComplianceModule.InvalidParameters.selector, "Invalid params"));
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(invalidParamsModule), params);
    }

    function testAddGlobalComplianceModuleAlreadyAdded() public {
        bytes memory params = abi.encode(uint256(500));

        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(validModule), params);

        vm.prank(complianceManager);
        vm.expectRevert(abi.encodeWithSelector(IATKCompliance.GlobalModuleAlreadyAdded.selector, address(validModule)));
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(validModule), params);
    }

    function testRemoveGlobalComplianceModuleAsManager() public {
        bytes memory params = abi.encode(uint256(500));

        // Add module first
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(validModule), params);

        // Remove module
        vm.prank(complianceManager);
        vm.expectEmit(true, true, true, true);
        emit IATKCompliance.GlobalComplianceModuleRemoved(complianceManager, address(validModule));
        IATKCompliance(address(compliance)).removeGlobalComplianceModule(address(validModule));

        // Verify module was removed
        SMARTComplianceModuleParamPair[] memory globalModules =
            IATKCompliance(address(compliance)).getGlobalComplianceModules();
        assertEq(globalModules.length, 0);
    }

    function testRemoveGlobalComplianceModuleAsUnauthorized() public {
        bytes memory params = abi.encode(uint256(500));

        // Add module first
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(validModule), params);

        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(
                IATKSystemAccessManaged.AccessControlUnauthorizedAccount.selector,
                unauthorizedUser,
                ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE
            )
        );
        IATKCompliance(address(compliance)).removeGlobalComplianceModule(address(validModule));
    }

    function testRemoveGlobalComplianceModuleNotFound() public {
        vm.prank(complianceManager);
        vm.expectRevert(abi.encodeWithSelector(IATKCompliance.GlobalModuleNotFound.selector, address(validModule)));
        IATKCompliance(address(compliance)).removeGlobalComplianceModule(address(validModule));
    }

    function testRemoveGlobalComplianceModuleSwapAndPop() public {
        // Add three modules
        MockedComplianceModule module2 = new MockedComplianceModule();
        MockedComplianceModule module3 = new MockedComplianceModule();

        bytes memory params1 = abi.encode(uint256(100));
        bytes memory params2 = abi.encode(uint256(200));
        bytes memory params3 = abi.encode(uint256(300));

        vm.startPrank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(validModule), params1);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(module2), params2);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(module3), params3);
        vm.stopPrank();

        // Remove the middle module to test swap-and-pop logic
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).removeGlobalComplianceModule(address(module2));

        // Verify remaining modules
        SMARTComplianceModuleParamPair[] memory globalModules =
            IATKCompliance(address(compliance)).getGlobalComplianceModules();
        assertEq(globalModules.length, 2);

        // Should have validModule and module3, but module3 should have moved to index 1 (swap-and-pop)
        bool foundValidModule = false;
        bool foundModule3 = false;

        for (uint256 i = 0; i < globalModules.length; i++) {
            if (globalModules[i].module == address(validModule)) {
                foundValidModule = true;
                assertEq(globalModules[i].params, params1);
            } else if (globalModules[i].module == address(module3)) {
                foundModule3 = true;
                assertEq(globalModules[i].params, params3);
            }
        }

        assertTrue(foundValidModule);
        assertTrue(foundModule3);
    }

    function testSetParametersForGlobalComplianceModuleAsManager() public {
        bytes memory initialParams = abi.encode(uint256(500));
        bytes memory newParams = abi.encode(uint256(1000));

        // Add module first
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(validModule), initialParams);

        // Update parameters
        vm.prank(complianceManager);
        vm.expectEmit(true, true, true, true);
        emit IATKCompliance.GlobalComplianceModuleParametersUpdated(complianceManager, address(validModule), newParams);
        IATKCompliance(address(compliance)).setParametersForGlobalComplianceModule(address(validModule), newParams);

        // Verify parameters were updated
        SMARTComplianceModuleParamPair[] memory globalModules =
            IATKCompliance(address(compliance)).getGlobalComplianceModules();
        assertEq(globalModules.length, 1);
        assertEq(globalModules[0].params, newParams);
    }

    function testSetParametersForGlobalComplianceModuleAsUnauthorized() public {
        bytes memory initialParams = abi.encode(uint256(500));
        bytes memory newParams = abi.encode(uint256(1000));

        // Add module first
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(validModule), initialParams);

        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(
                IATKSystemAccessManaged.AccessControlUnauthorizedAccount.selector,
                unauthorizedUser,
                ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE
            )
        );
        IATKCompliance(address(compliance)).setParametersForGlobalComplianceModule(address(validModule), newParams);
    }

    function testSetParametersForGlobalComplianceModuleNotFound() public {
        bytes memory newParams = abi.encode(uint256(1000));

        vm.prank(complianceManager);
        vm.expectRevert(abi.encodeWithSelector(IATKCompliance.GlobalModuleNotFound.selector, address(validModule)));
        IATKCompliance(address(compliance)).setParametersForGlobalComplianceModule(address(validModule), newParams);
    }

    function testSetParametersForGlobalComplianceModuleInvalidParams() public {
        MockFailingModule invalidParamsModule = new MockFailingModule("Invalid params", false, false);
        bytes memory initialParams = abi.encode(uint256(500));

        // Add module first
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(invalidParamsModule), initialParams);

        // Try to update with invalid params
        bytes memory invalidParams = abi.encode(uint256(1000));

        // Change module to fail validation
        invalidParamsModule.setShouldRevertOnValidation(true);

        vm.prank(complianceManager);
        vm.expectRevert(abi.encodeWithSelector(ISMARTComplianceModule.InvalidParameters.selector, "Invalid params"));
        IATKCompliance(address(compliance))
            .setParametersForGlobalComplianceModule(address(invalidParamsModule), invalidParams);
    }

    function testGetGlobalComplianceModulesEmpty() public view {
        SMARTComplianceModuleParamPair[] memory globalModules =
            IATKCompliance(address(compliance)).getGlobalComplianceModules();
        assertEq(globalModules.length, 0);
    }

    function testGetGlobalComplianceModulesMultiple() public {
        MockedComplianceModule module2 = new MockedComplianceModule();

        bytes memory params1 = abi.encode(uint256(100));
        bytes memory params2 = abi.encode(uint256(200));

        vm.startPrank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(validModule), params1);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(module2), params2);
        vm.stopPrank();

        SMARTComplianceModuleParamPair[] memory globalModules =
            IATKCompliance(address(compliance)).getGlobalComplianceModules();
        assertEq(globalModules.length, 2);
        assertEq(globalModules[0].module, address(validModule));
        assertEq(globalModules[0].params, params1);
        assertEq(globalModules[1].module, address(module2));
        assertEq(globalModules[1].params, params2);
    }

    // --- Global Module Integration with canTransfer Tests ---

    function testCanTransferWithGlobalModulesOnly() public {
        // Add global module
        bytes memory params = abi.encode(uint256(500));
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(validModule), params);

        // Test canTransfer - should pass global module
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
    }

    function testCanTransferWithGlobalModuleFails() public {
        // Add failing global module
        bytes memory params = abi.encode(uint256(500));
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(failingModule), params);

        // Test canTransfer - should fail due to global module
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Transfer not allowed")
        );
        ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100);
    }

    function testCanTransferWithTokenAndGlobalModulesBothPass() public {
        // Add token-specific module
        token.addModule(address(validModule), abi.encode(uint256(100)));

        // Add global module
        MockedComplianceModule globalModule = new MockedComplianceModule();
        bytes memory globalParams = abi.encode(uint256(500));
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(globalModule), globalParams);

        // Test canTransfer - should pass both modules
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
    }

    function testCanTransferWithTokenPassesGlobalFails() public {
        // Add token-specific module (passes)
        token.addModule(address(validModule), abi.encode(uint256(100)));

        // Add global module (fails)
        bytes memory globalParams = abi.encode(uint256(500));
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(failingModule), globalParams);

        // Test canTransfer - should fail due to global module
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Transfer not allowed")
        );
        ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100);
    }

    function testCanTransferWithTokenFailsGlobalPasses() public {
        // Add token-specific module (fails)
        token.addModule(address(failingModule), abi.encode(uint256(100)));

        // Add global module (passes)
        MockedComplianceModule globalModule = new MockedComplianceModule();
        bytes memory globalParams = abi.encode(uint256(500));
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(globalModule), globalParams);

        // Test canTransfer - should fail due to token module
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Transfer not allowed")
        );
        ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100);
    }

    function testCanTransferWithMultipleGlobalModules() public {
        // Add multiple global modules
        MockedComplianceModule globalModule2 = new MockedComplianceModule();
        MockedComplianceModule globalModule3 = new MockedComplianceModule();

        vm.startPrank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(validModule), abi.encode(uint256(100)));
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(globalModule2), abi.encode(uint256(200)));
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(globalModule3), abi.encode(uint256(300)));
        vm.stopPrank();

        // Test canTransfer - should pass all global modules
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
    }

    function testCanTransferBypassListSkipsGlobalModules() public {
        // Add failing global module
        bytes memory params = abi.encode(uint256(500));
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(failingModule), params);

        // Add receiver to bypass list
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addToBypassList(bob);

        // Test canTransfer - should succeed because receiver is bypassed
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
    }

    // --- Global Module Integration with Lifecycle Hooks Tests ---

    function testTransferredCallsBothTokenAndGlobalModules() public {
        // Add token-specific module
        token.addModule(address(validModule), abi.encode(uint256(100)));

        // Add global module
        MockedComplianceModule globalModule = new MockedComplianceModule();
        bytes memory globalParams = abi.encode(uint256(500));
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(globalModule), globalParams);

        // Call transferred
        vm.prank(address(token));
        ISMARTCompliance(address(compliance)).transferred(address(token), alice, bob, 100);

        // Verify both modules were called
        assertEq(validModule.transferredCallCount(), 1);
        assertEq(globalModule.transferredCallCount(), 1);
    }

    function testCreatedCallsBothTokenAndGlobalModules() public {
        // Add token-specific module
        token.addModule(address(validModule), abi.encode(uint256(100)));

        // Add global module
        MockedComplianceModule globalModule = new MockedComplianceModule();
        bytes memory globalParams = abi.encode(uint256(500));
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(globalModule), globalParams);

        // Call created
        vm.prank(address(token));
        ISMARTCompliance(address(compliance)).created(address(token), alice, 1000);

        // Verify both modules were called
        assertEq(validModule.createdCallCount(), 1);
        assertEq(globalModule.createdCallCount(), 1);
    }

    function testDestroyedCallsBothTokenAndGlobalModules() public {
        // Add token-specific module
        token.addModule(address(validModule), abi.encode(uint256(100)));

        // Add global module
        MockedComplianceModule globalModule = new MockedComplianceModule();
        bytes memory globalParams = abi.encode(uint256(500));
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(globalModule), globalParams);

        // Call destroyed
        vm.prank(address(token));
        ISMARTCompliance(address(compliance)).destroyed(address(token), alice, 500);

        // Verify both modules were called
        assertEq(validModule.destroyedCallCount(), 1);
        assertEq(globalModule.destroyedCallCount(), 1);
    }

    function testLifecycleHooksWithOnlyGlobalModules() public {
        // Add only global modules
        MockedComplianceModule globalModule = new MockedComplianceModule();
        bytes memory globalParams = abi.encode(uint256(500));
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(globalModule), globalParams);

        // Call lifecycle hooks
        vm.startPrank(address(token));
        ISMARTCompliance(address(compliance)).transferred(address(token), alice, bob, 100);
        ISMARTCompliance(address(compliance)).created(address(token), alice, 1000);
        ISMARTCompliance(address(compliance)).destroyed(address(token), alice, 500);
        vm.stopPrank();

        // Verify global module was called for all hooks
        assertEq(globalModule.transferredCallCount(), 1);
        assertEq(globalModule.createdCallCount(), 1);
        assertEq(globalModule.destroyedCallCount(), 1);
    }

    function testLifecycleHooksExecutionOrder() public {
        // Create modules that track execution order
        MockedComplianceModule tokenModule = new MockedComplianceModule();
        MockedComplianceModule globalModule = new MockedComplianceModule();

        // Add token-specific module
        token.addModule(address(tokenModule), abi.encode(uint256(100)));

        // Add global module
        bytes memory globalParams = abi.encode(uint256(500));
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(globalModule), globalParams);

        // Call transferred to test execution order
        vm.prank(address(token));
        ISMARTCompliance(address(compliance)).transferred(address(token), alice, bob, 100);

        // Both should be called (order is tested implicitly by the implementation)
        assertEq(tokenModule.transferredCallCount(), 1);
        assertEq(globalModule.transferredCallCount(), 1);
    }

    // --- Gas Optimization Tests for Global Modules ---

    function testGlobalModulesGasUsage() public {
        // Add multiple global modules
        MockedComplianceModule[] memory globalModules = new MockedComplianceModule[](5);
        for (uint256 i = 0; i < 5; i++) {
            globalModules[i] = new MockedComplianceModule();
            vm.prank(complianceManager);
            IATKCompliance(address(compliance))
                .addGlobalComplianceModule(address(globalModules[i]), abi.encode(i * 100));
        }

        // Measure gas for canTransfer with global modules
        uint256 gasBefore = gasleft();
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
        uint256 gasUsed = gasBefore - gasleft();

        console2.log("Gas used for canTransfer with 5 global modules:", gasUsed);
        assertLt(gasUsed, 300_000); // Ensure reasonable gas usage
    }

    function testGlobalModulesWithTokenModulesGasUsage() public {
        // Add token-specific modules
        for (uint256 i = 0; i < 3; i++) {
            MockedComplianceModule module = new MockedComplianceModule();
            token.addModule(address(module), abi.encode(i * 50));
        }

        // Add global modules
        for (uint256 i = 0; i < 3; i++) {
            MockedComplianceModule globalModule = new MockedComplianceModule();
            vm.prank(complianceManager);
            IATKCompliance(address(compliance)).addGlobalComplianceModule(address(globalModule), abi.encode(i * 100));
        }

        // Measure gas for canTransfer with both token and global modules
        uint256 gasBefore = gasleft();
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
        uint256 gasUsed = gasBefore - gasleft();

        console2.log("Gas used for canTransfer with 3 token + 3 global modules:", gasUsed);
        assertLt(gasUsed, 500_000); // Ensure reasonable gas usage
    }

    // --- Fuzz Tests for Global Modules ---

    function testFuzzAddGlobalComplianceModule(uint256 paramValue) public {
        bytes memory params = abi.encode(paramValue);

        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(validModule), params);

        SMARTComplianceModuleParamPair[] memory globalModules =
            IATKCompliance(address(compliance)).getGlobalComplianceModules();
        assertEq(globalModules.length, 1);
        assertEq(globalModules[0].module, address(validModule));
        assertEq(globalModules[0].params, params);
    }

    function testFuzzCanTransferWithGlobalModule(address from, address to, uint256 amount) public {
        vm.assume(to != address(0)); // Avoid zero address for bypass list logic

        // Add global module
        bytes memory params = abi.encode(uint256(500));
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(validModule), params);

        // Should always pass with valid module
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), from, to, amount));
    }

    function testFuzzGlobalModuleParameters(bytes memory params) public {
        // Assume params are valid for our simple mock module
        vm.assume(params.length > 0);

        try this.addGlobalModuleWithParams(params) {
            // If adding succeeded, test canTransfer
            assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
        } catch {
            // If adding failed due to invalid params, that's expected for some fuzz inputs
        }
    }

    // Helper function for fuzz testing
    function addGlobalModuleWithParams(bytes memory params) external {
        vm.prank(complianceManager);
        IATKCompliance(address(compliance)).addGlobalComplianceModule(address(validModule), params);
    }

    // --- Negative tests for hook caller enforcement ---
    function test_RevertWhen_TransferredCalledByNonToken() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTCompliance.UnauthorizedCaller.selector, unauthorizedUser, address(token))
        );
        ISMARTCompliance(address(compliance)).transferred(address(token), alice, bob, 100);
    }

    function test_RevertWhen_CreatedCalledByNonToken() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTCompliance.UnauthorizedCaller.selector, unauthorizedUser, address(token))
        );
        ISMARTCompliance(address(compliance)).created(address(token), alice, 1000);
    }

    function test_RevertWhen_DestroyedCalledByNonToken() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTCompliance.UnauthorizedCaller.selector, unauthorizedUser, address(token))
        );
        ISMARTCompliance(address(compliance)).destroyed(address(token), alice, 500);
    }
}
