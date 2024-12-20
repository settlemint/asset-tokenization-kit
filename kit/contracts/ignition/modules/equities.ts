import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import EquityFactoryModule from './equity-factory';

const EquitiesModule = buildModule('EquitiesModule', (m) => {
  const { equityFactory } = m.useModule(EquityFactoryModule);

  const equityClass = 'Common Stock';
  const equityCategory = 'Technology';
  const createAPPL = m.call(equityFactory, 'create', ['Apple Inc.', 'AAPL', equityClass, equityCategory], {
    id: 'createAPPL',
  });
  const readAPPLAddress = m.readEventArgument(createAPPL, 'EquityCreated', 'token', { id: 'readAPPLAddress' });
  const aapl = m.contractAt('Equity', readAPPLAddress, { id: 'aapl' });

  return { aapl };
});

export default EquitiesModule;
