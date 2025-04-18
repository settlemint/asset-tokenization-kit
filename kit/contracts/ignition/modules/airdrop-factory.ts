import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AirdropFactoryModule = buildModule("AirdropFactoryModule", (m) => {
  // AirdropFactory has no constructor arguments
  const airdropFactory = m.contract("AirdropFactory");

  return { airdropFactory };
});

export default AirdropFactoryModule;
