
## CoinExams SDK - Raw Setup

### Change Log
* [22 June 2025 - coinSetBackTest added](changes.md#22-june-2025)
* [5 May 2025 - payPortfolioValid return updated](changes.md#5-may-2025)
* [25 April 2025 - payPortfolio parameters updated](changes.md#25-april-2025)
* [21 April 2025 - portSettings interface updated](changes.md#21-april-2025)
* [15 April 2025 - ExchData interface updated](changes.md#15-april-2025)
* [5 April 2025 - ExchIds type updated](changes.md#5-april-2025)

### Base URL
```
const baseURL = `https://api.coinexams.com/v1/`;
```
### Request Signed
```
import { createHmac } from "node:crypto";
import fetch from "node-fetch";

const
    baseURL: string = `https://api.coinexams.com/v1/`,
    key: string = `API Key`,
    hmacKey: string = `API HMAC Key`,
    requestFunction = async (
        endPoint: string,
        reqParm?: any
    ) => {
        const
            body = {
                key,
                ...reqParm || {}
            },
            signature = createHmac(`sha256`, hmacKey)
                .update(JSON.stringify(body))
                .digest(`hex`),
            res = await fetch(
                baseURL + endPoint,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...body,
                        signature
                    })
                }
            ),
            result: any = await res.json();

        // request error
        if (result?.e) console.log(`error`, result.e);

        // request success
        else return await result;
    };
```

## Data Types
### Exchange Ids
```
type exchIds = `binance`
```
### Portfolio Settings
```
interface portSettings {
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

	/** exchange Id */
	exchId?: exchIds,

	/** exchange keyIds */
    keyIds?: { [exchId: string]: string },

    /** paid */
    paid?: number,
}
```
### Exchange Data
```
interface ExchData {
    /** holdings on exchanges */
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
   	exchId?: exchIds,
}
```

### Payment Required EVM Transactions
```
interface PayTxsData {
	/** Payment Chain Id */
	chainId: string;
	/** Payment Token */
    token: {
		address: string;
		name: string;
		symbol: string;
		decimals: number;
	};
	/** Payment Amount */
    amount: string;
	/** Payment Required Transactions 
	* (Approval + Transfer)
	*/
    txs: {
		to: string;
		data: string;
		value?: string;
	}[];
}
```

## Endpoints
Manage all portfolios created using API in your managing account

### Portfolios Settings
Latest settings for all portfolios

endPoint `portfolios/all`
```
body: {
	/** Portfolio Id String */
	portId?: string
}

response: {
	users: {
		[portId: string]: JSON.stringify(portSettings)
	}
}
```

### Portfolios Trades
Latest trades for all portfolios

endPoint `portfolios/trades`
```
body: {
	/** Portfolio Id String */
	portId?: string
}

response: {
	exchanges: {
		[portId: string]: ExchData
	}
}

error: { e: `no_trades` | `access_expired` }
```
Note: for `access expired` please contact support to renew API access

### Portfolio New
Create a new portfolio and get portfolio ID

endPoint `portfolios/add`
```
body: {
	/** Portfolio Settings Stringified */
	settings?: JSON.stringify(portSettings),
}

response: {
	/** Portfolio Id String */
	portId: string,
}
```

### Portfolio Update
Update an existing portfolio using portfolio ID

endPoint `portfolios/update`
```
body: {
	/** Portfolio Id String */
	portId: string,

	/** Portfolio Settings Stringified */
	settings: JSON.stringify(portSettings),
}

response: {
	/** Portfolio Id String */
	portId: string,
}
```

### Portfolio Pay Transactions
Portfolio subscription payment required transaction data

endPoint `portfolios/paytxs`
```
body: {
	/** Quantity (1 == One Month Validity) */
	quantity?: string
}

response: {
	/** Payment Required Transactions */
	txs: PayTxsData,
}
```

### Portfolio Pay
Pay portfolio subscription and extend validity

endPoint `portfolios/pay`
```
body: {
	/** Paying Wallet */
	payingWallet: string,
}

response: {
	/** Portfolio Validity Period (Expiry Date in ms) */
	paid: number,
}
```

### Portfolio Exchange APIs
Add or update exchange API keys for a given exchange

endPoint `portfolios/api`
```
body: {
	/** Portfolio Id String */
	portId: string,

	/** exchange Id */
	exchId: exchIds,

	/** exchange API key 1 */
	k1: Exchange_API_Key,

	/** exchange API key 2 */
	k2: Exchange_API_Secret,
}

response: {
	/** Portfolio Id String */
	portId: string,

	/** holdings on exchange */
	holdings: { [sy: string]: number },

	/** Exchange keys Ids */
	keyIds: { [exchId: ExchIds]: string },
}

error: { e: `api_renew` | `api_invalid` }
```

### Portfolio Delete
Delete an existing portfolio using portfolio ID

endPoint `portfolios/delete`
```
body: {
	/** Portfolio Id String */
	portId: string,
}

response: {
	/** Portfolio Id String */
	portId: string,
}
```

### Coin Sets
All coin sets created

endPoint `coinsets/all`
```
body: {
	/** exchange Id */
	exchId: exchIds
}

response: {
	[exchId: exchIds]: {
		[coinSetId: string]: string[] // example [`BTC`,`ETH`]
	}
}
```

### Coin Set Options
Get a list of all possible token symbols

endPoint `coinsets/options`
```
body: {
	/** exchange Id */
	exchId: exchIds
}

response: {
	options: string[], // example [`BTC`,`ETH`]
}
```

### Coin Set New
Create a new coin set and get coin set ID

endPoint `coinsets/add`
```
body: {
	/** exchange Id */
	exchId: exchIds,

	/** example [`BTC`,`ETH`], minimum two symbols */
	coinSet: string[],
}

response: {
	/** Coin Set Id String */
	coinSetId: string,
}

error: { e: `symbols_insufficient` | `${symbol} symbol_invalid` }
```

### Coin Set Update
Update an existing coin set using coin set ID

endPoint `coinsets/update`
```
body: {
	/** exchange Id */
	exchId: exchIds,

	/** Coin Set Id String */
	coinSetId: string,

	/** example [`BTC`,`ETH`], minimum two symbols */
	coinSet: string[],
}

response: {
	/** Coin Set Id String */
	coinSetId: string,
}

error: { e: `symbols_insufficient` | `${symbol} symbol_invalid` }
```

### Coin Set Delete
Delete an existing coin set using coin set ID

endPoint `coinsets/delete`
```
body: {
	/** exchange Id */
	exchId: exchIds,

	/** Coin Set Id String */
	coinSetId: string,
}

response: {
	/** Coin Set Id String */
	coinSetId: string,
}
```