// SPDX-License-Identifier: MIT
// SettleMint.com
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const XvPSettlementFactoryModule = buildModule(
  "XvPSettlementFactoryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);
    const xvpSettlementFactory = m.contract("XvPSettlementFactory", [
      "0x5e771e1417100000000000000000000000000099",
    ]);

    return { xvpSettlementFactory };
  }
);

export default XvPSettlementFactoryModule;
