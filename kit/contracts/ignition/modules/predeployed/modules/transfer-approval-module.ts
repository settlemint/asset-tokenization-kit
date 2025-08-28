import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../forwarder";

const TransferApprovalModule = buildModule("TransferApprovalModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const transferApprovalModule = m.contract("TransferApprovalComplianceModule", [
    forwarder,
  ]);

  return { transferApprovalModule };
});

export default TransferApprovalModule;