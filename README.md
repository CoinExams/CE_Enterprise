# CoinExams Enterprise

**CoinExams Enterprise is a TypeScript SDK for building and automating cryptocurrency portfolios — create and manage portfolios, connect Binance and KuCoin exchange APIs, backtest coin sets, and process on-chain subscription payments from Node.js and the browser.**

[![npm version](https://img.shields.io/npm/v/@coinexams/enterprise.svg)](https://www.npmjs.com/package/@coinexams/enterprise)
[![npm downloads](https://img.shields.io/npm/dm/@coinexams/enterprise.svg)](https://www.npmjs.com/package/@coinexams/enterprise)
[![license](https://img.shields.io/npm/l/@coinexams/enterprise.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A518-339933.svg)](https://nodejs.org/)
[![Browser](https://img.shields.io/badge/browser-UMD%20bundle-blue.svg)](#browser-cdn)

> [!NOTE]
> This package is a continuation of the now deprecated [`coinexams`](https://www.npmjs.com/package/coinexams).

## Table of Contents

- [What is CoinExams Enterprise?](#what-is-coinexams-enterprise)
- [Why use this SDK?](#why-use-this-sdk)
- [Installation](#installation)
  - [Node.js / bundlers](#nodejs--bundlers)
  - [Browser CDN](#browser-cdn)
- [Quick Start](#quick-start)
  - [1. Configure your API keys](#1-configure-your-api-keys)
  - [2. Create a portfolio](#2-create-a-portfolio)
  - [3. Read portfolio data and trades](#3-read-portfolio-data-and-trades)
  - [4. Backtest a coin set](#4-backtest-a-coin-set)
  - [5. Pay for a portfolio subscription on-chain](#5-pay-for-a-portfolio-subscription-on-chain)
- [API Reference](#api-reference)
  - [Configuration](#configuration)
  - [Portfolios](#portfolios)
  - [Payments](#payments)
  - [Coin Sets](#coin-sets)
  - [Backtesting](#backtesting)
  - [Types](#types)
- [Error Codes](#error-codes)
- [FAQ](#faq)
- [Keywords](#keywords)
- [Docs](#docs)
- [Change Log](#change-log)
- [License](#license)

## What is CoinExams Enterprise?

CoinExams Enterprise gives you programmatic access to the [CoinExams](https://coinexams.com) portfolio automation platform. Every request is an HMAC-SHA256 authenticated `POST` to `https://api.coinexams.com/v1/`, signed with your API key and HMAC key, and returns a typed `Result<T>` of either `{ success: true, data }` or `{ success: false, e, errorMsg }`.

The SDK covers the whole lifecycle:

- **Portfolios** — create, update, delete, and read settings, holdings, and trades, with prices converted to any supported fiat currency and trading totals per coin set.
- **Exchange APIs** — connect and refresh Binance and KuCoin API keys per portfolio.
- **Coin sets** — list, create, update, and delete basket definitions, plus list exchange-specific symbol options.
- **Backtesting** — run historical backtests for a coin set or every coin set on an exchange.
- **On-chain payments** — request EVM payment transactions, validate the paying wallet, and extend a portfolio's subscription.
- **Market data** — exchange rates, index data, and crypto coin prices from the CoinExams data server.

## Why use this SDK?

- **Minimal implementation effort** — configure once, then call typed async functions; no manual HMAC signing or payload shaping.
- **Node.js and browsers** — ships a CommonJS build for Node and a UMD build for the browser, from one package.
- **Fully typed** — written in TypeScript with bundled declaration files for autocompletion and compile-time safety.
- **Predictable results** — every call resolves to `{ success: true, data }` or `{ success: false, e, errorMsg }`, with documented error codes.
- **Built for automation** — portfolio creation, rebalancing data, backtesting, and subscription management are all scriptable.
- **CCXT-aligned exchange IDs** — exchange identifiers follow the unified `ccxt` naming (`binance`, `kucoin`).

## Installation

### Node.js / bundlers

```bash
npm install @coinexams/enterprise
```

```bash
yarn add @coinexams/enterprise
```

```bash
pnpm add @coinexams/enterprise
```

```typescript
import { config, portfolioData, portfolioTrades } from "@coinexams/enterprise";
```

The package bundles its runtime dependencies, so no additional polyfills or peer installs are required.

### Browser CDN

Load the UMD build directly and use the global `coinexams` object:

```html
<script src="https://cdn.jsdelivr.net/npm/@coinexams/enterprise@1.3.9/dist/browser/coinexams.min.js"></script>
<script>
    const { config, portfolioData } = coinexams;
</script>
```

## Quick Start

### 1. Configure your API keys

Get your API key and HMAC key from CoinExams, then configure the SDK once. `config` also validates the keys against the API.

```typescript
import { config, getConfig } from "@coinexams/enterprise";

await config({
    apiKey: "YOUR_API_KEY",
    hmacKey: "YOUR_HMAC_KEY",
});

// Inspect the active configuration at any time
console.log(getConfig());
```

Disable SDK console logging when you do not want request errors printed:

```typescript
await config({ consoleLogEnabled: false });
```

### 2. Create a portfolio

```typescript
import { portfolioNew, portfolioExchAPI } from "@coinexams/enterprise";

// Optional settings; omit to use server defaults
const res = await portfolioNew({
    rb: 1,                      // 1 = trading on, 0 = off
    lst: ["BTC", "ETH"],        // coins included
    man: { BTC: 50, ETH: 50 },  // manual distribution %
});

if (res.success) {
    const portId = res.data;    // new portfolio Id

    // Connect exchange API keys for that portfolio
    await portfolioExchAPI({
        portId,
        exchId: "binance",
        key1: "EXCHANGE_API_KEY",
        key2: "EXCHANGE_API_SECRET",
    });
}
```

### 3. Read portfolio data and trades

```typescript
import {
    portfolioData,
    portfolioTrades,
    portfolioTradesPrices,
    portfolioTradingTotals,
} from "@coinexams/enterprise";

// Latest settings for all portfolios, or pass a portId for one
const settings = await portfolioData();

// Latest trades for all portfolios, or one
const trades = await portfolioTrades("PORTFOLIO_ID");
if (!trades.success) console.log(trades.e, trades.errorMsg);

// Trades enriched with coin prices in a fiat currency
const prices = await portfolioTradesPrices({
    portId: "PORTFOLIO_ID",
    currencyISO: "EUR",
});

// Trading totals per portfolio based on the coin set in use
const totals = await portfolioTradingTotals({ currencyISO: "USD" });
```

### 4. Backtest a coin set

```typescript
import { coinSetBackTest, coinSetsAllBackTest } from "@coinexams/enterprise";

// Backtest one basket of at least two symbols
const result = await coinSetBackTest(["BTC", "ETH"]);
if (result.success) {
    console.log(result.data.gainRate, result.data.gainValue);
}

// Backtest every coin set on an exchange
const all = await coinSetsAllBackTest("binance");
```

### 5. Pay for a portfolio subscription on-chain

Payment is a two-step flow: request the EVM transactions, then validate and register the signed payment.

```typescript
import {
    config,
    ChainIdsEnum,
    payPortfolio,
    payPortfolioValid,
    payDone,
} from "@coinexams/enterprise";

await config({
    payId: "12345678",                    // your Pay Id as a string
    payChain: ChainIdsEnum.BSC,           // EVM payment chain
    payRPC: "https://your-rpc-url",       // string or string[] fallbacks
});

// 1. Request required transactions (approval + transfer)
const quantity = "1";                     // months
const payRes = await payPortfolio(quantity);
const txs = payRes.success ? payRes.data.txs : [];

// The user signs and sends `txs`, then:
const valid = await payPortfolioValid("0xUserWalletAddress");
const payment = valid.success ? valid.data : undefined;

// 2. Mark the payment as done and extend the portfolio
const done = await payDone("0xUserWalletAddress", "PORTFOLIO_ID");
const paidUntilMs = done.success ? done.data : undefined;
```

## API Reference

Every function returns `Promise<Result<T>>`, where `Result<T>` is `{ success: true, data: T }` or `{ success: false, e, errorMsg }`. `await` all calls. Exchange IDs follow the unified `ccxt` standard.

### Configuration

| Function | Description | Parameters | Returns |
| --- | --- | --- | --- |
| `config(options)` | Configure API keys, payment details, RPC URLs, and logging. Validates keys when `apiKey`/`hmacKey` are supplied. | `CEConfig` — `apiKey`, `hmacKey`, `payId`, `payChain`, `payRPC`, `consoleLogEnabled` | `Promise<void>` |
| `getConfig()` | Read the active SDK configuration. | — | `ConfigSDK` |
| `accountInfo()` | Fetch account info: client name, max portfolios, counts, reference currency, fee, pay chain and pay Id. | — | `ResultPromise<APISpecs>` |
| `accountPayments()` | List payments made by the account. | — | `ResultPromise<ClientPayments[]>` |
| `errorMsgs` | Map of every error code to a human-readable message. | — | `ErrorCodes` |
| `ChainIds` / `ChainIdsEnum` | Supported EVM chain identifiers for payments. | — | enum |
| `APISpecs` | Account specification shape returned by `accountInfo`. | — | type |

### Portfolios

| Function | Description | Parameters | Returns |
| --- | --- | --- | --- |
| `portfolioData(portId?)` | Latest settings for all portfolios, or one when `portId` is given. Empty object when there are none. | `portId?: string` | `ResultPromise<PortSettingsAll>` |
| `portfolioTrades(portId?)` | Latest trades (holdings plus net trades per exchange) for all portfolios, or one. | `portId?: string` | `ResultPromise<ExchDataAll>` |
| `portfolioTradesPrices({ portId?, currencyISO })` | Trades enriched with coin prices converted to the given fiat currency. | `portId?`, `currencyISO: string` | `ResultPromise<ExchDataAllPrices>` |
| `portfolioTradingTotals({ portId?, currencyISO })` | Trading totals, available balance, and 7-day/30-day/1-year change per portfolio, based on its coin set. | `portId?`, `currencyISO: string` | `ResultPromise<PortfolioCoinSetTradingData>` |
| `portfolioNew(portSettings?)` | Create a portfolio and return its new Id. Omit settings for defaults. | `portSettings?: PortSettings` | `ResultPromise<string>` |
| `portfolioUpdate({ portId, portSettings })` | Update an existing portfolio and return its Id as confirmation. | `portId`, `portSettings` | `ResultPromise<string>` |
| `portfolioExchAPI({ portId, exchId, key1, key2 })` | Add or update exchange API keys and return the resulting holdings and key IDs. | `portId`, `exchId`, `key1`, `key2` | `ResultPromise<PortfolioExchAPIReturn>` |
| `portfolioDelete(portId)` | Delete a portfolio and return its Id as confirmation. | `portId: string` | `ResultPromise<string>` |

`portfolioTrades` and `portfolioTradesPrices` can return `no_trades` or `access_expired`; `portfolioExchAPI` can return `api_renew` or `api_invalid`.

### Payments

| Function | Description | Parameters | Returns |
| --- | --- | --- | --- |
| `payPortfolio(quantity?)` | Request the EVM transactions (approval + transfer) required to pay for `quantity` months. | `quantity?: string` (default `"1"`) | `ResultPromise<PayTxsData>` |
| `payPortfolioValid(payingWallet)` | Validate a payment against the user's wallet address. | `payingWallet: EVMAddress` | `ResultPromise<Payment>` |
| `payDone(payingWallet, portId)` | Register the completed payment and extend the portfolio; returns the paid-until time in ms. | `payingWallet: string`, `portId: string` | `ResultPromise<number>` |
| `EVMAddress` | Valid EVM address type used by the payment functions. | — | type |

Payment functions require `payId` and `payChain` to be configured, otherwise they return `not_prepaid`.

### Coin Sets

| Function | Description | Parameters | Returns |
| --- | --- | --- | --- |
| `coinSetsAll(exchId?)` | All coin sets created, or all across exchanges when `exchId` is omitted. | `exchId?: ExchIds` | `ResultPromise<CoinsetObj>` |
| `coinSetsOptions(exchId)` | All possible token symbols for an exchange. `exchId` is required. | `exchId: ExchIds` | `ResultPromise<string[]>` |
| `coinSetsNew({ exchId, coinSet })` | Create a coin set (minimum two symbols) and return its Id. | `exchId`, `coinSet: string[]` | `ResultPromise<string>` |
| `coinSetsUpdate({ exchId, coinSetId, coinSet })` | Update an existing coin set and return its Id as confirmation. | `exchId`, `coinSetId`, `coinSet` | `ResultPromise<string>` |
| `coinSetsDelete({ exchId, coinSetId })` | Delete a coin set and return its Id as confirmation. | `exchId`, `coinSetId` | `ResultPromise<string>` |

Coin set mutations can return `symbols_insufficient`, `<SYMBOL> symbol_invalid`, or `invalid_inputs`.

### Backtesting

| Function | Description | Parameters | Returns |
| --- | --- | --- | --- |
| `coinSetBackTest(coinSet)` | Backtest a basket of at least two symbols. | `coinSet: string[]` | `ResultPromise<CoinSetBackTestResult>` |
| `coinSetsAllBackTest(exchId)` | Backtest every coin set on an exchange, keyed by coin set Id. | `exchId: ExchIds` | `ResultPromise<CoinSetBackTestObj>` |

Backtests can return `coinset_backtest_unavailable`.

### Types

| Type | Description |
| --- | --- |
| `PortSettings` | Portfolio settings: `rb`, `lst`, `wal`, `man`, `coinSetId`, `keyIds`, `paid`. |
| `ExchIds` / `ExchSupported` | Supported exchange IDs (currently `binance`, `kucoin`). |
| `ExchData` / `ExchDataAll` | Holdings and trades for a portfolio, keyed by exchange. |
| `ExchDataAllPrices` | `ExchDataAll` plus a symbol-to-price map. |
| `PortfolioCoinSetTrading` / `PortfolioCoinSetTradingData` | Per-portfolio trading totals. |
| `PortfolioExchAPI` / `PortfolioExchAPIReturn` | Exchange API request and holdings response. |
| `CoinsetObj` / `CoinsetsData` | Coin set symbol lists, per exchange. |
| `CoinSetBackTestResult` / `CoinSetBackTestObj` | Backtest chart data and per-coin-set results. |
| `PayTxsData` | Required payment transactions and token details. |
| `ServerResponseData` / `ServerCoinData` | Market data: rates, indexes, and coin prices. |

## Error Codes

Failures resolve to `{ success: false, e, errorMsg }`. The most common codes:

| Code | Meaning |
| --- | --- |
| `invalid_inputs` | Invalid request payload. |
| `api_invalid` / `api_renew` | Exchange API keys are invalid or need renewal. |
| `no_trades` | The portfolio has no trades. |
| `access_expired` | API access expired; contact support to renew. |
| `symbols_insufficient` | A coin set needs at least two symbols. |
| `coinset_backtest_unavailable` | No backtest is available for the coin set. |
| `currency_not_supported` / `prices_unavailable` | Fiat currency invalid, or prices unavailable. |
| `not_prepaid` | The API account is not prepaid; contact support. |

Import `errorMsgs` for the full list of codes and their messages.

## FAQ

**What is CoinExams Enterprise?**
A TypeScript SDK for the CoinExams portfolio automation platform. It lets you create and manage crypto portfolios, connect exchange APIs, backtest coin sets, and process on-chain subscription payments.

**Is it free?**
The SDK itself is free and MIT-licensed. Using the CoinExams API requires an API account, and portfolio subscriptions are billed on-chain per month (`quantity` is the number of months).

**Does it work in Node.js and the browser?**
Yes. The package ships a CommonJS build for Node.js and a UMD build for the browser, plus bundled TypeScript declarations for both.

**Do I need to install dependencies manually?**
No. Runtime dependencies are bundled into both builds, so `npm install @coinexams/enterprise` is all you need.

**Is it TypeScript-first?**
Yes. The SDK is written in TypeScript and ships `.d.ts` declarations, so you get full autocompletion and type checking.

**Does it work with React, Vue, Next.js, or other frameworks?**
Yes. It is framework-agnostic: import it in any Node.js or browser environment, or load the UMD bundle from a CDN.

**How are requests authenticated?**
Each request is a `POST` signed with HMAC-SHA256 using your API key and HMAC key. `config()` handles the signing for you.

**Which exchanges are supported?**
Binance and KuCoin (`binance`, `kucoin`), following the unified `ccxt` exchange ID standard.

## Keywords

CoinExams, CoinExams Enterprise, crypto portfolio SDK, crypto portfolio builder, cryptocurrency portfolio management, portfolio automation, crypto assets management, portfolio rebalancing, crypto backtesting, coin sets, Binance API, KuCoin API, ccxt, EVM payments, BSC, on-chain payments, web3, TypeScript SDK, Node.js, browser SDK, HMAC API.

## Docs

- [SDK — Raw Setup](docs.md)

## Change Log

- [Change Log](changes.md)

## License

[MIT](LICENSE) © CoinExams
