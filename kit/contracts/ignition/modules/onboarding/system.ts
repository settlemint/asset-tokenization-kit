import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ATKRoles } from "../../../scripts/hardhat/constants/roles";
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
    m.call(
      systemAccessManager,
      "grantRole",
      [ATKRoles.defaultAdminRole, tokenFactoryRegistryAddress],
      {
        from: m.getAccount(0),
        id: "grantTokenFactoryRegistryAdminRole",
      }
    );

    m.call(
      systemAccessManager,
      "grantRole",
      [ATKRoles.defaultAdminRole, systemAddonRegistryAddress],
      {
        from: m.getAccount(0),
        id: "grantSystemAddonRegistryAdminRole",
      }
    );

    // Grant SYSTEM_MODULE_ROLE to system registries so factories they create can access compliance
    // Token factories and addon factories need to add addresses to compliance bypass lists
    m.call(
      systemAccessManager,
      "grantRole",
      [ATKRoles.systemModuleRole, tokenFactoryRegistryAddress],
      {
        from: m.getAccount(0),
        id: "grantTokenFactoryRegistrySystemModuleRole",
      }
    );

    m.call(
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
    m.call(
      systemAccessManager,
      "grantRole",
      [ATKRoles.registrarRole, m.getAccount(0)],
      {
        from: m.getAccount(0),
        id: "grantRegistrarRoleToDeployer",
      }
    );

    // Note: Additional role management should be handled at the application level
    // The registerTokenFactory function requires REGISTRAR_ROLE, SYSTEM_MANAGER_ROLE, or SYSTEM_MODULE_ROLE
    // Roles should be granted to appropriate accounts through a proper governance workflow
    // Hard-coding specific accounts here would not be flexible across environments

    // Set the system access manager on contracts that need it
    // This is required for contracts that use onlySystemRoles modifier
    // Note: We're only setting it for contracts that don't already have it set in the bootstrap function
    m.call(compliance, "setSystemAccessManager", [systemAccessManagerAddress], {
      from: m.getAccount(0),
      id: "setComplianceSystemAccessManager",
    });

    m.call(
      trustedIssuersRegistry,
      "setSystemAccessManager",
      [systemAccessManagerAddress],
      {
        from: m.getAccount(0),
        id: "setTrustedIssuersRegistrySystemAccessManager",
      }
    );

    // Note: We don't need to set system access manager for these registries:
    // - tokenFactoryRegistry: Already set in bootstrap function (line 557)
    // - topicSchemeRegistry: Set during initialization in bootstrap function (line 466)
    // - systemAddonRegistry: Doesn't use onlySystemRoles modifier

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
