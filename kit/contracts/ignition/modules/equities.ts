import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import EquityFactoryModule from './equity-factory';

const EquitiesModule = buildModule('EquitiesModule', (m) => {
  const { equityFactory } = m.useModule(EquityFactoryModule);

  const totalSupply = '16000000000000000000000000000'; // 16B shares with 18 decimals
  const pricePerShare = '180000000000000000000'; // $180 with 18 decimals
  const createAPPL = m.call(equityFactory, 'create', ['Apple Inc.', 'AAPL', totalSupply, pricePerShare], {
    id: 'createAPPL',
  });
  const readAPPLAddress = m.readEventArgument(createAPPL, 'EquityCreated', 'token', { id: 'readAPPLAddress' });
  const aapl = m.contractAt('Equity', readAPPLAddress, { id: 'aapl' });

  return { aapl };
});

export default EquitiesModule;
