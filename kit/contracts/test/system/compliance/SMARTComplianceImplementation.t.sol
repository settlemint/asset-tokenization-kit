// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { console2 } from "forge-std/console2.sol";

import { SMARTComplianceImplementation } from "../../../contracts/system/compliance/SMARTComplianceImplementation.sol";
import { SMARTComplianceProxy } from "../../../contracts/system/compliance/SMARTComplianceProxy.sol";
import { ISMARTCompliance } from "../../../contracts/interface/ISMARTCompliance.sol";
import { ISMARTComplianceModule } from "../../../contracts/interface/ISMARTComplianceModule.sol";
import { ISMARTComplianceWhitelist } from "../../../contracts/system/compliance/ISMARTComplianceWhitelist.sol";
import { ISMART } from "../../../contracts/interface/ISMART.sol";
import { SMARTComplianceModuleParamPair } from "../../../contracts/interface/structs/SMARTComplianceModuleParamPair.sol";
import { SMARTSystemRoles } from "../../../contracts/system/SMARTSystemRoles.sol";

import { MockedComplianceModule } from "../../utils/mocks/MockedComplianceModule.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

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
    address public whitelistManager = makeAddr("whitelistManager");
    address public unauthorizedUser = makeAddr("unauthorizedUser");
    address public trustedForwarder = address(0x1234);
    address public alice = address(0xa11ce);
    address public bob = address(0xb0b);
    address public charlie = address(0xc4a12e);

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

        // Grant whitelist manager role
        vm.prank(admin);
        compliance.grantRole(SMARTSystemRoles.WHITELIST_MANAGER_ROLE, whitelistManager);

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
        assertTrue(compliance.supportsInterface(type(ISMARTComplianceWhitelist).interfaceId));
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

    // --- Whitelist Management Tests ---

    function testAddToWhitelistSuccess() public {
        vm.prank(whitelistManager);
        vm.expectEmit(true, true, false, true);
        emit ISMARTComplianceWhitelist.AddressWhitelisted(alice, whitelistManager);
        compliance.addToWhitelist(alice);

        assertTrue(compliance.isWhitelisted(alice));
    }

    function testAddToWhitelistUnauthorized() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                unauthorizedUser,
                SMARTSystemRoles.WHITELIST_MANAGER_ROLE
            )
        );
        compliance.addToWhitelist(alice);
    }

    function testAddToWhitelistZeroAddress() public {
        vm.prank(whitelistManager);
        vm.expectRevert(ISMARTCompliance.ZeroAddressNotAllowed.selector);
        compliance.addToWhitelist(address(0));
    }

    function testAddToWhitelistAlreadyWhitelisted() public {
        vm.prank(whitelistManager);
        compliance.addToWhitelist(alice);

        vm.prank(whitelistManager);
        vm.expectRevert(abi.encodeWithSelector(ISMARTComplianceWhitelist.AddressAlreadyWhitelisted.selector, alice));
        compliance.addToWhitelist(alice);
    }

    function testRemoveFromWhitelistSuccess() public {
        // First add to whitelist
        vm.prank(whitelistManager);
        compliance.addToWhitelist(alice);
        assertTrue(compliance.isWhitelisted(alice));

        // Then remove
        vm.prank(whitelistManager);
        vm.expectEmit(true, true, false, true);
        emit ISMARTComplianceWhitelist.AddressRemovedFromWhitelist(alice, whitelistManager);
        compliance.removeFromWhitelist(alice);

        assertFalse(compliance.isWhitelisted(alice));
    }

    function testRemoveFromWhitelistUnauthorized() public {
        vm.prank(whitelistManager);
        compliance.addToWhitelist(alice);

        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                unauthorizedUser,
                SMARTSystemRoles.WHITELIST_MANAGER_ROLE
            )
        );
        compliance.removeFromWhitelist(alice);
    }

    function testRemoveFromWhitelistNotWhitelisted() public {
        vm.prank(whitelistManager);
        vm.expectRevert(abi.encodeWithSelector(ISMARTComplianceWhitelist.AddressNotWhitelisted.selector, alice));
        compliance.removeFromWhitelist(alice);
    }

    function testAddMultipleToWhitelistSuccess() public {
        address[] memory accounts = new address[](3);
        accounts[0] = alice;
        accounts[1] = bob;
        accounts[2] = charlie;

        vm.prank(whitelistManager);
        for (uint256 i = 0; i < accounts.length; i++) {
            vm.expectEmit(true, true, false, true);
            emit ISMARTComplianceWhitelist.AddressWhitelisted(accounts[i], whitelistManager);
        }
        compliance.addMultipleToWhitelist(accounts);

        assertTrue(compliance.isWhitelisted(alice));
        assertTrue(compliance.isWhitelisted(bob));
        assertTrue(compliance.isWhitelisted(charlie));
    }

    function testAddMultipleToWhitelistWithZeroAddress() public {
        address[] memory accounts = new address[](3);
        accounts[0] = alice;
        accounts[1] = address(0); // Zero address
        accounts[2] = charlie;

        vm.prank(whitelistManager);
        vm.expectRevert(ISMARTCompliance.ZeroAddressNotAllowed.selector);
        compliance.addMultipleToWhitelist(accounts);

        // None should be whitelisted due to revert
        assertFalse(compliance.isWhitelisted(alice));
        assertFalse(compliance.isWhitelisted(charlie));
    }

    function testAddMultipleToWhitelistWithDuplicate() public {
        // First add alice
        vm.prank(whitelistManager);
        compliance.addToWhitelist(alice);

        address[] memory accounts = new address[](3);
        accounts[0] = bob;
        accounts[1] = alice; // Already whitelisted
        accounts[2] = charlie;

        vm.prank(whitelistManager);
        vm.expectRevert(abi.encodeWithSelector(ISMARTComplianceWhitelist.AddressAlreadyWhitelisted.selector, alice));
        compliance.addMultipleToWhitelist(accounts);

        // Bob should not be whitelisted due to revert
        assertFalse(compliance.isWhitelisted(bob));
        assertFalse(compliance.isWhitelisted(charlie));
    }

    function testRemoveMultipleFromWhitelistSuccess() public {
        // First add all to whitelist
        address[] memory accounts = new address[](3);
        accounts[0] = alice;
        accounts[1] = bob;
        accounts[2] = charlie;

        vm.prank(whitelistManager);
        compliance.addMultipleToWhitelist(accounts);

        // Then remove all
        vm.prank(whitelistManager);
        for (uint256 i = 0; i < accounts.length; i++) {
            vm.expectEmit(true, true, false, true);
            emit ISMARTComplianceWhitelist.AddressRemovedFromWhitelist(accounts[i], whitelistManager);
        }
        compliance.removeMultipleFromWhitelist(accounts);

        assertFalse(compliance.isWhitelisted(alice));
        assertFalse(compliance.isWhitelisted(bob));
        assertFalse(compliance.isWhitelisted(charlie));
    }

    function testRemoveMultipleFromWhitelistWithNotWhitelisted() public {
        // Only add alice to whitelist
        vm.prank(whitelistManager);
        compliance.addToWhitelist(alice);

        address[] memory accounts = new address[](3);
        accounts[0] = alice;
        accounts[1] = bob; // Not whitelisted
        accounts[2] = charlie;

        vm.prank(whitelistManager);
        vm.expectRevert(abi.encodeWithSelector(ISMARTComplianceWhitelist.AddressNotWhitelisted.selector, bob));
        compliance.removeMultipleFromWhitelist(accounts);

        // Alice should still be whitelisted due to revert
        assertTrue(compliance.isWhitelisted(alice));
    }

    function testIsWhitelistedInitiallyFalse() public view {
        assertFalse(compliance.isWhitelisted(alice));
        assertFalse(compliance.isWhitelisted(bob));
        assertFalse(compliance.isWhitelisted(address(0)));
    }

    // --- Whitelist Effect on canTransfer Tests ---

    function testCanTransferWithWhitelistedReceiver() public {
        // Add failing module that would normally prevent transfers
        token.addModule(address(failingModule), abi.encode(uint256(100)));

        // Whitelist the receiver
        vm.prank(whitelistManager);
        compliance.addToWhitelist(bob);

        // Transfer should succeed despite failing module because receiver is whitelisted
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
    }

    function testCanTransferWithNonWhitelistedReceiver() public {
        // Add failing module
        token.addModule(address(failingModule), abi.encode(uint256(100)));

        // Don't whitelist receiver - should fail due to failing module
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Transfer not allowed")
        );
        ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100);
    }

    function testCanTransferWhitelistBypassesAllModules() public {
        // Add multiple failing modules
        MockFailingModule failingModule2 = new MockFailingModule("Another failure", true, false);
        token.addModule(address(failingModule), abi.encode(uint256(100)));
        token.addModule(address(failingModule2), abi.encode(uint256(200)));

        // Whitelist receiver
        vm.prank(whitelistManager);
        compliance.addToWhitelist(bob);

        // Should succeed despite multiple failing modules
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
    }

    function testCanTransferWhitelistedMintOperation() public {
        // Add failing module
        token.addModule(address(failingModule), abi.encode(uint256(100)));

        // Whitelist receiver for mint (from = address(0))
        vm.prank(whitelistManager);
        compliance.addToWhitelist(alice);

        // Mint should succeed despite failing module
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), address(0), alice, 1000));
    }

    function testCanTransferNonWhitelistedSenderStillChecked() public {
        // Add a valid module (allows transfers)
        token.addModule(address(validModule), abi.encode(uint256(100)));

        // Don't whitelist anyone - should use normal compliance flow
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
    }

    // --- Gas optimization tests for whitelist ---

    function testWhitelistGasOptimization() public {
        // Add many modules
        for (uint256 i = 0; i < 5; i++) {
            MockedComplianceModule module = new MockedComplianceModule();
            token.addModule(address(module), abi.encode(i * 100));
        }

        // Whitelist receiver
        vm.prank(whitelistManager);
        compliance.addToWhitelist(bob);

        // Measure gas - should be much lower due to early return
        uint256 gasBefore = gasleft();
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
        uint256 gasUsedWhitelisted = gasBefore - gasleft();

        // Remove from whitelist and measure gas for normal flow
        vm.prank(whitelistManager);
        compliance.removeFromWhitelist(bob);

        gasBefore = gasleft();
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, bob, 100));
        uint256 gasUsedNormal = gasBefore - gasleft();

        console2.log("Gas used with whitelisted receiver:", gasUsedWhitelisted);
        console2.log("Gas used with normal flow:", gasUsedNormal);

        // Whitelisted should use significantly less gas
        assertLt(gasUsedWhitelisted, gasUsedNormal);
    }

    // --- Fuzz tests for whitelist ---

    function testFuzzAddToWhitelist(address account) public {
        vm.assume(account != address(0));

        vm.prank(whitelistManager);
        compliance.addToWhitelist(account);

        assertTrue(compliance.isWhitelisted(account));
    }

    function testFuzzWhitelistCanTransfer(address receiver, uint256 amount) public {
        vm.assume(receiver != address(0));

        // Add failing module
        token.addModule(address(failingModule), abi.encode(uint256(100)));

        // Whitelist receiver
        vm.prank(whitelistManager);
        compliance.addToWhitelist(receiver);

        // Should always succeed with whitelisted receiver
        assertTrue(ISMARTCompliance(address(compliance)).canTransfer(address(token), alice, receiver, amount));
    }

    // --- Integration tests ---

    function testWhitelistIntegrationWithTransferredCallback() public {
        // Add valid module to track calls
        token.addModule(address(validModule), abi.encode(uint256(100)));

        // Whitelist receiver
        vm.prank(whitelistManager);
        compliance.addToWhitelist(bob);

        // Even with whitelisted receiver, transferred callback should still work
        vm.prank(address(token));
        ISMARTCompliance(address(compliance)).transferred(address(token), alice, bob, 100);

        // Verify module was called
        assertEq(validModule.transferredCallCount(), 1);
    }
}
