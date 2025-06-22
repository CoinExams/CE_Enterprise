import { ChainIds, MerchantConfigParams } from "merchantslate";

interface CEConfig extends MerchantConfigParams {
    apiKey?: string,
    hmacKey?: string,
    payId?: string,
    payChain?: ChainIds,
    payRPC?: string,
    consoleLogEnabled?: boolean
}

interface ErrorCodes {
    unknown: string,
    exchange_id_invalid: string,
    exchange_no_options: string,
    symbols_insufficient: string,
    symbol_invalid: string,
    invalid_coinset_id: string,
    not_prepaid: string,
    invalid_inputs: string,
    duplicate_payment: string,
    invalid_payment: string,
    no_trades: string,
    access_expired: string,
    api_invalid: string,
    api_renew: string,
    max_port_reached: string,
    port_delete_failed: string,
    last_port_error: string,
    coinset_backtest_unavailable: string
};

type ErrorCodeString = keyof ErrorCodes;

interface ErrorResponse {
    success: false;
    e: ErrorCodeString;
    errorMsg: string;
};

interface SuccessResponse<T> { success: true, data: T }

type Result<T> = SuccessResponse<T> | ErrorResponse;

type ResultPromise<T> = Promise<Result<T>>;

/** SDK configuration */
interface ConfigSDK extends MerchantConfigParams {
    /** API Key */
    apiKey: string,
    /** HMAC key */
    hmacKey: string,
    /** Log errors */
    consoleLogEnabled: boolean,
    /** Payment Id */
    payId?: string,
    /** payment chain */
    payChain?: ChainIds,
};

/** API Basics */
interface APIBasics {
    /** Client Name */
    clientName: string,
    /** Pay Chain */
    payChain?: `BSC`,
    /** Pay Id */
    payId?: string,
    /** max allowed user portfolio count */
    maxPorts: number,
    /** reference currency */
    cur: string,
    /** fee per portfolio */
    fee: number,
    /** paused */
    paused?: boolean,
    /** number of portfolios */
    portfolios: number,
}

/** API info */
interface APIInfo extends APIBasics {
    /** time requested */
    requested: number,
    /** time updated */
    updated: number,
}

/** API specifications */
interface APISpecs extends APIInfo {
    /** Client Id (User Account DB Id) */
    clientId: string,
    /** Client Name */
    clientName: string,
    /** API hmac EN */
    hmacEN: string,
}

/** client payments */
interface ClientPayments {
    amount: number,
    coin: string,
    time: number,
}

/** Exchanges Ids */
type ExchIds = `binance`;

/** Exchange user data */
interface ExchData {
    /** holdings on exchange */
    holdings: {
        [exchId: string]: `api_renew` | `api_invalid` | {
            [sy: string]: number,
        },
    },
    /** positive numbers for buy, negative for sell */
    trades?: {
        [exchId: string]: {
            [sy: string]: number,
        },
    },

    /** Time traded last ms */
    lastTraded?: number,

    /** Next trade check ms */
    nextCheck: number,

    /** exchange Id */
    exchId?: ExchIds,
}

/** Exchange data all users */
interface ExchDataAll {
    [portId: string]: ExchData
}

/** Exchange Holdings */
interface ExchangeHoldings {
    [sy: string]: number
}

/** Portfolio Settings */
interface PortSettings {
    /** 1 trade on | 0 trade off */
    rb?: 1 | 0,

    /** coins included list */
    lst?: string[],

    /** wallets holdings outside exchange, example { BTC: 0.01 } */
    wal?: { [sy: string]: number },

    /** manual distribution percentage, example for 50% { BTC: 50 } */
    man?: { [sy: string]: number },

    /** coinset Id */
    coinSetId?: string,

    /** exchange keyIds */
    keyIds?: { [exchId: string]: string },

    /** paid */
    paid?: number,
};

/** Portfolio ID return */
interface PortfolioId {
    /** Portfolio Id String */
    portId: string,
}

/** Portfolio Update */
interface PortfolioUpdate {
    /** Portfolio Id */
    portId: string,
    /** Portfolio Settings */
    portSettings: PortSettings,
}

/** Portfolio Settings All */
interface PortSettingsAll {
    [portId: string]: PortSettings
}

/** Portfolio Settings All Stringified */
interface PortSettingsAllString {
    [portId: string]: string
}

/** Portfolio Exchange API */
interface PortfolioExchAPI {
    /** Portfolio Id */
    portId: string,
    /** exchange Id */
    exchId: ExchIds,
    /** exchange API key 1 */
    key1: string,
    /** exchange API key 2 */
    key2: string,
}

/** Portfolio Exchange API Return */
interface PortfolioExchAPIReturn {
    /** Portfolio Id */
    portId: string,
    /** holdings on exchange */
    holdings: ExchangeHoldings,
    /** Exchange keys Ids */
    keyIds: {
        [exchId: string]: string
    },
}

/** New Coinset */
interface CoinsetNew {
    /** exchange Id */
    exchId: ExchIds,
    /** example [`BTC`,`ETH`], minimum two symbols */
    coinSet: string[],
}

/** Delete Coinset */
interface CoinsetDelete {
    /** exchange Id */
    exchId: ExchIds,
    /** Coin Set Id String */
    coinSetId: string,
}

/** Coinset Update */
interface CoinsetUpdate {
    /** exchange Id */
    exchId: ExchIds,
    /** Coin Set Id String */
    coinSetId: string,
    /** example [`BTC`,`ETH`], minimum two symbols */
    coinSet: string[],
}

interface CoinsetObj {
    [coinSetId: string]: string[]
}

/** Coinsets Data */
interface CoinsetsData {
    [exchId: string]: CoinsetObj
}

/** Coinset Id return */
interface CoinsetId {
    /** Coin Set Id String */
    coinSetId: string,
}

/** Coinset Error */
type CoinsetError<sy extends string> = `${sy} symbol_invalid`;

/** trade start and end */
interface TradeStartEnd {
    start: number,
    end: number
}

/** trade start and end object */
interface TradeStartEndObj {
    [sy: string]: TradeStartEnd
}

interface NumberObj {
    [key: string]: number
};

/** Chart BackTest Result */
interface CoinSetBackTestResult {
    pointsCount: number;
    historyPoints: number[];
    gainPoints: number[];
    totalChangesObj: TradeStartEndObj;
    endQtyRef: NumberObj;
    gainRate: number;
    gainValue: number;
}

export {
    // configuration
    CEConfig,
    ErrorCodes,
    ErrorCodeString,
    ErrorResponse,
    SuccessResponse,
    ResultPromise,
    ConfigSDK,
    APISpecs,
    ClientPayments,

    // exchanges
    ExchIds,
    ExchData,
    ExchDataAll,
    ExchangeHoldings,

    // portfolios
    PortSettings,
    PortfolioId,
    PortfolioUpdate,
    PortSettingsAll,
    PortSettingsAllString,
    PortfolioExchAPI,
    PortfolioExchAPIReturn,

    // coinsets
    CoinsetNew,
    CoinsetDelete,
    CoinsetUpdate,
    CoinsetObj,
    CoinsetsData,
    CoinsetId,
    CoinsetError,

    // coinsets back-test
    TradeStartEnd,
    TradeStartEndObj,
    CoinSetBackTestResult,
};