// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { console2 } from "forge-std/console2.sol";

import { ATKComplianceImplementation } from "../../../contracts/system/compliance/ATKComplianceImplementation.sol";
import { ISMARTCompliance } from "../../../contracts/smart/interface/ISMARTCompliance.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { IATKCompliance } from "../../../contracts/system/compliance/IATKCompliance.sol";
import { ISMART } from "../../../contracts/smart/interface/ISMART.sol";
import { SMARTComplianceModuleParamPair } from
    "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ATKSystemRoles } from "../../../contracts/system/ATKSystemRoles.sol";
import { IATKSystemAccessManager } from "../../../contracts/system/access-manager/IATKSystemAccessManager.sol";
import { ATKSystemAccessControlled } from "../../../contracts/system/access-manager/ATKSystemAccessControlled.sol";

import { MockedComplianceModule } from "../../utils/mocks/MockedComplianceModule.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

contract MockATKToken {
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
}

contract MockNonCompliantModule {
    function someFunction() external pure returns (uint256) {
        return 42;
    }
}

contract MockSystemAccessManager is IATKSystemAccessManager {
    mapping(bytes32 => mapping(address => bool)) private _roles;
    mapping(bytes32 => bytes32) private _roleAdmins;

    function grantRole(bytes32 role, address account) external override {
        _roles[role][account] = true;
    }

    function revokeRole(bytes32 role, address account) external override {
        _roles[role][account] = false;
    }

    function hasRole(bytes32 role, address account) external view override returns (bool) {
        return _roles[role][account];
    }

    function getRoleAdmin(bytes32 role) external view override returns (bytes32) {
        return _roleAdmins[role];
    }

    function renounceRole(bytes32 role, address account) external override {
        _roles[role][account] = false;
    }

    function initialize(address) external {
        // Removed override keyword - function doesn't exist in interface anymore
    }

    function grantMultipleRoles(address account, bytes32[] calldata roles) external override {
        for (uint256 i = 0; i < roles.length; i++) {
            _roles[roles[i]][account] = true;
        }
    }

    function revokeMultipleRoles(address account, bytes32[] calldata roles) external override {
        for (uint256 i = 0; i < roles.length; i++) {
            _roles[roles[i]][account] = false;
        }
    }

    function batchGrantRole(bytes32 role, address[] calldata accounts) external override {
        for (uint256 i = 0; i < accounts.length; i++) {
            _roles[role][accounts[i]] = true;
        }
    }

    function batchRevokeRole(bytes32 role, address[] calldata accounts) external override {
        for (uint256 i = 0; i < accounts.length; i++) {
            _roles[role][accounts[i]] = false;
        }
    }

    function hasAnyRole(address account, bytes32[] calldata roles) external view override returns (bool) {
        for (uint256 i = 0; i < roles.length; i++) {
            if (_roles[roles[i]][account]) return true;
        }
        return false;
    }

    function hasAllRoles(address account, bytes32[] calldata roles) external view override returns (bool) {
        for (uint256 i = 0; i < roles.length; i++) {
            if (!_roles[roles[i]][account]) return false;
        }
        return true;
    }

    function getAllManagerRoles() external pure override returns (bytes32[] memory) {
        return ATKSystemRoles.getAllManagerRoles();
    }

    function getAllModuleRoles() external pure override returns (bytes32[] memory) {
        return ATKSystemRoles.getAllModuleRoles();
    }

    function checkRoles(
        address account,
        bytes32 managerRole,
        bytes32[] memory moduleRoles
    )
        external
        view
        override
        returns (bool hasPermission, bytes32 authorizedRole)
    {
        // Check if account has the manager role
        if (_roles[managerRole][account]) {
            return (true, managerRole);
        }

        // Check if account has any of the module roles
        for (uint256 i = 0; i < moduleRoles.length; i++) {
            if (_roles[moduleRoles[i]][account]) {
                return (true, moduleRoles[i]);
            }
        }

        // No valid role found
        return (false, bytes32(0));
    }
}

contract TestableATKComplianceImplementation is ATKComplianceImplementation {
    constructor(address trustedForwarder) ATKComplianceImplementation(trustedForwarder) { }

    function setSystemAccessManagerForTesting(address systemAccessManager) external {
        _setSystemAccessManager(systemAccessManager);
    }
}

