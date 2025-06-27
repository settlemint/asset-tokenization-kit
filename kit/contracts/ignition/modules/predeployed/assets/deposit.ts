import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from '../forwarder';

const DepositModule = buildModule('DepositModule', (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const depositFactoryImplementation = m.contract(
    'ATKDepositFactoryImplementation',
    [forwarder]
  );
  const depositImplementation = m.contract('ATKDepositImplementation', [
    forwarder,
  ]);

  return { depositFactoryImplementation, depositImplementation };
});

export default DepositModule;
