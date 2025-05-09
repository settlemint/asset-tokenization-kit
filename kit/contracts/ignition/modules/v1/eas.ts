import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../implementations/forwarder";

const EASModule = buildModule("EASModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const schemaRegistry = m.contract(
    "contracts/EASSchemaRegistry.sol:EASSchemaRegistry",
    [forwarder]
  );

  const eas = m.contract("contracts/EAS.sol:EAS", [schemaRegistry, forwarder]);

  return { schemaRegistry, eas };
});

export default EASModule;
