import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../main";
import ForwarderModule from "../predeployed/forwarder";

const ATKOnboardingSystemModule = buildModule(
  "ATKOnboardingSystemModule",
  (m) => {
    const { systemFactory } = m.useModule(ATKModule);

    const createSystem = m.call(systemFactory, "createSystem");
    const systemAddress = m.readEventArgument(
      createSystem,
      "ATKSystemCreated",
      "systemAddress",
      { id: "systemAddress" }
    );
    const system = m.contractAt("IATKSystem", systemAddress, {
      id: "system",
    });

    const bootstrap = m.call(system, "bootstrap");

    const complianceAddress = m.readEventArgument(
      bootstrap,
      "Bootstrapped",
      "complianceProxy",
      { id: "complianceAddress" }
    );

    const compliance = m.contractAt("ISMARTCompliance", complianceAddress, {
      id: "compliance",
    });

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
      "IERC3643IdentityRegistryStorage", // TODO this will change with next PR
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
      "IERC3643TrustedIssuersRegistry",
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
      "ISMARTTopicSchemeRegistry",
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

    const { forwarder } = m.useModule(ForwarderModule);
    // For now do it this way, will be integrated into system completely
    const fixedYieldScheduleFactory = m.contract(
      "ATKFixedYieldScheduleFactory",
      [system.address, forwarder]
    );

    return {
      system,
      compliance,
      identityRegistry,
      identityRegistryStorage,
      trustedIssuersRegistry,
      topicSchemeRegistry,
      identityFactory,
      fixedYieldScheduleFactory,
    };
  }
);

export default ATKOnboardingSystemModule;
