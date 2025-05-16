import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const IdentityModule = buildModule("IdentityModule", (m) => {
  const identity = m.contract("ATKIdentityImplementation");
  const tokenIdentity = m.contract("ATKTokenIdentityImplementation");

  return { identity, tokenIdentity };
});

export default IdentityModule;
