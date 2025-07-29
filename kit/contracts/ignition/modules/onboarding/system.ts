import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../main";

const ATKOnboardingSystemModule = buildModule(
  "ATKOnboardingSystemModule",
  (m) => {
    const { systemFactory } = m.useModule(ATKModule);

    const createSystem = m.call(systemFactory, "createSystem", [], {
      from: m.getAccount(0),
    });
    const systemAddress = m.readEventArgument(
      createSystem,
      "ATKSystemCreated",
      "systemAddress",
      { id: "systemAddress" }
    );
    const system = m.contractAt("IATKSystem", systemAddress, {
      id: "system",
    });

    const bootstrap = m.call(system, "bootstrap", [], {
      from: m.getAccount(0),
    });

    const complianceAddress = m.readEventArgument(
      bootstrap,
      "Bootstrapped",
      "complianceProxy",
      { id: "complianceAddress" }
    );

    const compliance = m.contractAt(
      "ATKComplianceImplementation",
      complianceAddress,
      {
        id: "compliance",
      }
    );

    const identityRegistryAddress = m.readEventArgument(
      bootstrap,
      "Bootstrapped",
      "identityRegistryProxy",
      { id: "identityRegistryAddress" }
    );

    const identityRegistry = m.contractAt(
      "ISMARTIdentityRegistry",
      identityRegistryAddress,
      { id: "identityRegistry" }
    );

    const identityRegistryStorageAddress = m.readEventArgument(
      bootstrap,
      "Bootstrapped",
      "identityRegistryStorageProxy",
      { id: "identityRegistryStorageAddress" }
    );

    const identityRegistryStorage = m.contractAt(
      "ATKIdentityRegistryStorageImplementation",
      identityRegistryStorageAddress,
      { id: "identityRegistryStorage" }
    );

    const trustedIssuersRegistryAddress = m.readEventArgument(
      bootstrap,
      "Bootstrapped",
      "trustedIssuersRegistryProxy",
      { id: "trustedIssuersRegistryAddress" }
    );

    const trustedIssuersRegistry = m.contractAt(
      "ATKTrustedIssuersRegistryImplementation",
      trustedIssuersRegistryAddress,
      { id: "trustedIssuersRegistry" }
    );

    const topicSchemeRegistryAddress = m.readEventArgument(
      bootstrap,
      "Bootstrapped",
      "topicSchemeRegistryProxy",
      { id: "topicSchemeRegistryAddress" }
    );

    const topicSchemeRegistry = m.contractAt(
      "ATKTopicSchemeRegistryImplementation",
      topicSchemeRegistryAddress,
      { id: "topicSchemeRegistry" }
    );

    const identityFactoryAddress = m.readEventArgument(
      bootstrap,
      "Bootstrapped",
      "identityFactoryProxy",
      { id: "identityFactoryAddress" }
    );

    const identityFactory = m.contractAt(
      "IATKIdentityFactory",
      identityFactoryAddress,
      { id: "identityFactory" }
    );

    const tokenFactoryRegistryAddress = m.readEventArgument(
      bootstrap,
      "Bootstrapped",
      "tokenFactoryRegistryProxy",
      { id: "tokenFactoryRegistryAddress" }
    );

    const tokenFactoryRegistry = m.contractAt(
      "IATKTokenFactoryRegistry",
      tokenFactoryRegistryAddress,
      { id: "tokenFactoryRegistry" }
    );

    const complianceModuleRegistryAddress = m.readEventArgument(
      bootstrap,
      "Bootstrapped",
      "complianceModuleRegistryProxy",
      { id: "complianceModuleRegistryAddress" }
    );

    const complianceModuleRegistry = m.contractAt(
      "IATKComplianceModuleRegistry",
      complianceModuleRegistryAddress,
      { id: "complianceModuleRegistry" }
    );

    const systemAddonRegistryAddress = m.readEventArgument(
      bootstrap,
      "Bootstrapped",
      "systemAddonRegistryProxy",
      { id: "systemAddonRegistryAddress" }
    );

    const systemAddonRegistry = m.contractAt(
      "IATKSystemAddonRegistry",
      systemAddonRegistryAddress,
      { id: "systemAddonRegistry" }
    );

    // Get the system access manager address from the bootstrap event
    const systemAccessManagerAddress = m.readEventArgument(
      bootstrap,
      "Bootstrapped",
      "systemAccessManagerProxy",
      { id: "systemAccessManagerAddress" }
    );

    const systemAccessManager = m.contractAt(
      "IATKSystemAccessManager",
      systemAccessManagerAddress,
      { id: "systemAccessManager" }
    );

    // Grant necessary roles to system registries in the system access manager
    // The registries need admin permissions to grant roles to the factories they create
    const grantTokenFactoryRegistryAdminRole = m.call(
      systemAccessManager,
      "grantRole",
      [
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        tokenFactoryRegistryAddress,
      ], // DEFAULT_ADMIN_ROLE
      {
        from: m.getAccount(0),
        id: "grantTokenFactoryRegistryAdminRole",
      }
    );

    const grantSystemAddonRegistryAdminRole = m.call(
      systemAccessManager,
      "grantRole",
      [
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        systemAddonRegistryAddress,
      ], // DEFAULT_ADMIN_ROLE
      {
        from: m.getAccount(0),
        id: "grantSystemAddonRegistryAdminRole",
      }
    );

    // Grant SYSTEM_MODULE_ROLE to system registries so factories they create can access compliance
    // Token factories and addon factories need to add addresses to compliance bypass lists
    const grantTokenFactoryRegistrySystemModuleRole = m.call(
      systemAccessManager,
      "grantRole",
      [
        "0xa6d0d666130ddda8d0a25bfc08c75c789806b23845f9cce674dfc4a9e8d0e45c",
        tokenFactoryRegistryAddress,
      ], // SYSTEM_MODULE_ROLE
      {
        from: m.getAccount(0),
        id: "grantTokenFactoryRegistrySystemModuleRole",
      }
    );

    const grantSystemAddonRegistrySystemModuleRole = m.call(
      systemAccessManager,
      "grantRole",
      [
        "0xa6d0d666130ddda8d0a25bfc08c75c789806b23845f9cce674dfc4a9e8d0e45c",
        systemAddonRegistryAddress,
      ], // SYSTEM_MODULE_ROLE
      {
        from: m.getAccount(0),
        id: "grantSystemAddonRegistrySystemModuleRole",
      }
    );

    // Grant REGISTRAR_ROLE to m.getAccount(0) on the system access manager
    // This is required to call registerTokenFactory
    const grantRegistrarRoleToDeployer = m.call(
      systemAccessManager,
      "grantRole",
      [
        "0x2cf38baf8b867d91cfcccc0e8d7a429365579f0eb969ff29c0621b271cdeeb64", // REGISTRAR_ROLE
        m.getAccount(0),
      ],
      {
        from: m.getAccount(0),
        id: "grantRegistrarRoleToDeployer",
      }
    );

    // Set the system access manager on contracts that need it
    // This is required for contracts that use onlySystemRoles modifier
    const setComplianceSystemAccessManager = m.call(
      compliance,
      "setSystemAccessManager",
      [systemAccessManagerAddress],
      {
        from: m.getAccount(0),
        id: "setComplianceSystemAccessManager",
      }
    );

    const setTrustedIssuersRegistrySystemAccessManager = m.call(
      trustedIssuersRegistry,
      "setSystemAccessManager",
      [systemAccessManagerAddress],
      {
        from: m.getAccount(0),
        id: "setTrustedIssuersRegistrySystemAccessManager",
      }
    );

    return {
      system,
      compliance,
      identityRegistry,
      identityRegistryStorage,
      trustedIssuersRegistry,
      topicSchemeRegistry,
      identityFactory,
      tokenFactoryRegistry,
      complianceModuleRegistry,
      systemAddonRegistry,
    };
  }
);

export default ATKOnboardingSystemModule;
