
## CoinExams Enterprise - Change Log

### v1.3.6
`portfolioTradingTotals` added to calculate portfolio trading totals per coinSet

* `ExchSupported` exported as const array of supported exchanges
* `PortfolioCoinSetTrading`, `PortfolioCoinSetTradingData` types exported

### v1.3.1
`portfolioTradesPrices` added to return trades with coin prices and rates

 * `currency_not_supported` error code added when currency ISO is invalid or unavailable
 * `prices_unavailable` error code added when coin prices data is not available from server
* `ServerResponseData`, `ServerCoinData`, `ExchDataAllPrices` types exported

### v1.3.0
`payRPC` in `config` accepts array of RPCs to be used in same order (if any fails)

### v1.2.8
`ChainIds` and `ChainIdsEnum` exported

### v1.2.6
`portfoliosActive` added to `accountInfo` returns active portfolios count

### v1.2.2 
`coinSetsAllBackTest` added to return all coinsets with backtests

### v1.2.0 
`coinSetBackTest` added to return coinset backtest

### v1.1.8 
`payPortfolioValid` updated to return all payment data

* `Payment` interface is returned with `qty` among other payment details

### v1.1.7 
`payPortfolio` updated to allow optional quantity parameter

* `quantity` Optional for number of monthly subscriptions 

### v1.1.6 
`portSettings` updated to include:

* `keyIds` indicating exchanges with working APIs
* `paid` indicating paid until time in ms

### v1.1.4
`ExchData` updated to carry data for all exchanges related to a given portfolio

* `holdings` now has object of exchanges Ids and their holdings or errors
* `trades` now has object of exchanges Ids and respective trades

### v1.0.8
`ExchIds` type has been updated to follow `ccxt` unified exchanges standard

* Example `bin` has to be updated to `binance`

Currently, we have a fallback for legacy implementations but this to be removed in the future.