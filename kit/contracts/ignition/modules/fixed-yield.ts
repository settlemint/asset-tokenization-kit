import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const FixedYieldModule = buildModule("FixedYieldModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const fixedYield = m.contract("FixedYield", [
    m.getParameter("token"),
    m.getParameter("owner"),
    m.getParameter("startDate"),
    m.getParameter("endDate"),
    m.getParameter("rate"),
    m.getParameter("interval"),
    forwarder,
  ]);

  return { fixedYield };
});

export default FixedYieldModule;
