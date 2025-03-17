import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const TokenizedDepositFactoryModule = buildModule(
  "TokenizedDepositFactoryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);
    const tokenizedDepositFactory = m.contract("TokenizedDepositFactory", [
      forwarder,
    ]);

    return { tokenizedDepositFactory };
  }
);

export default TokenizedDepositFactoryModule;
