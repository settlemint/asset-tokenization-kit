import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../forwarder";

const TokenSupplyLimitModule = buildModule("TokenSupplyLimitModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const tokenSupplyLimitModule = m.contract(
    "TokenSupplyLimitComplianceModule",
    [forwarder]
  );

  return { tokenSupplyLimitModule };
});

export default TokenSupplyLimitModule;
