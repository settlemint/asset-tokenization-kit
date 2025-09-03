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

    // Get the system access manager address from the bootstrap event
    const systemAccessManagerAddress = m.readEventArgument(
      createSystem,
      "ATKSystemCreated",
      "accessManager",
      { id: "accessManagerAddress" }
    );

    const systemAccessManager = m.contractAt(
      "IATKSystemAccessManager",
      systemAccessManagerAddress,
      { id: "systemAccessManager" }
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
      "ATKSystemTrustedIssuersRegistryImplementation",
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
      systemAccessManager,
    };
  }
);

export default ATKOnboardingSystemModule;
