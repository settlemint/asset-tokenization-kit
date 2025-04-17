import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const EASModule = buildModule("EASModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const easSchemaRegistry = m.contract("EASSchemaRegistry", [forwarder]);
  const eas = m.contract("EAS", [easSchemaRegistry, forwarder]);
  const easIndexer = m.contract("EASIndexer", [eas, forwarder]);

  return { easSchemaRegistry, eas, easIndexer };
});

export default EASModule;