contract ATKComplianceImplementationTest is Test {
    TestableATKComplianceImplementation public implementation;
    TestableATKComplianceImplementation public compliance;
    MockATKToken public token;
    MockedComplianceModule public validModule;
    MockFailingModule public failingModule;
    MockNonCompliantModule public nonCompliantModule;
    MockSystemAccessManager public systemAccessManager;

    address public admin = makeAddr("admin");
    address public bypassListManager = makeAddr("bypassListManager");
    address public unauthorizedUser = makeAddr("unauthorizedUser");
    address public trustedForwarder = address(0x1234);
    address public alice = address(0xa11ce);
    address public bob = address(0xb0b);
    address public charlie = address(0xc4a12e);

    function setUp() public {
        // Deploy mock system access manager
        systemAccessManager = new MockSystemAccessManager();

        // Deploy implementation and use it directly for unit testing
        implementation = new TestableATKComplianceImplementation(trustedForwarder);

        // Deploy as proxy
        address[] memory initialBypassListManagers = new address[](1);
        initialBypassListManagers[0] = admin;
        bytes memory initData = abi.encodeWithSelector(
            ATKComplianceImplementation.initialize.selector,
            admin,
            initialBypassListManagers,
            address(systemAccessManager)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);

        // Access proxy as TestableATKComplianceImplementation
        compliance = TestableATKComplianceImplementation(address(proxy));

        // System access manager is already set during initialization

        // Grant bypass list manager role to bypassListManager through the mock system access manager
        systemAccessManager.grantRole(ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE, bypassListManager);

        // Deploy mock token
        token = new MockATKToken(address(compliance));

        // Deploy mock modules
        validModule = new MockedComplianceModule();
        failingModule = new MockFailingModule("Transfer not allowed", true, false);
        nonCompliantModule = new MockNonCompliantModule();
    }

    function testInitializeCanOnlyBeCalledOnce() public {
        vm.expectRevert();
        address[] memory initialBypassListManagers = new address[](1);
        initialBypassListManagers[0] = admin;
        compliance.initialize(admin, initialBypassListManagers, address(systemAccessManager));
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
        vm.expectRevert(ATKSystemAccessControlled.ZeroAddressNotAllowed.selector);
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

        vm.expectRevert(ATKSystemAccessControlled.ZeroAddressNotAllowed.selector);
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
        vm.prank(bypassListManager);
        vm.expectEmit(true, true, true, true);
        emit IATKCompliance.AddressAddedToBypassList(charlie, bypassListManager);
        IATKCompliance(address(compliance)).addToBypassList(charlie);
        assertTrue(IATKCompliance(address(compliance)).isBypassed(charlie));
    }

    function testAddToBypassListAsUnauthorized() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                unauthorizedUser,
                ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE
            )
        );
        IATKCompliance(address(compliance)).addToBypassList(charlie);
    }

    function testAddAlreadyBypassedAddress() public {
        vm.prank(bypassListManager);
        IATKCompliance(address(compliance)).addToBypassList(charlie);

        vm.prank(bypassListManager);
        vm.expectRevert(abi.encodeWithSelector(IATKCompliance.AddressAlreadyOnBypassList.selector, charlie));
        IATKCompliance(address(compliance)).addToBypassList(charlie);
    }

    function testAddZeroAddressToBypassList() public {
        vm.prank(bypassListManager);
        vm.expectRevert(abi.encodeWithSelector(ATKSystemAccessControlled.ZeroAddressNotAllowed.selector));
        IATKCompliance(address(compliance)).addToBypassList(address(0));
    }

    function testRemoveFromBypassListAsManager() public {
        vm.prank(bypassListManager);
        IATKCompliance(address(compliance)).addToBypassList(charlie);

        vm.prank(bypassListManager);
        vm.expectEmit(true, true, true, true);
        emit IATKCompliance.AddressRemovedFromBypassList(charlie, bypassListManager);
        IATKCompliance(address(compliance)).removeFromBypassList(charlie);
        assertFalse(IATKCompliance(address(compliance)).isBypassed(charlie));
    }

    function testRemoveFromBypassListAsUnauthorized() public {
        vm.prank(bypassListManager);
        IATKCompliance(address(compliance)).addToBypassList(charlie);

        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                unauthorizedUser,
                ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE
            )
        );
        IATKCompliance(address(compliance)).removeFromBypassList(charlie);
    }

    function testRemoveNonBypassedAddress() public {
        vm.prank(bypassListManager);
        vm.expectRevert(abi.encodeWithSelector(IATKCompliance.AddressNotOnBypassList.selector, charlie));
        IATKCompliance(address(compliance)).removeFromBypassList(charlie);
    }

    function testAddMultipleToBypassList() public {
        address[] memory addresses = new address[](2);
        addresses[0] = alice;
        addresses[1] = bob;

        vm.prank(bypassListManager);
        vm.expectEmit(true, true, true, true);
        emit IATKCompliance.AddressAddedToBypassList(alice, bypassListManager);
        vm.expectEmit(true, true, true, true);
        emit IATKCompliance.AddressAddedToBypassList(bob, bypassListManager);

        IATKCompliance(address(compliance)).addMultipleToBypassList(addresses);
        assertTrue(IATKCompliance(address(compliance)).isBypassed(alice));
        assertTrue(IATKCompliance(address(compliance)).isBypassed(bob));
    }

    function testRemoveMultipleFromBypassList() public {
        address[] memory addresses = new address[](2);
        addresses[0] = alice;
        addresses[1] = bob;

        vm.prank(bypassListManager);
        IATKCompliance(address(compliance)).addMultipleToBypassList(addresses);

        vm.prank(bypassListManager);
        vm.expectEmit(true, true, true, true);
        emit IATKCompliance.AddressRemovedFromBypassList(alice, bypassListManager);
        vm.expectEmit(true, true, true, true);
        emit IATKCompliance.AddressRemovedFromBypassList(bob, bypassListManager);

        IATKCompliance(address(compliance)).removeMultipleFromBypassList(addresses);
        assertFalse(IATKCompliance(address(compliance)).isBypassed(alice));
        assertFalse(IATKCompliance(address(compliance)).isBypassed(bob));
    }

    function testCanTransferToBypassedAddress() public {
        // Add a failing module to ensure canTransfer would normally fail
        token.addModule(address(failingModule), "");

        // Add bob to the bypass list
        vm.prank(bypassListManager);
        IATKCompliance(address(compliance)).addToBypassList(bob);

        // Transfer should succeed because bob is on the bypass list
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
    }

    function testCanTransferFromBypassedAddress() public {
        // Add a failing module to ensure canTransfer would normally fail
        token.addModule(address(failingModule), "");

        // Add alice to the bypass list
        vm.prank(bypassListManager);
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
        vm.prank(bypassListManager);
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
        vm.prank(bypassListManager);
        IATKCompliance(address(compliance)).addToBypassList(bob);

        // Should succeed despite multiple failing modules
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
    }

    function testCanTransferAllowListedMintOperation() public {
        // Add failing module
        token.addModule(address(failingModule), abi.encode(uint256(100)));

        // AllowList receiver for mint (from = address(0))
        vm.prank(bypassListManager);
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
        vm.prank(bypassListManager);
        IATKCompliance(address(compliance)).addToBypassList(bob);

        // Measure gas - should be much lower due to early return
        uint256 gasBefore = gasleft();
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
        uint256 gasUsedAllowListed = gasBefore - gasleft();

        // Remove from allow list and measure gas for normal flow
        vm.prank(bypassListManager);
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

        vm.prank(bypassListManager);
        IATKCompliance(address(compliance)).addToBypassList(account);

        assertTrue(IATKCompliance(address(compliance)).isBypassed(account));
    }

    function testFuzzAllowListCanTransfer(address receiver, uint256 amount) public {
        vm.assume(receiver != address(0));

        // Add failing module
        token.addModule(address(failingModule), abi.encode(uint256(100)));

        // AllowList receiver
        vm.prank(bypassListManager);
        IATKCompliance(address(compliance)).addToBypassList(receiver);

        // Should always succeed with allow listed receiver
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, receiver, amount));
    }

    // --- Integration tests ---

    function testAllowListIntegrationWithTransferredCallback() public {
        // Add valid module to track calls
        token.addModule(address(validModule), abi.encode(uint256(100)));

        // AllowList receiver
        vm.prank(bypassListManager);
        IATKCompliance(address(compliance)).addToBypassList(bob);

        // Even with allow listed receiver, transferred callback should still work
        vm.prank(address(token));
        ISMARTCompliance(address(compliance)).transferred(address(token), alice, bob, 100);

        // Verify module was called
        assertEq(validModule.transferredCallCount(), 1);
    }
}
