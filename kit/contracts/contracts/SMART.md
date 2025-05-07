# Ideas

- Add ERC20Capped to SMART ?
- Add ERC20Yield to SMART ?
- I moved HistoricalBalances to SMART, but now we have ERC20Yield extending ISMARTHistoricalBalances, so we need to make sure that the balanceOfAt and totalSupplyAt functions are correctly implemented. Should Yield also become part of SMART? or should we need to rename Yield to SMARTYield?
- ERC20Votes? Can we do this with HistoricalBalances?
- Should we also register the token registries on the deployment registry?
