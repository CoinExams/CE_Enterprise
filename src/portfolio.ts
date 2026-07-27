import { rNum } from "@degreesign/utils";
import {
    invalidStr,
    logErr,
    requestFun,
    fileData,
} from "./config";
import { eRes, fullRes } from "./response";
import {
    coinSetsAll,
    coinSetBackTest,
} from "./coinsets";
import {
    NumberObj,
    PortfolioExchAPI,
    PortSettings,
    ExchDataAll,
    ExchDataAllPrices,
    PortSettingsAll,
    PortSettingsAllString,
    PortfolioUpdate,
    PortfolioExchAPIReturn,
    PortfolioId,
    ResultPromise,
    ServerResponseData,
    ExchSupported,
    PortfolioCoinSetTradingData,
} from "./types";

const

    /** 
     * Portfolios Settings :
     * Latest settings for all portfolios
     * or pass a single portfolio portfolio Id portId for specific data
     * @returns empty object when no portfolios
     * */
    portfolioData = async (
        /** Portfolio Id (optional) */
        portId?: string
    ): ResultPromise<PortSettingsAll> => {
        const endPoint = `portfolios/all`;
        try {
            const
                res = await requestFun(
                    endPoint,
                    invalidStr([portId]) ? undefined
                        : { portId }
                ),
                usersRaw: PortSettingsAllString = res?.users;

            if (!usersRaw)
                return eRes(res?.e);

            const data: PortSettingsAll = {};
            for (const portId in usersRaw)
                data[portId] = JSON.parse(usersRaw[portId])
            return fullRes(res, data);
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Portfolios Trades :
     * Latest trades for all portfolios
     * or pass a single portfolio portfolio Id portId for specific data
     * @returns empty object when no trades
     * */
    portfolioTrades = async (
        /** Portfolio Id (optional) */
        portId?: string
    ): ResultPromise<ExchDataAll> => {
        const endPoint = `portfolios/trades`;
        try {
            const res = await requestFun(
                endPoint,
                invalidStr([portId]) ? undefined
                    : { portId }
            );
            return fullRes(res, res?.exchanges)
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Portfolio Trades Prices :
     * Latest trades for all portfolios with all coin prices
     * or pass a single portfolio portfolio Id portId for specific data
     * @returns empty object when no trades
     * */
    portfolioTradesPrices = async ({
        portId,
        currencyISO,
    }: {
        portId?: string,
        currencyISO: string,
    }): ResultPromise<ExchDataAllPrices> => {
        const endPoint = `portfolioTradesPrices`;
        try {
            const
                [tradesRes, srvData]: [
                    Awaited<ReturnType<typeof portfolioTrades>>,
                    ServerResponseData,
                ] = await Promise.all([
                    portfolioTrades(portId),
                    fileData({
                        folderPath: ``,
                        fileName: `data`,
                        msInterval: 2e3,
                    }),
                ]);

            if (!tradesRes?.success) return eRes(tradesRes?.e);
            if (!srvData?.coins) return eRes(`prices_unavailable`);

            const
                prices: NumberObj = {},
                currencyRate = srvData?.rates?.current?.[currencyISO];
            if (!currencyRate) return eRes(`currency_not_supported`);

            for (const sy in srvData.coins)
                prices[sy] = rNum(srvData.coins[sy].pr * currencyRate, 6);

            return {
                success: true,
                data: {
                    data: tradesRes.data,
                    prices,
                },
            };
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Portfolio Trading Totals :
     * Trading totals per portfolio based on coinSet used
     * @returns object portId keyed with totals
     * */
    portfolioTradingTotals = async ({
        portId,
        currencyISO,
    }: {
        portId?: string,
        currencyISO: string,
    }): ResultPromise<PortfolioCoinSetTradingData> => {
        const endPoint = `portfolioTradingTotals`;
        try {

            const
                [settingsRes, tradesPricesRes, ...coinSetsResults]: [
                    Awaited<ReturnType<typeof portfolioData>>,
                    Awaited<ReturnType<typeof portfolioTradesPrices>>,
                    ...Awaited<ReturnType<typeof coinSetsAll>>[],
                ] = await Promise.all([
                    portfolioData(portId),
                    portfolioTradesPrices({ portId, currencyISO }),
                    ...ExchSupported.map(exchId => coinSetsAll(exchId)),
                ]);

            if (!settingsRes?.success) return eRes(settingsRes?.e);
            if (!tradesPricesRes?.success) return eRes(tradesPricesRes?.e);

            const
                settings = settingsRes.data,
                { prices, data: tradesData } = tradesPricesRes.data,
                coinSetSymbols: { [coinSetId: string]: string[] } = {},
                result: PortfolioCoinSetTradingData = {},
                uniqueCoinSets: { [coinSetId: string]: string[] } = {},
                coinSetGain: { [coinSetId: string]: { d7: number, d30: number, y1: number } } = {};

            for (const coinSetsRes of coinSetsResults)
                if (coinSetsRes?.success && coinSetsRes.data)
                    Object.assign(coinSetSymbols, coinSetsRes.data);

            for (const pid in settings) {
                const coinSetId = settings[pid]?.coinSetId;
                if (coinSetId && coinSetSymbols[coinSetId])
                    uniqueCoinSets[coinSetId] = coinSetSymbols[coinSetId];
            };

            const
                ids = Object.keys(uniqueCoinSets),
                results = await Promise.all(
                    ids.map(id => coinSetBackTest(uniqueCoinSets[id]))
                );

            for (let i = 0; i < ids.length; i++) {
                const
                    id = ids[i],
                    res = results[i];
                coinSetGain[id] = { d7: 0, d30: 0, y1: 0 };
                if (!res?.success || !res.data?.gainPoints?.length) continue
                const
                    gp = res.data.gainPoints,
                    ptsPerWeek = Math.max(1, Math.floor(gp.length / 52)),
                    ptsPerMonth = Math.max(1, Math.floor(gp.length / 12)),
                    idx = gp.length - 1,
                    startIdx7 = idx - ptsPerWeek,
                    startIdx30 = idx - ptsPerMonth;
                if (startIdx30 >= 0 && gp[startIdx30] > 0)
                    coinSetGain[id] = {
                        d7: startIdx7 >= 0 && gp[startIdx7] > 0
                            ? ((gp[idx] - gp[startIdx7]) / gp[startIdx7]) * 100
                            : 0,
                        d30: ((gp[idx] - gp[startIdx30]) / gp[startIdx30]) * 100,
                        y1: gp[0] > 0
                            ? ((gp[idx] - gp[0]) / gp[0]) * 100
                            : 0,
                    };
            };

            for (const pid in settings) {

                let
                    totalTrading = 0,
                    totalHoldingsValue = 0;

                const
                    portSettings = settings[pid],
                    coinSetId = portSettings?.coinSetId,
                    coinSet = coinSetId ? coinSetSymbols[coinSetId] : undefined,
                    isTrading = !!portSettings?.rb && (portSettings?.paid ?? 0) > Date.now(),
                    portTrades = tradesData[pid];

                if (portTrades?.holdings)
                    for (const exchIdKey in portTrades.holdings) {
                        const exchHoldings = portTrades.holdings[exchIdKey];
                        if (typeof exchHoldings === `string`) continue;

                        for (const sy in exchHoldings) {
                            const price = prices[sy];
                            if (!price) continue;

                            const value = exchHoldings[sy] * price;
                            totalHoldingsValue += value;

                            if (isTrading && coinSet?.includes(sy))
                                totalTrading += value;
                        };
                    };

                const gain = coinSetId ? coinSetGain[coinSetId] : undefined;
                result[pid] = {
                    totalTrading: rNum(totalTrading, 4),
                    totalAvailable: rNum(totalHoldingsValue - totalTrading, 4),
                    totalChange7Days: rNum(gain ? totalTrading * (gain.d7 / 100) : 0, 4),
                    totalChange30Days: rNum(gain ? totalTrading * (gain.d30 / 100) : 0, 4),
                    totalChange1Year: rNum(gain ? totalTrading * (gain.y1 / 100) : 0, 4),
                };
            };

            return {
                success: true,
                data: result,
            };
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Portfolio New :
     * Create a new portfolio and get portfolio ID
     * @returns new portfolio id string
     * */
    portfolioNew = async (
        /** Portfolio Settings (optional) */
        portSettings?: PortSettings
    ): ResultPromise<string> => {
        const endPoint = `portfolios/add`;
        try {
            const
                settings = !portSettings ? undefined
                    : JSON.stringify(portSettings),
                res: PortfolioId = await requestFun(
                    endPoint,
                    invalidStr([settings]) ? undefined
                        : { settings }
                );
            return fullRes(res, res?.portId);
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Portfolio Update :
     * Update an existing portfolio using portfolio ID
     * @returns portfolio id string
     * */
    portfolioUpdate = async ({
        portId,
        portSettings,
    }: PortfolioUpdate): ResultPromise<string> => {
        const endPoint = `portfolios/update`;
        try {

            const settings = !portSettings ? undefined
                : JSON.stringify(portSettings);

            if (invalidStr([portId, settings]))
                return eRes(`invalid_inputs`);

            const res: PortfolioId = await requestFun(
                endPoint,
                {
                    portId,
                    settings
                }
            );
            return fullRes(res, res?.portId)
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Portfolio Exchange APIs :
     * Add or update exchange API keys for a given exchange
     * @returns portfolio id string and holdings on exchange
     * */
    portfolioExchAPI = async ({
        portId,
        exchId,
        key1,
        key2,
    }: PortfolioExchAPI): ResultPromise<PortfolioExchAPIReturn> => {
        const endPoint = `portfolios/api`;
        try {

            if (invalidStr([key1, key2]))
                return eRes(`api_invalid`);

            if (invalidStr([portId, exchId]))
                return eRes(`invalid_inputs`);

            const
                res: PortfolioExchAPIReturn =
                    await requestFun(
                        endPoint,
                        {
                            portId,
                            exchId,
                            k1: key1,
                            k2: key2
                        }
                    ),
                data: PortfolioExchAPIReturn = {
                    portId: res?.portId,
                    holdings: res?.holdings,
                    keyIds: res?.keyIds,
                };
            return fullRes(res, data);
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Portfolio Delete :
     * Delete an existing portfolio using portfolio ID
     * @returns portfolio id string
     * */
    portfolioDelete = async (
        /** Portfolio Id */
        portId: string,
    ): ResultPromise<string> => {
        const endPoint = `portfolios/delete`;
        try {
            const res: PortfolioId = invalidStr([portId]) ? undefined
                : await requestFun(
                    endPoint,
                    { portId }
                );
            return fullRes(res, res?.portId);
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    };

export {
    portfolioData,
    portfolioTrades,
    portfolioTradesPrices,
    portfolioTradingTotals,
    portfolioNew,
    portfolioUpdate,
    portfolioExchAPI,
    portfolioDelete,
};