import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SmartModule = buildModule("SmartModule", (m) => {
  const deployer = m.getAccount(0);

  const claimTopicsRegistryImpl = m.contract("ClaimTopicsRegistry", [], {
    id: "claimTopicsRegistryImpl",
    from: deployer,
  });
  const identityRegistryImpl = m.contract("IdentityRegistry", [], {
    id: "identityRegistryImpl",
    from: deployer,
  });
  const identityRegistryStorageImpl = m.contract(
    "IdentityRegistryStorage",
    [],
    {
      id: "identityRegistryStorageImpl",
      from: deployer,
    }
  );
  const trustedIssuersRegistryImpl = m.contract("TrustedIssuersRegistry", [], {
    id: "trustedIssuersRegistryImpl",
    from: deployer,
  });
  const modularComplianceImpl = m.contract("ModularCompliance", [], {
    id: "modularComplianceImpl",
    from: deployer,
  });
  const tokenImpl = m.contract("Token", [], {
    id: "tokenImpl",
    from: deployer,
  });

  const tokenImplementationAuthority = m.contract(
    "TREXImplementationAuthority",
    [
      true,
      "0x0000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000",
    ],
    {
      id: "tokenImplementationAuthority",
      from: deployer,
    }
  );

  m.call(
    tokenImplementationAuthority,
    "addAndUseTREXVersion",
    [
      { major: 1, minor: 0, patch: 0 },
      {
        tokenImplementation: tokenImpl,
        ctrImplementation: claimTopicsRegistryImpl,
        irImplementation: identityRegistryImpl,
        irsImplementation: identityRegistryStorageImpl,
        tirImplementation: trustedIssuersRegistryImpl,
        mcImplementation: modularComplianceImpl,
      },
    ],
    {
      id: "addAndUseTREXVersion",
      from: deployer,
    }
  );

  const identity = m.contract("Identity", [deployer, true], {
    id: "identity",
    from: deployer,
  });

  const identityImplementationAuthority = m.contract(
    "ImplementationAuthority",
    [identity],
    {
      id: "identityImplementationAuthority",
      from: deployer,
    }
  );

  const identityFactory = m.contract(
    "IdFactory",
    [identityImplementationAuthority],
    {
      id: "identityFactory",
      from: deployer,
    }
  );

  const factory = m.contract(
    "TREXFactory",
    [tokenImplementationAuthority, identityFactory],
    {
      id: "factory",
      from: deployer,
    }
  );

  m.call(tokenImplementationAuthority, "setTREXFactory", [factory], {
    id: "setTREXFactory",
    from: deployer,
  });

  const tokenImplementationAuthorityFactory = m.contract("IAFactory", [factory], {
    id: "tokenImplementationAuthorityFactory",
    from: deployer,
  });

  m.call(tokenImplementationAuthority, "setIAFactory", [tokenImplementationAuthorityFactory], {
    id: "setIAFactory",
    from: deployer,
  });

  m.call(identityFactory, "addTokenFactory", [factory], {
    id: "addTokenFactory",
    from: deployer,
  });

  const tokenGateway = m.contract("TREXGateway", [factory, true], {
    id: "tokenGateway",
    from: deployer,
  });
  const identityGateway = m.contract("Gateway", [identityFactory, []], {
    id: "identityGateway",
    from: deployer,
  });

  m.call(tokenGateway, "addAgent", [deployer], {
    id: "addAgent",
    from: deployer,
  });

  m.call(factory, "transferOwnership", [tokenGateway], {
    id: "transferOwnershipTokenGateway",
    from: deployer,
  });
  m.call(identityFactory, "transferOwnership", [identityGateway], {
    id: "transferOwnershipIdentityGateway",
    from: deployer,
  });

  return {
    tokenGateway,
    identityGateway,
  };
});

export default SmartModule;
