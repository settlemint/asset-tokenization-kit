import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import TokenRegistryModule from "../implementations/token-registry";
import AssetTokenizationOnboardingModule from "../onboarding";

const DepositModule = buildModule("DepositModule", (m) => {
  const {
    forwarder,
    deploymentRegistry,
    identityRegistryStorage,
    trustedIssuersRegistry,
    compliance,
    identityRegistry,
    identityFactory,
  } = m.useModule(AssetTokenizationOnboardingModule);

  const deployer = m.getAccount(0);

  const eurd = m.contract("SMARTDeposit", [
    "Euro",
    "EURD",
    6,
    [1, 2],
    [],
    identityRegistry,
    compliance,
    forwarder,
  ]);

  const createIdentity = m.call(identityFactory, "createTokenIdentity", [
    eurd,
    deployer,
  ]);
  const identityAddress = m.readEventArgument(
    createIdentity,
    "TokenIdentityCreated",
    "identity",
    {
      id: "readIdentityAddress",
    }
  );

  m.call(eurd, "setOnchainID", [identityAddress]);

  const { tokenRegistry } = m.useModule(TokenRegistryModule);

  m.call(tokenRegistry, "registerToken", [eurd]);

  return { eurd };
});

export default DepositModule;
