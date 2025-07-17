// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../../../contracts/system/identity-registry/ATKIdentityRegistryImplementation.sol";
import "../../../contracts/system/access-manager/ATKSystemAccessManagerImplementation.sol";
import "../../../contracts/system/access-manager/ATKSystemAccessManagerProxy.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// Test basic compilation
contract SimpleCompilationTest is Test {
    function testCompiles() public pure {
        assert(true);
    }
}

// Test ATKSystemAccessManagerImplementation via proxy
contract SystemAccessManagerInitTest is Test {
    address admin;
    address forwarder;
    ATKSystemAccessManagerImplementation accessManagerImplementation;
    ATKSystemAccessManagerImplementation accessManagerProxy;

    function setUp() public {
        admin = makeAddr("admin");
        forwarder = makeAddr("forwarder");
    }

    function testInitialization() public {
        // Deploy implementation
        accessManagerImplementation = new ATKSystemAccessManagerImplementation(forwarder);

        // Create initialization data
        bytes memory initData = abi.encodeWithSelector(ATKSystemAccessManagerImplementation.initialize.selector, admin);

        // Deploy proxy pointing to implementation
        ATKSystemAccessManagerProxy proxy =
            new ATKSystemAccessManagerProxy(address(accessManagerImplementation), initData);

        // Access via proxy
        accessManagerProxy = ATKSystemAccessManagerImplementation(address(proxy));

        // Verify initialization
        assertTrue(accessManagerProxy.hasRole(accessManagerProxy.DEFAULT_ADMIN_ROLE(), admin));
    }
}

// Test ATKIdentityRegistryImplementation via proxy
contract IdentityRegistryInitTest is Test {
    address admin;
    address identityStorage;
    address trustedIssuersRegistry;
    address topicSchemeRegistry;
    address forwarder;
    ATKIdentityRegistryImplementation identityRegistryImplementation;
    ATKIdentityRegistryImplementation identityRegistryProxy;

    function setUp() public {
        admin = makeAddr("admin");
        identityStorage = makeAddr("identityStorage");
        trustedIssuersRegistry = makeAddr("trustedIssuersRegistry");
        topicSchemeRegistry = makeAddr("topicSchemeRegistry");
        forwarder = makeAddr("forwarder");
    }

    function testInitialization() public {
        // Deploy implementation
        identityRegistryImplementation = new ATKIdentityRegistryImplementation(forwarder);

        // Create initialization data
        bytes memory initData = abi.encodeWithSelector(
            ATKIdentityRegistryImplementation.initialize.selector,
            admin,
            identityStorage,
            trustedIssuersRegistry,
            topicSchemeRegistry
        );

        // Deploy proxy pointing to implementation
        ERC1967Proxy proxy = new ERC1967Proxy(address(identityRegistryImplementation), initData);

        // Access via proxy
        identityRegistryProxy = ATKIdentityRegistryImplementation(address(proxy));

        // Verify initialization
        assertTrue(identityRegistryProxy.hasRole(identityRegistryProxy.DEFAULT_ADMIN_ROLE(), admin));
    }
}

// Full test with proxies
contract AccessControlTest is Test {
    address admin;
    address identityStorage;
    address trustedIssuersRegistry;
    address topicSchemeRegistry;
    address forwarder;
    address newStorage;

    ATKSystemAccessManagerImplementation accessManagerImplementation;
    ATKSystemAccessManagerImplementation accessManagerProxy;
    ATKIdentityRegistryImplementation identityRegistryImplementation;
    ATKIdentityRegistryImplementation identityRegistryProxy;

    function setUp() public {
        // Setup mock addresses
        admin = makeAddr("admin");
        identityStorage = makeAddr("identityStorage");
        trustedIssuersRegistry = makeAddr("trustedIssuersRegistry");
        topicSchemeRegistry = makeAddr("topicSchemeRegistry");
        forwarder = makeAddr("forwarder");
        newStorage = makeAddr("newStorage");

        // Deploy and initialize access manager via proxy
        accessManagerImplementation = new ATKSystemAccessManagerImplementation(forwarder);
        bytes memory accessManagerInitData =
            abi.encodeWithSelector(ATKSystemAccessManagerImplementation.initialize.selector, admin);
        ATKSystemAccessManagerProxy accessManagerProxyContract =
            new ATKSystemAccessManagerProxy(address(accessManagerImplementation), accessManagerInitData);
        accessManagerProxy = ATKSystemAccessManagerImplementation(address(accessManagerProxyContract));

        // Deploy and initialize identity registry via proxy
        identityRegistryImplementation = new ATKIdentityRegistryImplementation(forwarder);
        bytes memory identityRegistryInitData = abi.encodeWithSelector(
            ATKIdentityRegistryImplementation.initialize.selector,
            admin,
            identityStorage,
            trustedIssuersRegistry,
            topicSchemeRegistry
        );
        ERC1967Proxy identityRegistryProxyContract =
            new ERC1967Proxy(address(identityRegistryImplementation), identityRegistryInitData);
        identityRegistryProxy = ATKIdentityRegistryImplementation(address(identityRegistryProxyContract));
    }

    function testAccessControl() public {
        // Test that the admin can update the identity storage
        vm.startPrank(admin);
        identityRegistryProxy.setIdentityRegistryStorage(newStorage);
        vm.stopPrank();

        // Test that a non-admin cannot update the identity storage
        address nonAdmin = makeAddr("nonAdmin");
        vm.expectRevert();
        vm.prank(nonAdmin);
        identityRegistryProxy.setIdentityRegistryStorage(makeAddr("someOtherStorage"));
    }
}
