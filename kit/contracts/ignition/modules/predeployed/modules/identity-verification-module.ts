import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../forwarder";

const IdentityVerificationModule = buildModule(
  "IdentityVerificationModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const identityVerificationModule = m.contract(
      "SMARTIdentityVerificationComplianceModule",
      [forwarder]
    );

    return { identityVerificationModule };
  }
);

export default IdentityVerificationModule;
