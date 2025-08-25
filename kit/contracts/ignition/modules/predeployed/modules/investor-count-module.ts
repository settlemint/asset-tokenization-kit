import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../forwarder";

const InvestorCountModule = buildModule("InvestorCountModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const investorCountModule = m.contract("InvestorCountComplianceModule", [
    forwarder,
  ]);

  return { investorCountModule };
});

export default InvestorCountModule;
