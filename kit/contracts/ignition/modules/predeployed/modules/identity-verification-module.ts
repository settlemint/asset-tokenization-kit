import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../forwarder";

const IdentityVerificationModule = buildModule(
  "IdentityVerificationModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const identityVerificationModule = m.contract(
      "SMARTIdentityVerificationModule",
      [forwarder]
    );

    return { identityVerificationModule };
  }
);

export default IdentityVerificationModule;
