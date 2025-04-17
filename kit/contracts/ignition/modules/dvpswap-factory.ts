// SPDX-License-Identifier: MIT
// SettleMint.com
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const DvPSwapFactoryModule = buildModule("DvPSwapFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const dvpSwapFactory = m.contract("DvPSwapFactory", [forwarder]);

  return { dvpSwapFactory };
});

export default DvPSwapFactoryModule; 