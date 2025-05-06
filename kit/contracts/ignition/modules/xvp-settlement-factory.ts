// SPDX-License-Identifier: MIT
// SettleMint.com
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const XvPSettlementFactoryModule = buildModule(
  "XvPSettlementFactoryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);
    const xvpSettlementFactory = m.contract("XvPSettlementFactory", [
      forwarder,
    ]);

    return { xvpSettlementFactory };
  }
);

export default XvPSettlementFactoryModule;
