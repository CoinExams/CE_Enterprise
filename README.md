# CoinExams Enterprise
CoinExams Enterprise APIs enable secure management of cryptocurrency portfolios and coin sets via HMAC-authenticated POST requests, with SDKs for Node.js and browser use. Key features include portfolio creation, updates, deletion, exchange API management, payment processing on blockchain (e.g., BSC), and coin set operations with backtesting.

## Docs
[SDK - Raw Setup](docs.md)

## Change Log
[Change Log](changes.md)

## Installation
Install using `yarn add coinexams` or `npm install coinexams` 

OR use in browsers through CDN

`<script src="https://cdn.jsdelivr.net/npm/coinexams@1.2.8/dist/browser/coinexams.min.js"></script>`

## CoinExams API keys
Start by adding API keys using `config({ apiKey, hmacKey })`
Validate current configuration using `getConfig()`

## Debug
Disable console log messages:
`config({ consoleLogEnabled: false })`

## Portfolios
### Portfolios Data
Latest settings for all portfolios `portfolioData(portId)`
Optional `portId` can be omitted to get all portfolios

### Portfolios Trades
Latest trades for all portfolios `portfolioTrades(portId)`
Optional `portId` can be omitted to get all portfolios

Error return `{ e: 'no_trades' | 'access_expired' }`
For `access_expired` please contact support to renew API access

### Portfolio Trades Prices
Latest trades for all portfolios with coin prices converted to a given fiat currency `portfolioTradesPrices({ portId, currencyISO })`
Optional `portId` can be omitted to get all portfolios

Error return `{ e: 'prices_unavailable' | 'currency_not_supported' | 'no_trades' | 'access_expired' }`
Use `EUR` for the base (default) currency

### Portfolio New
Create a new portfolio and get portfolio ID `portfolioNew(portSettings)`
Optional `portSettings` can be omitted to use default settings
Returns new `portId`

### Portfolio Update
Update an existing portfolio using portfolio ID `portfolioUpdate({ portId, portSettings })`
Returns `portId` as confirmation

### Portfolio Exchange APIs
Add or update exchange API keys for a given exchange
`portfolioExchAPI({ portId, exchId, key1, key2 })`
Returns `ExchangeHoldings` as `holdings`

Error return `{ e: 'api_renew' | 'api_invalid' }`
For `api_renew` check exchange for expired API access

### Portfolio Delete
Delete an existing portfolio using portfolio ID `portfolioDelete(portId)`
Returns `portId` as confirmation

### Portfolio Pay Txs
Get payment transactions
```typescript
config({
    // Your Pay Id number as string
    payId: `12345678`,
    
    // Your Pay Chain, e.g. `BSC`
    payChain: ChainIdsEnum.BSC, 
    
    // Your preferred RPC for your pay chain ex. `https://....`
    // multiple RPC urls can be added in an array for fallbacks
    payRPC: string | string[],
});

const 
    quantity: string = "1", // Optional for number of monthly subscriptions
    res = await payPortfolio(quantity),
    payData = res?.success ? res?.data : {},
    payTx = res?.success ? res?.data?.txs : [];
```

### Portfolio Payment
Optional: After user signs and sends payTxs, validate payment using user wallet address
```typescript
interface Payment {
    /** Unique identifier for the payment transaction */
    id: string;
    /** Timestamp of when the payment occurred */
    time: string;
    /** Product identifier orEmotional name */
    prod: string;
    /** Ethereum Virtual Machine address of the buyer */
    buyer: EVMAddress;
    /** Ethereum Virtual Machine address of the token used for payment */
    token: EVMAddress;
    /** Total payment amount */
    amount: string;
    /** Quantity of items purchased */
    qty: string;
    /** Amount actually paid */
    paid: string;
    /** Commission or fee associated with the payment */
    comm: string;
};

const 
    res = await payPortfolioValid(userWallet),
    paymentData: Payment | undefined =
         res?.success ? res?.data : undefined;
```

After payment is done you can mark payment as done
```typescript
config({ apiKey, hmacKey }); // required if not previously set

const 
    res = await payDone(userWallet, portId),
    paidDuration: number = res?.success ? res?.data : ``;
```

## Coinsets
### Coinsets All
All coin sets created `coinSetsAll(exchId)`
Optional `exchId` can be omitted to get all exchanges

### Coinset Options
Get a list of all possible token symbols `coinSetsOptions(exchId)`
Must define `exchId` since options vary for each exchange

### Coinset New
Create a new coin set and get coin set ID `coinSetsNew({ exchId, coinSet })`
Error return `{ e: 'symbols_insufficient' | '${symbol} symbol_invalid' }`

### Coinset Update
Update an existing coin set using coin set ID `coinSetsUpdate({ exchId, coinSetId, coinSet })`
Error return `{ e: 'symbols_insufficient' | '${symbol} symbol_invalid' }`

### Coinset Delete
Delete an existing coin set using coin set ID `coinSetsDelete({ exchId, coinSetId })`
Returns `coinSetId` as confirmation

### Coinset Backtest
Backtest an existing coin set using coin set array `coinSetBackTest(coinSet)`
Returns `CoinSetBackTestResult` data
Error return `{e: 'coinset_backtest_unavailable' }`

### Coinset All Backtests
Backtest an existing coin set using coin set array `coinSetsAllBackTest(exchId)`
Returns `CoinSetBackTestObj` data