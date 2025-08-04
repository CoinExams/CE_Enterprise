
## CoinExams Enterprise - Change Log

### 4 August 2025
`portfoliosActive` added to `accountInfo` returns active portfolios count

### 23 June 2025 
`coinSetsAllBackTest` added to return all coinsets with backtests

### 22 June 2025 
`coinSetBackTest` added to return coinset backtest

### 5 May 2025 
`payPortfolioValid` updated to return all payment data

* `Payment` interface is returned with `qty` among other payment details

### 25 April 2025 
`payPortfolio` updated to allow optional quantity parameter

* `quantity` Optional for number of monthly subscriptions 

### 21 April 2025 
`portSettings` updated to include:

* `keyIds` indicating exchanges with working APIs
* `paid` indicating paid until time in ms

### 15 April 2025 
`ExchData` updated to carry data for all exchanges related to a given portfolio

* `holdings` now has object of exchanges Ids and their holdings or errors
* `trades` now has object of exchanges Ids and respective trades

### 5 April 2025
`ExchIds` type has been updated to follow `ccxt` unified exchanges standard

* Example `bin` has to be updated to `binance`

Currently, we have a fallback for legacy implementations but this to be removed in the future.